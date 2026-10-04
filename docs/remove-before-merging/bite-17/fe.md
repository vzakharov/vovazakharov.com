# fe — the eye stands higher in flight

The operator: «в "полёте" камеру можно чуть приподнять… видим чуть дальше,
с чуть большей дымкой».

## Done (landed as one squash commit)

- `model/eye-height.ts`: `FLIGHT_RISE = 1.2` (the eye at 1.2× its walking
  height in flight), `RISE_EASE = 0.5` s smoothstep between the two on a
  flip, from wherever the eye stands (`Rise`, `heightAt`, `riseFrom`);
  `browDistance(view)` = `D_SEE · eyeHeight / EYE_HEIGHT`; `D_SEE_MOST`.
- The lift is an eye height threaded through the view, the horizon row
  fixed: `View` carries `eyeHeight`; `viewOf`/`planeSeen`/`distanceOfRow`
  read it. `groundTop`, the brow (`browRow`), the hills, the backdrop bake
  and the seam stay on the same screen rows — only the ground they show
  is deeper, so nothing in the bake moves. Layout-time lenses (`rowAt`,
  `layoutOfPlane`, `framedOf`/`unframed`) stay at the opening eye's height:
  bed objects are laid out at it and re-placed through the view.
- `walk.ts`: `Walk.rise`, `withGait(walk, gait, time)` (eye-input's
  `flipGait` calls it), `lensAt(walk, time)` — the aim of a step/strafe
  reads the eye's height at the sample, so the ground stays under the
  finger in flight.
- Brow distance now the view's: `behindHills(view, …)`, `sunk`,
  `browPale(view, …)`, `hazeAhead`, the seam's grass band (`tufts.ts`
  `seamFaded`/`crossesSeam` take the brow), mottles' fade, tending's reach,
  insects' entry/out spots. Reaches with no view (lawn `LIVE_REACH`,
  `STAND_REACH`) use `D_SEE_MOST`. Model rules (crowding, anchor, map wedge,
  perch reach) keep `D_SEE`.
- Haze: things' haze is by distance (`hazeAhead`), so in flight a far
  mushroom is hazier than it was on the same row.
- Tests: `eye-height.test.ts` (heights, no-jump ease, mid-ease flip back,
  brow = ground at the top row on every viewport at both heights, a walk's
  `withGait`/`lensAt`); flight walk tests read the flight height.

## Left — the next step, designed

1. **Ground haze does not follow yet.** The ground is a baked, row-toned
   picture (`groundRowAt`), so in flight the ground at the brow keeps its
   0.4 haze while a thing standing there is hazed for 1.2·D_SEE (~0.63).
   Far things may read paler than the ground under them. Fix: a ground haze
   wash at a depth between `duskGround` (-2.9) and `brow` (-2.5), rows from
   `seamTop` down, alpha per row
   `(hazeFlight(r) − hazeBase(r)) / (1 − hazeBase(r))` times the rise's
   share (`(eyeHeight − EYE_HEIGHT) / (gaitHeight('flight') − EYE_HEIGHT)`),
   where `hazeX(r)` is `project`'s haze for the distance row r shows at
   height X; and mix `brow.ts`'s fill/crest rows toward `PALETTE.air` by the
   same amount. Pure alpha function → test.
   Not yet seen in a frame: in the fresh meadow nothing stands near the
   brow in flight (2.), so the play's frames cannot show it either way.
2. **In flight the far band is bare.** The visit's seeded flowers are laid
   out on the opening lens's bed, which ends at `D_SEE`, so the ground
   flight adds (rows from the brow down to where the walking brow's flowers
   now stand, ~200 px on tabL) shows tufts and mottles but no flower or
   mushroom. Flight reads as "everything slid down the screen", not yet as
   "seeing farther". The opening clump also slides into the bottom edge,
   its stems cut off. Fix, if wanted: seed the wild flowers' bed out to
   `D_SEE_MOST` (`flower-plots.ts` / `layout.flowers`), so the deeper band
   holds things to see; a design call, not built.
3. Perf in flight unmeasured: the map play's frame budget (18.5 ms median
   on tabL) is read over its steps frames.

Checked (fe2): `pnpm knip` clean; `pnpm type-overlap` was red (`Rise`
overlapped `Ramped`'s `from` and `Drag`'s `since`) — `motion.ts` now names
`Ramp = Started & Ramped`, which `Dusk` and the eye's rise both are.
`fliers.test.ts` passes (52). The map play shoots `g-lifted` (2 s into
flight, repaints done) and `g-settled` (back in steps); frames
`frames/bite-17/fe-steps.png` (`m0-closed`) and `fe-flight.png`
(`g-lifted`). In them the brow, the seam grass and the hills stay put, with
no gap at the brow and nothing floating.
