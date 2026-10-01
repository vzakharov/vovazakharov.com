# half-depth — hand-over note

Package: the plan's «the meadow is half as deep», then the fliers
(`drop-in.md`'s Left) and the insect cull (`v-near.md`'s Left).

## Stopped at step 1: the opening frame does not stay identical

Halving `CLUMP_DISTANCE` keeps `viewOf` at `OPENING_EYE` equal to `project`
(the ground test stays green on every screen), but the opening **frame**
changes, because three things draw in azimuth or by distance round the eye,
not through `project`:

- **The brow.** `browRow` is the circle `D_SEE` round the eye, and its row at
  `x` is `horizon + (groundTop − horizon) · hypot(1, (x − middle) / focal)`.
  Halving `focal` bends it far lower at the screen's sides: on tabL the edge
  factor goes 1.07 → 1.28, on phoneL more. A far flower at a side now stands
  past `D_SEE` (`hypot(x, y)`, and only `y` halves) and sinks at the
  opening: 15 things drawn where bite 11's crop drew them → 11 on every
  screen.
- **The far hills' parting under the sun** (`skyline.ts` `sunBowl`) measures
  its sides as `focal · Δazimuth`, which is no longer the screen's px when the
  view widens, so the parted crest moves.
- **The haze rows** at the brow move with it (visible as bands).

Measured, opening frame at HEAD 1108d99 against the patch (ImageMagick
`compare -metric AE`, device px):

| screen | differing px | of        | share |
| ------ | ------------ | --------- | ----- |
| tabL   | 848 134      | 3 870 400 | 22 %  |
| tabP   | 378 652      | 3 870 400 | 10 %  |
| phoneP | 282 935      | 2 962 440 | 10 %  |
| phoneL | 1 079 420    | 2 962 440 | 36 %  |
| phoneS | 75 296       | 727 040   | 10 %  |

Frames: `frames/bite-12/half-depth-opening-tabL-before-after-diff.png`
(before, after, diff) and `half-depth-opening-phoneL-before-after.png`.

## Options (for the orchestrator / operator)

1. **The brow by depth along the heading** (`ahead > D_SEE`, a straight row
   at `groundTop`) instead of a circle round the eye. Still stands still on
   the screen as the eye turns; but the opening's brow, today bent 7 % lower
   at tabL's edges, goes straight, so the opening still differs slightly.
2. **The brow's circle in the row form's units** (the old focal: `D_SEE`
   circle drawn as if `focal / DEPTH_SHARE`). Keeps the opening's brow, but
   then it is not the circle things sink behind, so sinking and the drawn
   brow part at the sides.
3. **Accept a changed opening**: the clump and everything `project` places
   are identical; the brow rounds harder, side flowers on the far rows sink,
   the far hills part a little differently.
4. **A smaller cut than half** (`DEPTH_SHARE` 0.7–0.8): less bend, still not
   identical.

`sunBowl` is fixable inside the decision (measure its sides in screen px at
the opening, `focal · tan`) whichever option is taken.

## The patch (`half-depth.patch`, applies on 1108d99)

Type-checks; not source because the opening differs. Holds:

- `ground.ts`: `EYE_HEIGHT` from the row form directly; `DEPTH_SHARE = 0.5`
  and `CLUMP_DISTANCE` its multiple (4.32); `EYE_HEIGHT` stays 4.1538.
- `pan.ts`: `SLIDE_CRUISE` 3.28 clump sizes a second, `TURN_CRUISE =
SLIDE_CRUISE / CLUMP_DISTANCE` (0.759 rad/s; the old slide 0.38 · 8.64 =
  3.283, 0.1 % apart).
- `stride.ts`: `STRIDE_CRUISE`, `GLADE`, `RIM_KEEP` as shares of
  `CLUMP_DISTANCE`, `STEP_LENGTH = STRIDE_CRUISE / 2`.
- `repaint-queue.ts`: `PALE_SPAN = 0.09 · D_SEE`.
- `panorama.ts`: cloud lanes' first and last followers a screen's width from
  the leader (on desktop the even lanes put a follower on the opening
  screen at the wider view).
- Tests rescaled: `stride.test.ts` (lengths in `GLADE.r / 12`),
  `repaint-queue.test.ts`, `panorama.test.ts` (away heading π/2).

Test state with the patch: ground, pan, walk, stride, cruise, placement,
layout, brow, eye-crop, bed-place, mushroom-patch, mushroom-room,
meadow-rules, perch-sight, tufts, walking, footsteps, backdrop-tones,
panorama green. Failing: `repaint-queue` (the back-row foot at x ±1 now past
the brow at the opening — the brow finding above), `view.test.ts` (12),
`view-inverse.test.ts` (2, phone sideways), `insect-away.test.ts` (1). Not
investigated past the brow finding.

## Measured, at half depth (from the patch)

| screen | view across | screens a turn | slide px/s | s a turn |
| ------ | ----------- | -------------- | ---------- | -------- |
| tabL   | 77.4°       | 3.92           | 560        | 8.3      |
| tabP   | 36.4°       | 9.57           | 949        | 8.3      |
| phoneP | 37.5°       | 9.25           | 436        | 8.3      |
| phoneL | 100.6°      | 2.61           | 266        | 8.3      |
| phoneS | 38.0°       | 9.12           | 353        | 8.3      |

## Left

Everything from step 1's opening proof on: the decision on the brow, then
the failing tests, step 2 (fliers), step 3 (`V_NEAR` ceiling, frames).
Also: the halved `GLADE` (centre 4, r 6) no longer holds the opening
frame's far corners (world `±5.76` at depth 6.67 against the rim's 5.37),
since only depth halves; plane `x` is unchanged.
