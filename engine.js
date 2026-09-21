/* SettleUp engine - shared-expense math, pure functions.
   The problem: 6 people, 9 shared expenses, and a web of who-owes-whom.
   The fix: net everyone's position, then match biggest creditor with biggest
   debtor until nothing remains - the fewest transfers possible. */
(function (global) {
  'use strict';

  function cents(x) { return Math.round(x * 100); }
  function dollars(c) { return Math.round(c) / 100; }

  // expenses: [{paidBy, amount, among:[names]}] -> net position per person in cents.
  // Positive = is owed money. Negative = owes.
  function balances(people, expenses) {
    var net = {};
    people.forEach(function (p) { net[p] = 0; });
    expenses.forEach(function (e) {
      if (!(e.amount > 0) || !e.among.length) throw new Error('bad expense');
      var share = cents(e.amount) / e.among.length; // float cents; evened out below
      var floorShare = Math.floor(share);
      var remainder = cents(e.amount) - floorShare * e.among.length; // leftover cents
      net[e.paidBy] += cents(e.amount);
      e.among.forEach(function (p, i) {
        // first `remainder` people absorb the extra cent so the split sums exactly
        net[p] -= floorShare + (i < remainder ? 1 : 0);
      });
    });
    return net;
  }

  // Greedy minimal-transfer settle plan: [{from, to, amount}]
  function settle(net) {
    var debtors = [], creditors = [];
    Object.keys(net).forEach(function (p) {
      var v = Math.round(net[p]);
      if (v > 0) creditors.push({ name: p, amt: v });
      else if (v < 0) debtors.push({ name: p, amt: -v });
    });
    creditors.sort(function (a, b) { return b.amt - a.amt; });
    debtors.sort(function (a, b) { return b.amt - a.amt; });
    var plan = [], i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      var pay = Math.min(debtors[i].amt, creditors[j].amt);
      plan.push({ from: debtors[i].name, to: creditors[j].name, amount: dollars(pay) });
      debtors[i].amt -= pay;
      creditors[j].amt -= pay;
      if (debtors[i].amt === 0) i++;
      if (creditors[j].amt === 0) j++;
    }
    return plan;
  }

  // Per-person summary for display: paid, share, net (dollars)
  function summary(people, expenses) {
    var net = balances(people, expenses);
    var paid = {}, owed = {};
    people.forEach(function (p) { paid[p] = 0; owed[p] = 0; });
    expenses.forEach(function (e) {
      paid[e.paidBy] += cents(e.amount);
      var share = cents(e.amount) / e.among.length;
      var floorShare = Math.floor(share);
      var remainder = cents(e.amount) - floorShare * e.among.length;
      e.among.forEach(function (p, i) { owed[p] += floorShare + (i < remainder ? 1 : 0); });
    });
    var out = {};
    people.forEach(function (p) {
      out[p] = { paid: dollars(paid[p]), share: dollars(owed[p]), net: dollars(net[p]) };
    });
    return out;
  }

  // sanity: transfers count is never more than (people with nonzero balance) - 1
  function isMinimal(plan, net) {
    var nonzero = Object.keys(net).filter(function (p) { return Math.round(net[p]) !== 0; }).length;
    return nonzero === 0 ? plan.length === 0 : plan.length <= nonzero - 1;
  }

  var api = { balances: balances, settle: settle, summary: summary, isMinimal: isMinimal, dollars: dollars };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.SettleUp = api;
})(typeof window !== 'undefined' ? window : globalThis);
