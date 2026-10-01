# lens-build — the panoramic lens, built for real

**State: steps 1–3 written as `lens-build.patch`** (applies on aa7bf73,
type-checks, prettier-clean). It is not source yet because no test has run
against it. Stopped there by the subagent context budget. Steps 4–5 are
left.

## What the patch does

- `model/ground.ts`: the world spread lives on the ground. `SPREAD`
  (1.9617, four tabL screens a turn, now written in terms of
  `CLUMP_DISTANCE`) is applied by `spread` / `gathered`, which work in
  polar form round `OPENING_EYE` (the plane's origin) and keep every
  distance. `planeOf` = `spread` of the old opening-pinhole plane point, so
  the plane is a rigid world once the eye walks. `viewOf` is linear in
  azimuth with no `SPREAD` in it (`arc = focal / SPREAD` px a radian). Its
  rows go by distance, bent by the new `bendAt` (`hypot(1, dx / focal)`).
  Behind the eye now lands off the screen's side, since `ahead` is never
  ≤ 0. Two inverses are new: `planeSeen` (a screen point to the ground
  under it) and `alongSight`.
- `model/pan.ts`: `TURN_CRUISE = 0.38 · SPREAD` rad/s, so the slide in px
  is today's (`TURN_CRUISE · arc` = `0.38 · focal`) and the plays' "never
  past `TURN_CRUISE`" check keeps its meaning. `turnOf(arc)`.
- `model/walk.ts`: the heading is `left / arc`; `arcOf` = px off the
  middle; `distanceOfRow` keeps its formula, since it reads at the middle
  where the bend is 1.
- `ui/scene/view.ts`: `ofLayout` spreads the row's opening-pinhole point.
  `ofGround`'s zoom reference is the row's opening distance
  (`CLUMP_DISTANCE / scaleAt(z)`), not the spread `y`. Three helpers are
  new: `layoutOfPlane` (plane to layout px and row), `rowAt` and
  `middleOf`. `browRow` goes through `bendAt`.
- `view-inverse.ts`: `planeUnder` = `planeSeen` and `layoutUnder` goes
  through `layoutOfPlane`. `layoutOf` is gone, so check whether a test
  imports it.
- `eye-crop.ts`: `layoutAtRow` finds where the sight line first crosses
  the row's spread curve, numerically: 49 geometric samples from 0.05 to
  200 units, then 32 halvings. It then reads the height off the bent row.
- `insect-away.ts`: `groundAlong` goes through `alongSight` and
  `layoutOfPlane`. `turnSide` is a plain `x < middle`.
- `mushroom-room.ts` (`capShown`, `keptOff`): a mushroom's cap corners and
  outline are placed about its drawn foot by `zoom`, using `aboutFoot`, now
  shared with `onHost` in `bed-place.ts`. They are no longer mapped point
  by point through `ofLayout`. The spread widens a span on the plane that
  the screen narrows back only at the opening eye: point by point, an
  outline at tabL's edge comes out about 16% narrower than the sprite the
  bed draws.
- The probe's `arc` reads in `panorama.ts`, `brow.ts`, `grass.ts`,
  `paint-sky.ts` and `skyline.ts` are carried as they were.
  `mushroom-selection.ts` changed only by prettier.

## Left

1. Apply the patch, then run every touched test one file at a time: ground,
   pan, cruise, walk, view, view-inverse, eye-crop, insect-away, brow,
   panorama, bed-place, mushroom-room, mushroom-patch, meadow-rules,
   perch-sight, tufts, repaint-queue, layout and anything else that imports
   these. `fliers.test.ts` runs alone, since flight goes through
   `ofLayout`. Fix or extend each, then commit as source.
2. Measure what `layoutAtRow`'s search costs `onscreenOf` (66 calls).
3. Frames: the opening on tabL, phoneL and phoneP against
   `frames/bite-12/lens-probe-*` (the clump to the px), then tabL after a
   quarter turn and after a few steps forward, saved as
   `lens-build-*.png`.
4. Outside this package's files: `scripts/lib/play-walk.ts:247` and
   `play-approach.ts:140` still read an azimuth as `atan(dx / focal)`, the
   old pinhole. Under the new lens it is `dx / arc`, so the plays that
   read it will be wrong until someone fixes them.

Decided: `TURN_CRUISE` stays the heading's rate (scaled by `SPREAD`), not
the px slide. Mushroom outlines go about the foot, not point by point.
