# Package S — hand-over note

## Done

- **S1 — the side cull** (`ui/scene/bed-place.ts`): `bedPlace`, given a
  height, now also hides a thing whose foot stands past a screen side by more
  than `SIDE_OVERHANG` (1.5) of its drawn height (`offSides`). Mushroom-bed
  and flower-bed pick it up unchanged through `viewedOrLaid`, which already
  passes each one's height (`shown.tall`, `headR - headY`). No change in
  `mushroom-bed.ts`, `flower-bed.ts` or `view.ts` was needed.
- Tests in `bed-place.test.ts`: the overhang covers every mushroom's widest
  reach (cap at most 0.66 of its height, cast shadow 0.81); a thing behind or
  beside the eye within D_SEE is not drawn; one past a side by 0.1 or 0.9 of
  its overhang is drawn, by 1.1 is not; at the opening eye every mushroom and
  flower whose drawn reach touches the screen is drawn exactly as before.

## Decided

- The overhang is measured in the thing's own drawn **height**, the one size
  `bedPlace` already receives, rather than a new width argument, so
  flower-bed needs no edit. 1.5 heights also equals a tuft's
  `BLADE_OVERHANG` (3 sizes over its 2-size height), so `shownSprouts`
  draws exactly what it did.
- Things called with no height (layout tests, flower-cover, perch readers)
  are not side-culled, as they are not sunk-away-culled.

## For package L (flower-bed.ts)

- `FlowerBed.paint` stands a new flower before `drawFlower` sets `headR` and
  `headY`, so its first stand passes height 0: a flower whose foot is off a
  side by any amount is hidden until the next `follow` (next frame). Same
  pre-existing shape as the sunk-away cull; one frame at most. Standing it
  again after `drawFlower` would close it.

## Left

- S2, S3: later agents.
