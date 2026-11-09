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

- `refactor: retire the planar eye` (item 4) — the sphere eye is `eye.ts`
  (was `globe-eye.ts`) and holds `Intent`, `Vec2`, `STILL`, the rates, the
  height limits and the easing; `pitchAt`/`GROUND_PITCH` moved to `look.ts`;
  `pose.ts` holds `Pose`, `fovFor`, `groundPerScreen`, `poseFrom` and the
  sphere `poseOf` (`globe-pose.ts` merged in); `shortest` in `turns.ts`;
  `clamp` in `clamp.ts`. `ISLAND_OPENING` = 10° N, 0° E (checked: the old
  expression gave lat 9.999999999999998°, lon −0). Tests renamed to `eye`,
  `look`, `pose`; the planar pose tests that hold on the sphere carried over.
  The barrel keeps its `globe…` aliases (pages read them).
- `refactor: drop the island plane from shared/globe` (item 5) — `globe.ts`
  is `R` + `Elevated`; `globe.test` deleted; `GridCell` has its own `x`, `y`;
  fixtures: geo literal vectors, eye test's `CENTRE`/`EAST`/`NORTH` from
  `ISLAND_OPENING`, quadtree kit's `CENTRE`/`CENTRE_LAT`/`northOfCentre`.
- `refactor: name #1's inlet places by latitude and longitude` (item 6) —
  `scripts/lib/places.ts` (`INLET`, `INLET_HEAD`, `INLET_BEACH`, degrees to 6
  decimals) + `places.test` against `planeToDegrees`; `azimuthal` gains
  `degreesToUnit`; film-descent's `START` is `ISLAND_OPENING`.
- knip now: unused files 3, unused exports 15, unused exported types 25,
  configuration hints 1. The eye's findings are gone but `EARTH_OPENING` (the
  barrel's; only `openingOf` is read outside).

## Left

7. knip's barrel-only exports: world's `pathHash`, `PROBE_ENVELOPE`,
   `rollWith`, `worldSchema` and the types `Envelope`, `Harmonic`, `Lookup`,
   `WordSource`, `World` (through terrain, world and land barrels);
   `FIELD_RINGS`/`FIELD_COLUMNS`/`landOnGrid` in `sphere-world.ts`;
   `cubeSplitRule`, `CubeSelectOptions`, `CubeFillOptions`,
   `CubeHeightSample`; `EARTH_OPENING`; the three terrain `index.test-only.ts`
   files. Each needs a grep before removal.
