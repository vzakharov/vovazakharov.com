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
2. **Far band — landed (fe3).** `far-band.ts`: `FAR_BAND`, a second
   seeded band past the walking brow, from `SUNK_AWAY` (0.1 of the ground's
   depth past the top row) out to `FLIGHT_TOP` (0.065 under flight's brow,
   so the farthest foot sits under the brow line rather than on it); 4
   uneven slots a half, 8 flowers. `seededBed(opening, seed, bands)` lays
   bands in turn, each slot on its own stream; `visitFlowers` deals the near
   `NEAR_FLOWERS` (14) off the visit's stream and the far ones off
   `visitSeed ^ FAR_STREAM`. `m0-closed` stays byte-identical to
   `fe-steps.png`; `fe-flight.png` is the new `g-lifted`.
   Tests that read the opening against controls, foot rows or perch
   distances (`flower-layout`, `perch-sight`) judge the near band alone;
   `far-band.test.ts`: every far flower sunk away behind the walking brow on
   every screen, every slot placed, and every one in the middle half of the
   screen in front of flight's brow.
   Known, not fixed: the band is laid at a depth down the screen and the
   brow is a circle round the eye, so the band's ends, where the brow bends
   down, lie past flight's brow — on phone held sideways ~1.5 of the 8 far
   flowers a visit sink away there in flight (0 on the other screens). A
   fix would lay the band by distance from the eye. The ground between
   flight's far row and the near flowers stays bare (~130 px on tabL): the
   walking view's own strip, which "steps unchanged" forbids filling.
   Latent: `flowersOf` pairs `layout.flowers[i]` with `flowers[i]`, so a
   near slot that found no spot would shift the far places onto near
   flowers; no visit drops one today (22 of 22 on every screen, 2000
   visits), and `far-band.test.ts` asserts all 8 far ones place.
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
