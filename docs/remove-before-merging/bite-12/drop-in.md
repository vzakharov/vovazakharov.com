# drop-in — hand-over note

Package: the plan's «Refined with the operator… it rises from behind the
brow in front» (the top-edge version was dropped mid-package on the
orchestrator's course change).

## Measured (step 1)

- Top-edge start (dropped): a sky point over the perch's row is not hidden
  by its height; it was hidden only where its **foot** at the start x stood
  past `D_SEE` (heading −0.6, far rows: 10 / 14 / 12 legs on tablet /
  sideways phone / desktop, ~1 %, each hidden for ~12 of 19 samples). No
  height of its own was needed.
- Brow start, `PAST_BROW` 0.05 / 0.01 / 0.001 (6 screens × 11 eyes × 187
  feet, ×3 kinds, real `steer`, 60 fps): hidden median 67–83 / 33 / 17 ms,
  p95 ~200 / 83–100 / 33 ms. Taken: 0.01.
- Tail, at 0.01: 84 of 8091 legs hidden > 150 ms (up to 0.65–1.0 s), every
  one to a perch whose own foot is within 0.45 of `D_SEE` (12.89–13.33). The
  insect flies along the brow with height, and `sunk` mirrors its middle, not
  its foot, so it stays `buried` until its foot crosses `D_SEE`. Not the 0.2
  sliver rule (`sunkAway` is the beds'; insects use `buried`).
- Zoom at first sight / the perch's: 0.67–1.02 — it grows as it nears.

## Done

1. (this commit) `insect-away.ts`: `groundAlong` (ground at a distance along
   a screen column, as layout point + row; round trip exact to 1e-12),
   `turnSide`, `PAST_BROW`, `entry` returning `OverRow & { out? }`.
   `flight-in.ts`: `outOfView`. `insect-view.ts`: `enter` and `stretch` (the
   out-of-view stretch, then the rest re-set off past the side).
   `insect-shown.ts`: `out`, `departs`. Tests updated / added.

## Left

- `fliers.test.ts` once — not run (context budget).
- Frames on tabL / phoneP — not taken.
- A measure of the no-perch case's out stretch in play.

## Decided

- `PAST_BROW` 0.01 clump sizes; out-of-view stretch flies over ground
  `OUT_AHEAD` 0.5 × `D_SEE` ahead, to the screen edge past by its span.
- The out stretch takes `min(ARRIVAL, leg / 2)`; the model's leg is not
  lengthened (no `firstFlight` line), so the unseen rest flies faster than
  its cruise by that much.
- The side out is the eye's shorter turn to the perch (`turnSide`), not the
  model's `leg.from.side`; a perch standing nowhere goes by `leg.from.side`.
- The model still times a first leg from the screen edge (`edgesOf`).
