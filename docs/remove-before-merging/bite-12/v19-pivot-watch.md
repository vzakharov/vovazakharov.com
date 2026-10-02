# v19-pivot-watch — the veer watch allows a pivoted leg's dart

Builds `leg-timing.md` § 5.

## Step 1 — the bound (done)

- The fly-speed bound lives in `flicks` (`scripts/lib/veer-report.ts`), not
  `flier-watch.ts`: `dashPeak` × `DASH_SLACK`, per step at its own size.
- The probe could not tell a leg pivoted, so the veer record
  (`scripts/lib/veer-watch.ts`, `VEER` and `Sample`) carries one field more:
  `lifted`, the flier's `steering.setOff.turns.lifted` (`null` before the
  leg's first steered frame). A leg pivots exactly when `lifted ≠ 0`
  (`pivot` is proportional to `|lifted|`).
- `pivotAllowance(lifted)` (`scripts/lib/veer-dash.ts`): `1 / (1 − PIVOT_SHARE)`
  for a pivoted leg, 1 otherwise; `flicks` multiplies the own-size bound by
  it per step. The note and the failure line print both bounds, and each
  step's line its `lifted`.
- `PIVOT_SHARE` lives in `model/insect-motion.ts`, not `insect-steering.ts`
  as the prompt said; it is now exported from there (the one `src/` edit).
- `DASH_SLACK` exported for the test.
- Unit test: `scripts/lib/veer-report.test.ts` (5 tests) — the allowance, and
  `flicks` over synthetic fly frames: a step between the two bounds fails a
  leg that set off at once and passes a pivoted one; past the pivoted bound
  still fails.

## Step 2 — the play run

Not run yet.
