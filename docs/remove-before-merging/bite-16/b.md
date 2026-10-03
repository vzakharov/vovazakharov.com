# Package B — the map: hand-over

## Done

- Step 1: `model/map-frame.ts` + test — `mapFrame(centre, up, feet, panel)`,
  `onMap`, `headingOnMap`, `thingScale`. `Scaling` exported from
  `model/ground.ts` so the frame's `scale` has one home.

- Step 2: `ui/scene/map-view.ts` — `MapView` replaces `MapSwitch` (deleted).
  Not baked: one Graphics in a Container pivoted on the map button, scaled
  and faded by `emerge`/`sink` paced to 0.3 s, redrawn on open and on every
  `paint` while open. A full-screen `Zone` (interactive only while open)
  catches any tap and runs the controls' `map` handler; the scene mounts it
  in `create` with `actions.map`. Light is `iconLighting` (the pictograms'
  fixed light). `sizeOn(foot)` exported from `clump-layout.ts`; `PALETTE`
  gains `paper`/`paperEdge`. `meadow-scene.ts` is now 456 lines.

- Step 3: `playTheMeadow` takes `waiting` and drops every key press while
  the map is open (releases still let go); `EyeInput.letGo` lets go of held
  turns/walks/strafes, and `MapView` calls it as it opens. `listenOnMeadow`
  now takes the scene's pieces and calls `playTheMeadow`/`eye.listen`
  itself; `meadow-scene.ts` is 450 lines.

## Left

Step 4: `__probe.map()` (open, the frame's centre and reach) and a `map` play
(closed, opening, open; fresh and walked+planted meadow; tabL and phoneP).
`MapView` would need to keep its last `MapFrame` for the probe to read.
Nothing about the map has been looked at on a screen yet: the first play
run is also its first visual check (the sheet's colours, the 12 px cap
floor, the house brush's `ink` of `max(1, size · 0.02)`, the 26 px margin
that leaves room for the sun).

## Decisions beyond bite-16.md

- Not baked: one Graphics replayed each frame while the map shows.
- A tap anywhere on the screen while the map is open closes it, the inset
  margin round the sheet included (a full-screen catch), so no tap there
  reaches the meadow.
- The map's light is `iconLighting`, the pictograms' fixed light.
- Spores draw as a dot of `0.06` clump sizes, at least 2 px.
- Landed checks: `pnpm knip` and `pnpm type-overlap` clean (the latter
  after `AtRatio` in `baking.ts` and `MapFrame.sunward` in place of `up`).

## Facts found (paths under `src/pages/mushrooms/`)

- **Sun's azimuth on the plane**: `azimuthAt(layout.camera, layout.sun.x)`
  (`ui/scene/panorama.ts`; `paint-sky.ts:144` does the same). Azimuth is
  turned from the plane's `+y` toward `+x` (`alongAzimuth` in
  `model/geometry.ts`); the eye's heading is on the same scale. On seed 5,
  tabL: ≈ 0.534 rad.
- **Map axes**: up = `(sin α, cos α)`, right = `(cos α, −sin α)`; for an
  offset `d` from the centre, map screen = middle + scale · (d·right, −d·up).
  The child's heading `h` points on the map at screen direction
  `(sin(h−α), −cos(h−α))`.
- `D_SEE` ≈ 13.33 clump sizes, `CLUMP_DISTANCE` 8.64 (`model/ground.ts`). The
  opening clump's feet are ≈ (0, 8.9) and (−0.06, 8.6); seeded flowers span
  x −12…10, y 5.6…10.9, `size` 0.28.
- **Feet**: a mushroom's and a spore's foot is `foot: Point` (no size,
  `Footed` in `model/placement.ts`); its size is the clump's
  (`CLUMP_SIZES[openingIndex(foot)]`) or `FOREST_SIZE` (`clump-layout.ts`
  `placedAs`, both private there — export or read through `placeOf(camera,
footed).size / project(...).scale`). Flowers: `flowersOf(stand)`
  (`flower-plots.ts`) gives every standing flower, seeded and planted,
  pulled ones out, each with a plane `foot: Footing` (`size` = height in
  clump sizes) and its `seed`; the scene's `stand()` builds the `Stand`.
