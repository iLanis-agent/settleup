# SettleUp

Group trips end with a debt web: A covered dinner, B got the cab, C booked the place,
and suddenly everyone owes everyone. SettleUp logs shared expenses, nets each person to
a single position, and produces the minimal payback plan - matching biggest debtor to
biggest creditor until nothing remains. A chain of A owes B owes C collapses into one
transfer.

- Odd-cent splits are handled exactly (leftover cents distributed so sums are always zero-sum)
- Per-person view: paid, fair share, and net
- One tap copies the settle plan for the group chat
- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the balance and settle-plan math as pure functions, shared between
  the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers even/odd-cent splits (exact zero-sum), subset participants,
single-transfer cases, chain collapse (A->B->C becomes A->C), empty state, the
minimality invariant on messy random-ish data, and the per-person summary.
