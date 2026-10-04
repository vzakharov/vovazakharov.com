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
2. Repaint lag: a flip changes every far thing's haze; the repaint queue
   catches up at `REPAINTS_PER_FRAME` = 2, ~1 s. Watch in the play.
3. Play not run: `flock /home/user/vovazakharov.com/tmp/site.lock pnpm
play:mushrooms --screens tabL --plays map`, add a shot after the gait
   flip + 0.6 s (full lift) beside steps (`play-map.ts`, the `g-${gait}`
   shots are only the corner), copy the best to
   `docs/remove-before-merging/frames/bite-17/`.
4. Perf: in flight ~1.4× the ground area is drawn to the brow; check the
   26 ms budget. `fliers.test.ts` not run (flight frames untouched).
5. `pnpm knip`, `pnpm type-overlap` not run.
