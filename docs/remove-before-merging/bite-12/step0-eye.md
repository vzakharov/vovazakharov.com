# step0-eye — hand-over note

Package: bite 12 step 0, the eye half (pure, Phaser-free).

## Done

1. `model/ground.ts` + `ground.test.ts`: `Eye`, `OPENING_EYE`, `EYE_HEIGHT`,
   `CLUMP_DISTANCE`, `Scaling`, `planeOf`, `Pinhole`/`pinholeOf`, `Viewed`,
   `viewOf`. Tests: opening identity over every screen, feet and heights; a
   full turn; a step ahead scales by d/v.

## Left

2. `ui/scene/view.ts` + test: `View`, `viewAt`, `ofGround`, `ofLayout`,
   `cull`, `fade`, `onScreen`, `Following`; the `V_NEAR` head test.

## Decided

- The distance member is `ahead` (the spec's `v`); the pinhole's screen
  centre and horizon row are a `Point` (`x` = cx, `y` = y_h) beside `focal`
  (F), since `centre`/`horizon` members already exist elsewhere.
- `scale: number` got a base, `Scaling`, which `Projected` now intersects.
- `viewOf` returns screen px of the screen itself (no world crop): the
  opening identity is `project − openingLeft`.