- **Painters**: `drawMushroom(graphics, genes, size, lighting, {turn})`
  (`draw-mushroom.ts`), genes from `mushroomGenes(mushroom)` with `spots:
paintedSpots(genes, mushroom.house)` (`model/house.ts`); the house by
  `paintHouse(graphics, genes, size, windows, door, brush)` (`draw-house.ts`)
  with windows `{kind, popped: 1}`, door `{station: doorStations(genes)[0],
popped: 1, out: 0, open: 0, look: 0, shut: 0}` (check `ShownDoor`'s
  fields), brush as `house-view.ts:276`. Flowers: `paintFlowerStem` then
  `paintFlowerHead` at `flowerHead(genes, size)` (`draw-flower.ts`), genes
  `flowerGenes(flower)`. Spore: a disc of `PALETTE.spore` radius `size ·
0.05` with a 1 px `PALETTE.ink` rim at 0.45 (`spore-bed.ts`). Cap width ≈
  `genes.capWidth · size` px (`capWidth` 0.72–1). Graphics in Phaser 4 has
  `save`/`translateCanvas`/`restore`, as `hud.ts:70` uses, so every thing
  can go into one pen.
- **Baking**: `button.ts`'s `buttonMaker` bakes a Graphics into a
  `RenderTexture` through a supersampled scratch (`SUPERSAMPLE`,
  `baking.ts`); the map can bake once on open the same way (one texture the
  panel's size in device px, `setScrollFactor(0)`).
- **Unfold**: `emerge`/`sink` in `model/motion.ts` run 0.75 s / 0.45 s;
  for ~0.3 s feed them `elapsed · EMERGE_DURATION / 0.3`. `picker.ts`
  `update` is the pattern (min of up and going).
- **Depths**: buttons at `HUD_DEPTH` (2e5), rain drops `HUD_DEPTH − 1`, wash
  `− 2`; the map sheet at `HUD_DEPTH − 0.5` is over the rain and under the
  map button, the other buttons already hidden by `Controls.update`.
- **Input gate, mostly free**: a fixed (`scrollFactor 0`) interactive sheet
  makes `EyeInput.pressed` ignore the press (`isFixed`), makes `tapMeadow`
  return (`over.length > 0`), and is the top hit for a chord finger
  (`instrument-input.ts`, `chordTap` on a non-flower). Only the keys need a
  gate: `playTheMeadow` (`instrument-input.ts`) takes a `waiting: () =>
boolean` and drops `pan`/`step`/`strafe`/note key-downs while it holds
  (key-ups still let go); on open, let go of held moves too.
- **Scene size**: `meadow-scene.ts` is 453 lines. The `listenOnMeadow(...)`
  block in `create` (lines 171–188) can move into `meadow-listeners.ts` as
  one call taking the pieces, which pays for the map view's field, its
  construction and its `update` line.

## Design settled

- `MapView` replaces `MapSwitch` (`get open`, `flip()`, which stamps
  `openedAt`/`closedAt` and draws the snapshot on opening from a
  `snapshot: () => {stand, eye, ratio}` the scene hands it); its sheet's tap
  calls the controls' `map` handler, so the press and the tap are one path.
  It redraws when the screen size or ratio changes while open.
- `model/map-frame.ts`: `mapFrame(eye, sunAzimuth, feet, panel)` → `{centre,
up, reach, scale, middle}`; `reach = max(D_SEE, farthest foot) + 1`;
  `scale = panel's shorter half-side / reach`; `onMap(frame, point)`;
  `headingOnMap(frame, heading)`; `thingScale(frame, size, least) =
max(frame.scale · size, least)`, the view passing `12 / capWidth` for a
  mushroom.
