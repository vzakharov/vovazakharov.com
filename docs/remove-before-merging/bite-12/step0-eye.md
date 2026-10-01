# step0-eye — hand-over note

Package: bite 12 step 0, the eye half (pure, Phaser-free). Done.

## Done

1. 33bebaa — `model/ground.ts` + `ground.test.ts`: `Eye`, `OPENING_EYE`,
   `EYE_HEIGHT`, `CLUMP_DISTANCE`, `Scaling`, `planeOf`, `Pinhole`/
   `pinholeOf`, `Viewed`, `viewOf`. Tests: opening identity over every
   screen, feet and heights; a full turn; a step ahead scales by d/v.
2. `ui/scene/view.ts` + `view.test.ts`: `View`, `viewAt`, `Placed`,
   `ofGround`, `ofLayout`, `cull`, `fade`, `onScreen`, `Following`,
   `V_NEAR`, `D_SEE`; the test that every species' tallest head is below
   the screen's foot at `V_NEAR`.

## Left

Nothing in this package. Nothing consumes the API yet.

## Decided

- The distance member is `ahead` (the spec's `v`); the pinhole's screen
  centre and horizon row are a `Point` (`x` = cx, `y` = y_h) beside `focal`
  (F), since `centre`/`horizon` members already exist elsewhere.
- `scale: number` got a base, `Scaling`, which `Projected` now intersects.
- `viewOf` returns px on the screen itself (no world crop): the opening
  identity is `project − openingLeft`.
- `Placed` adds `zoom` (k = opening distance / distance now) to `Viewed`:
  the factor a layout-sized Graphics, and a flower's tap circle, scale by.
- `ofGround(view, foot, height)` is a convenience beside the spec's list;
  `FADE_FROM = 12.3` is the spec's number, kept as a design constant.
