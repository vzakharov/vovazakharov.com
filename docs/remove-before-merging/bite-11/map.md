# Bite 11 — the scene map

A subagent's read of the code before the bite, paths under
`src/pages/mushrooms/`. Line numbers are as of 6bd4292 and drift.

## Today world = screen

One Phaser camera, `cameras.main.setOrigin(0,0).setZoom(ratio)`
(`meadow-scene.ts:405`), scroll 0, no `setScrollFactor` anywhere. Everything
projects through `Camera.midline = width/2` and is used as CSS px. Hit tests
already convert correctly (`getWorldTransformMatrix`, `getWorldPoint`,
`hitTestPointer`); what breaks is every use of `layout.width` or the screen
edges as the world's edge, and the sky/HUD that must stay fixed.

## Layout → scene

- `model/ground.ts`: `Camera` (:34), `project` (:150), `frameFor` (:214),
  `fitCamera(screen, lens, shown)` (:236–263) — `midline = width/2`, zooms out
  for `shown`.
- `ui/scene/meadow-camera.ts`: `LENS` (:399, `EDGE_MARGIN` 12),
  `meadowCamera` (:421), `meadowFrame` (:426), `capsAcross` (:412).
- `layout.ts`: `meadowLayout` (:128–148) places the seeded bed on the opening
  screen (`keptBed`), `perchedOn` (:164–184) from `used`; `standMeadow`
  (:252–302) builds camera, frame, controls, sun, clouds (screen fractions,
  :287), insect sizes; cached by `width height shown` (`stoodMeadow` :224).
- `meadow-scene.ts` `paint` (:403–438) calls `meadowLayout(…, this.opening,
  this.used())`; `used()` (:441) reads `usedIn` (`flower-plots.ts:198`).
- Ground-placed (through the camera): mushrooms (`mushroom-bed.ts:296`,
  `setDepth(y)`), flowers (`groundOf` `flower-plots.ts:154–176`,
  `flower-bed.ts:103`), tufts (`tendTufts`/`relaid` `tufts.ts:225–288`), the
  door, spore puffs (`puffFrom` `mushroom-bed.ts:401`).
- Screen-placed: controls and pickers (`sky-layout.ts placeControls`), sun and
  wash (`sun-layout.ts placeSun`, `washRings` :249), clouds, seam grass over
  `0..width` (`grass.ts:74–79`), air spots grid over `0..width`
  (`perch-sight.ts airGrid` :229–249), away spots at `-reach`/`width+reach`
  (`perch-sight.ts:327`, `insect-view.ts offScreen` :322–332), a leg's `from`
  as screen fractions (`insect-view.ts fraction`/`toScreen` :335–341),
  `Sight.places` (`perch-sight.ts:319–331`).

## Rendering

Depths: backdrop 0 in creation order; mushrooms/flowers/tufts at y;
`SPORE_DEPTH` 1e5 (`mushroom-bed.ts:52`); `INSECT_DEPTH` 1.5e5; `HUD_DEPTH`
2e5 (`meadow-scene.ts:43–49`). `paint-backdrop.ts` bakes three RenderTextures
per paint at screen × ratio (`bake` :50–70): `far` (sky, sun), `near` (hills
and ground in one), `wash` (SCREEN blend). Clouds redrawn per frame
(`driftClouds`), grain TileSprites (`paintGrain`), grass and tufts per frame
(`Grass.update`, `tufts.ts:343`).

Breaks under a scrolled camera:

1. `layout.width` as world width: air grid and away spots
   (`perch-sight.ts:230–232, 327`), insect fractions and off-screen
   (`insect-view.ts:165–170, 330–340`), tuft count (`tufts.ts:230–263`,
   `TUFTS_PER_1000PX`), seam grass (`grass.ts:74–79`), bake size
   (`paint-backdrop.ts:57`).
2. Sight vs screen edges and controls: `flowerInSight`
   (`flower-sight.ts:237–245`), `tapCircles`.
3. Mushroom room: edge margin vs `width` (`mushroom-room.ts:283`), wash
   (:277), `keepOff` controls (:365).
