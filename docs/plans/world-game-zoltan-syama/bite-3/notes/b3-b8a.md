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

## Red: `masd:clusters` (caused by the first commit)

With harmonic/dome gone, `world` holds two clusters: `decode`+`roll`, and
`fft`+`sphere-series` (legendre, sphere-grid below). Options: merge `decode.ts`
into `roll.ts` and `fft.ts` into `sphere-series.ts` (local, each under 400
lines), or cut `world` into sub-slices (every file moves). Design call — not
taken. Also now unread but by their tests: `fft2`/`ifft2` (planar 2D FFT, delete
them) and `encodeNormal`/`encodeUniform`.

## Left

1. The clusters call above.
2. `coast-field.ts` (all planar: `buildCoastField`, `sampleCoastField`,
   `signedDistanceField`, `CoastGrid`) moves to `scripts/lib/` — the fit
   (`fit-drawn.ts`, `sphere-fit.ts`) reads it; `SignedDistances` stays in the
   entity for `sphere-field.ts`. `height.test.ts`'s `buildCoastField` cases go
   with it.
3. Planar `height.ts` (`heightAt`, `GROUND_SLOPE`) and `valueNoise` (2D) go;
   `relief.ts` stays. `height-sphere.test` compares against `GROUND_SLOPE` (drop
   that case). `quadtree`/`cube-split` read `HIGHEST/LOWEST_GROUND` from relief,
   fine.
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
