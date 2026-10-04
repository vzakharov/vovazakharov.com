# Bite 17 — package `gf`: grass at the flight brow (review-read2 item 1)

## Status

Done (option B, the orchestrator's pick). Landed as one commit on the shared
branch.

## Cause

Tending was not it. A lawn tuft stands only where a flower could be planted on
it, and the flowers' band (`inFlowerBand`, `flower-plots.ts`) ends at 12.28
units straight ahead at any eye height. So tending to flight's brow gathered
+44% tufts (tabL 421 → 606, phoneP 183 → 256) and stood none of them. The seam's
grass ran from `brow − SEAM_BAND`: 12.33–14.53 in steps, which meets the band,
but 15.00–17.20 in flight, which left 12.28–15.00 ahead bare under the brow.

## Fix

`tufts.ts`: the seam's grass runs from `SEAM_NEAR = D_SEE − SEAM_BAND` to
`brow + PALE_SPAN` at any height (`seamReachOf`, `seamFaded`). Steps are
unchanged (brow = `D_SEE`), and the ground-seam tests still pin them. The new
tests in `tufts.test.ts` pin flight: the seam starts as near as in steps,
within half a band of the flowers' band's end, and draws tufts in the strip
under the risen brow on every viewport.

Seam tufts drawn, opening eye, lawn seed 7:

| screen   | steps before / after | flight before / after |
| -------- | -------------------: | --------------------: |
| 390×844  |              22 / 22 |               27 / 78 |
| 1180×820 |              66 / 66 |              67 / 193 |

Frame: `frames/bite-17/gf/phoneP-flight.png` (after), and `phoneP-steps.png`
for comparison.
