# Bite 9, placement group: paused

## Committed (aaa0a503)

- `model/placement.ts`: `OPENING_FEET`, `openingIndex(foot)`, `Footed`,
  `apartOnScreen`, `pickFoot(seed, { feet, admits })` — Mitchell's best of
  12 candidates drawn evenly over `COMMON_FRAME` (as a camera lays it out,
  `seen`), up to 4 rounds, from `mulberry32(seed ^ 0x6f075e)`; candidates
  under `FOOT_APART` (0.3) of a foot are dropped, the rest tried farthest
  first, the first `admits` takes wins.
- `model/ground.ts`: `COMMON_FRAME = { across: 0.87, near, far }`, the depth
  derived from the band (`FRAME_INSET`), `across` measured by `seen`;
  `seen(ground)`, `groundAt(camera, point)`; `inFrame` uses `seen`.
- `model/game.ts`: `Planted.foot`, `freeSlot` gone, `grow` carries
  `foot`; the reducer only refuses a full meadow. Tests updated.
- `ui/scene/clump-layout.ts`: `MushroomGround = { camera }` (what
  `layout.mushrooms` now is), `placeOf(camera, foot)`: an opening foot stands
  as the clump (sizes 0.92/1, `CLUMP_SPLAY`), any other as the forest
  (`FOREST_DRAWN` 0.7 of the clump's size on screen, `FOREST_SPLAY` away from
  the middle). `placeIn`/`standingPlaces`/`claimedPlaces` keep their names
  and call shapes (the flower modules compile unchanged); `placeIn` is
  `undefined` for a foot off this screen. `everyPlace` is now the extremes:
  the opening feet and the frame's corners and edge middles. `CLUMP_SHIFT`
  is gone (only fly agarics stand on the opening feet).
- `ui/scene/layout.ts`: the lens reach and `ZOOM_FLOOR` from `everyPlace`
  on a unit camera; `meadowStage(width, height)`; the flowers per
  `flowers.md` (`seededBed` + `flowersOn`, `keptBed`).
- `ui/scene/cap-cover.ts`: `MOST_HIDDEN`, `coverOf`, `capBox`.
- `ui/scene/mushroom-room.ts`: `roomFor({ mushrooms, flowers, seed })`
  judges a foot on every `VIEWPORTS` screen held both ways, all four
  species: out of the sun's wash, cap inside `EDGE_MARGIN`, no cap over
  `MOST_HIDDEN` behind a nearer one, controls/pickers/sun rays off the tap
  area (finger pad included), its door and every door behind it in sight.
  `flowersOnGround(stand)` is the interim flower feet (`standingFlowers` →
  `groundAt`); swap it for the flowers group's `flowerFeet`/`clearOfFlowers`.
- Scene: `meadow-scene.ts` draws the next seed ahead (`upcoming`), keeps
  `room` per mushrooms/plantings; `controls.ts` `roomy` handler dims `+`
  and makes it shake its head when there is no room; `picker.ts`,
  `visit-play.ts` (grows up to six as far as there is room),
  `clump-shade.ts` (`Opener` by foot, field `place`).

## In `placement.patch` (not committed)

`mushroom-room.ts` split into cheap trials on every screen first, then
controls, then doors; doors skip at once when nothing nearer meets the stem;
per-meadow door sight read once; `door-sight.ts` gains `standingAs(place,
stood)` (outlines cached per `Splayed`) and caches door stations per genes.
Type-checks and lints. 1.2 s → 0.26 s per visit of four grows (phoneL).

## Left

1. **Fill rate**: only 4.8 of 6 on average (15 of 20 visits short). The
   binding rules are cover on the landscape screens (the band is squashed
   there) and doors. Try more candidates/rounds, a narrower forest, or a
   smaller back row; then decide whether "fewer than six when the meadow is
   crowded" is acceptable (`+` shakes its head).
2. `layout.test.ts` still sweeps slots and does not type-check: rewrite over
   placed meadows (fill to six on every screen over the visits, every rule),
   with `coverOf` from `cap-cover.ts`; add `model/placement.test.ts`
   (evenness vs a jittered grid, visits differ, one seed the same) and
   `model/ground.test.ts` (the frame lies in every camera's view with the
   margins; a turn keeps ground points), the finger test via `fingerPad`.
3. Wire the flowers group's `flowerFeet`/`clearOfFlowers` once landed.
4. Lint, type-overlap, knip; probe build; tabL/phoneL frames.
