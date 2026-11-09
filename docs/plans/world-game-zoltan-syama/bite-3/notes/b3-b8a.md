# b3-b8a — retire the plane (hand-over)

Branch `wt/b3-b8a`, base 1ae1b7e5. Stopped at the context budget.

## Done

- `refactor: retire bite 2's planar world field` — deleted `layout`, `dome`,
  `mask` (+ `mask.json`), `square`, `world-field`, `harmonic`, `contour` and
  their tests from `entities/terrain/world/model`. `isLand` moved into
  `sphere-contour.ts`.
- `refactor: retire the planar tile and quadtree` — deleted `quadtree.ts`,
  `detail.ts`, `split.ts`, `tile-fill.ts` (+ tests) and
  `tile/index.test-only.ts`; `tile.ts` keeps `TileKeyed`, `SPLIT_RATIO`,
  `TILE_GRID`. `cube-fill.test` lost its compare against `fillTile`;
  `pages/island/lib/colour-heights.test` fills a cube tile instead.
- tsc, eslint, prettier, the touched tests, `check:masd`, `check:cycles`,
  `type-overlap` green.

- `refactor: cut the world sub-slice into roll, series, grid and land` —
  deleted `fft2`/`ifft2` (and `transform`'s offset/stride) and
  `encodeNormal`/`encodeUniform` (read by their tests alone; no fit script reads
  them). `masd:clusters` stayed red, so `world` holds only sub-slices now:
  `roll` (roll, decode), `series` (sphere-series, fft), `grid` (legendre,
  sphere-grid), `land` (the rest: hash, world-schema, land-measure/-series,
  pinned-row + `pinned/1.json`, sphere-contour, sphere-world). `fit-sphere.ts`
  writes the row at its new path. `masd:clusters` green (0 of 119).

- `refactor: retire the planar height and 2D value noise` (item 3, done before
  item 2 because `height.ts` read `CoastField`, which the entity could not reach
  once it moved to scripts) — `height.ts` and `valueNoise` gone; the
  `buildCoastField` cases moved beside `coast-field.ts`; the `GROUND_SLOPE`
  comparison dropped from `height-sphere.test`.
- `refactor: move the planar coast field beside the fit` (item 2) —
  `src/island/scripts/lib/coast-field.ts` (+ test); `signedDistanceField` and
  `CoastGrid` unexported there. `SignedDistances` now declared in
  `sphere-field.ts`, exported through the terrain barrel for the script's
  `CoastField`.
- After each commit: tsc, eslint, prettier, the touched tests, `check:masd`,
  `check:cycles`, `masd:clusters` (0 of 119), `type-overlap` green.
- knip at the end: unused files 3 (the three terrain `index.test-only.ts`
  barrels), unused exports 23, unused exported types 27, configuration hints 1
  (`.sass`). All findings are under `src/island`: barrel-only re-exports of
  world (`pathHash`, `PROBE_ENVELOPE`, `rollWith`, `worldSchema`, `Envelope`,
  `Harmonic`, `Lookup`, `WordSource`, `World`), `FIELD_RINGS`/`FIELD_COLUMNS`/
  `landOnGrid` in `sphere-world.ts`, quadtree/tile options types, and the eye's
  (item 4).

## Left

1. ~~The clusters call~~, 2. ~~coast-field~~, 3. ~~planar height~~ — done.
4. Eye: `eye.ts`/`pose.ts` are planar but `globe-eye`, `look`, `look-hint`,
   `globe-pose`, `eye-controls` import pieces (`clamp`, `MAX/MIN_HEIGHT`,
   `Intent`, `shortest`, `Vec2`, `pitchAt`, `poseFrom`, `fovFor`,
   `GROUND_PITCH`, `groundPerScreen`) — those must move before the planar parts
   go. `globe-eye.ts` opens `ISLAND_OPENING` at `planeToWorld(0, 0)`: becomes
   lat 10° N, lon 0.
5. `shared/globe/globe.ts`: drop `PlanePoint`, `planeToWorld`, `worldToPlane`,
   `EAST`, `NORTH`, `CENTRE` (the fit has its own in
   `scripts/lib/azimuthal.ts`). `GridCell` in `cube-edges.ts` is
   `PlanePoint & {level}` — needs its own `{x, y}`. Many sphere tests (geo,
   globe-pose, globe-eye, cube-quadtree(+kit), cube-detail) use
   `CENTRE`/`EAST`/`NORTH`/`planeToWorld` as fixtures.
6. `play-island`'s `INLET`, `film-descent`'s `LANDING` → lat/lon via
   `scripts/lib/azimuthal.ts`.
7. knip's remaining barrel-only exports (see the base run in the report).