4. Tufts `bareToTap` vs controls (`tufts.ts:167`).
5. Controls take world points as screen: `standingOn(camera, planting.foot)`,
   `mushroomAt`/`flowerAt` fly-out origins (`controls.ts:213–220`) — need
   world → screen.
6. `near` bakes hills and ground together: split for parallax.
7. World-wide bake past `MAX_TEXTURE_SIZE` 4096: tile it.

## Taps

All on pointerdown: buttons (`button.ts:106`), mushrooms
(`mushroom-bed.ts:373`), flowers (`flower-bed.ts:246`), door
(`house-view.ts:93`), insects (`insect-view.ts:301`, uses
`pointer.worldX/Y`), scene `tapMeadow` (`meadow-scene.ts:193, 362–372`,
`getWorldPoint`). `POINTER_UP` only starts sound (:195). Extra fingers:
`instrument-input.ts:43–60` (`transformPointer` + `hitTestPointer`, scroll
safe). Keys: `keyboard.ts:79–87`, `KEYS` :47–54; arrows free. Nothing listens
to `POINTER_MOVE`.

## Rules that exist only because a turn re-lays the world

`perchedOn`/`PERCH_REFITS` (`layout.ts:150–184`); `fitCamera`'s `shown`,
`widestOf`; `capsAcross`/`headsAcross`; `Used`/`UNUSED` (`layout.ts:110–117`),
`usedIn`; `meadow-scene.used()`/`opening` (:412, :441); `seededBed` on the
opening screen with `FLOWER_SPOTS[portrait|landscape]`
(`flower-layout.ts:348`); `washRings(layout, used.mushrooms)`; `stoodMeadow`
keyed on `shown`; `visit-play.ts relaidOn` (:77). `keptRoom`
(`mushroom-room.ts:383`) re-finds room on a new layout identity — a pan must
not make one.

Tests: `model/ground.test.ts:54, 134–170`; `meadow-rules.test.ts:299–314`;
`flower-layout.test.ts:288–320`; `flower-plots.test.ts:164, 244–292`
(`MOST_LOST`); `tufts.test.ts:272, 339`. `layout.test.ts:300`
(`TURNED_SMALL`) is controls only and stays.

## FLOWER_LIMIT (14, `model/pollen.ts:16`)

`sown` (`pollen.ts:155`), `plant` (`model/game.ts:270`), `takesFlower`
(`flower-sight.ts:338`), `flowersLeft` (`tufts.ts:130–133`) capping
`tendTufts` at `min(flowersLeft, width/1000·TUFTS_PER_1000PX)` (:231). Tests:
`planting.test.ts:84`, `pollen.test.ts:144`, `swarm.test.ts:186`,
`tufts.test.ts:317`, `flower-plots.test.ts:78`.

## Mushrooms

`MUSHROOM_SLOTS` 6, `isFull` (`model/game.ts:38, 121`). `pickFoot`
(`model/placement.ts:73`, `CANDIDATES` 12 × `ROUNDS` 32, `FOOT_APART` 0.3,
`drawnFoot` over `frame.across` :52), frame from `meadowFrame(screen)`.
`roomFor` admits (`mushroom-room.ts:317–376`): flower feet, `trialOn`
(:270–287, wash and edge margin), `keptOff` controls, `partsInView`,
`doorsKept`, `keepsPatches`. The scene draws the seed ahead (`upcoming`),
`grow` carries the foot (`meadow-scene.ts:158–163`).

## Play run

`scripts/play-mushrooms.ts` taps by CDP `Input.dispatchTouchEvent` at CSS
(x, y) (:214–223), never turns. Coordinates from `scripts/lib/mushroom-probe.ts`
in the page — world coordinates. `topAt` passes raw screen (x, y) to
`scene.insects.reached`, which wants world. Consumers: `play-meadow.ts`,
`play-tufts.ts`, `play-band.ts`, `play-buzzers.ts`, `flier-watch.ts`. Under a
pan the probe must return world − scroll and skip or pan to off-screen
targets.
