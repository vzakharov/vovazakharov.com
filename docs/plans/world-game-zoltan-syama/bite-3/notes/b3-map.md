# b3-map — step B's map: fact sheet, design, cut

Reader agent, base 6e584e7a4, no source changed. Step A had pushed nothing yet,
so A is assumed to give "a lat-lon grid of `f` and its analysis inverse".

## 1. Fact sheet — what is plane-coupled today (paths under `src/island/`)

### `shared/globe`

- `globe.ts` — the planet frame (`R`, `+Y` the axis) and the plane laid on it.
  Plane-coupled: `PlanePoint`, `CENTRE` (10° N on the `+X` meridian),
  `EAST = [0,0,-1]`, `NORTH`, `planeToWorld(x,y,h)`, `worldToPlane(p)`
  (undefined at the centre's antipode). Longitude therefore grows toward `−Z`:
  `p = (cos φ cos λ, sin φ, −cos φ sin λ)`. `Elevated` and `R` are not plane.
- `coast.ts` — `Coast` (rings in plane km), read by `coast-field.ts` alone.
- Readers of the plane functions: `tile/model/tile-fill.ts` (lattice →
  `planeToWorld`), `quadtree/model/quadtree.ts` (`visible`, border points),
  `quadtree/model/split.ts` (`worldToPlane(eye)`, `viewDistance`),
  `features/eye/model/pose.ts` (`planeToWorld`, `tangentAt` on
  `CENTRE/EAST/NORTH`), `features/eye/model/eye.ts` (`PlanePoint`,
  `PLANE_LIMIT = 0.75πR`), `pages/island/lib/tile-pool.ts` (`worldToPlane` for
  `nearestFirst`), `pages/island/lib/sun.ts` (`CENTRE/EAST/NORTH`: the sun is
  fixed over 10° N).

### `entities/terrain/coast-field`

- `coast-field.ts` — a signed distance (metres, + inland) on a square plane
  grid. Plane-coupled: `CoastGrid` (`originX/Y`, `cellMetres`, `Gridded` from
  `@/scene/shared/lib/plane`), `CoastField`, `buildCoastField(coast)` (rings →
  grid), `signedDistanceField(segments, inside, grid)` (the B7 true-distance
  sweep: exact near segments, two 8-neighbour passes), `sampleCoastField(f,x,y)`
  (bilinear, extrapolates negative off the grid).
- Readers: `height.ts` (`sampleCoastField`), `split.ts` (`astride`),
  `world-field.ts` (`signedDistanceField`), `contour.ts` (`CoastGrid`),
  `quadtree.ts`/`detail.ts` (type), `tile-protocol.ts`, `tile-worker.ts`,
  `island-scene.ts` (`coast` for selection, `groundOf`).

### `entities/terrain/height`

- `height.ts` — `heightAt(field, seed, x, y, finest)`: plateau/shelf from `d`,
  17 value-noise octaves (400 km … 6 m) on plane `(x, y)`, each rotated by
  `0.618(o+1)` in 2D, faded near the coast and by `finest`; lowland floor.
  Exports `GROUND_SLOPE` (built on `OCTAVE_STEEPEST = 3.75√2·1.4 + 1.5√2 + 1`,
  the 2D lattice's), `HIGHEST_GROUND`, `LOWEST_GROUND`.
- `value-noise.ts` — 2D value noise, `hash(ix, iy, salt)` with `Math.imul`,
  quintic fade, `noiseSalt(seed, layer)`.
- Readers of `heightAt`: `tile-worker.ts`, `island-scene.ts` (`groundOf` →
  `GroundAt(x,y)` for the eye and `selectTiles`' `ground`).

### `entities/terrain/tile`

- `tile.ts` — `TileKey = PlanePoint & { level }` over one square
  `TILE_SQUARE = 16,384 km` centred on `CENTRE`; `MIN_LEVEL 3` (64 roots),
  `MAX_LEVEL 18` (0.98 m spacing), `SPLIT_RATIO 1`, `TILE_GRID 65`; `tileId`,
  `tileSide(level)`, `latticeCoordinate(level, cells, k)` (bit-exact shared
  edges), `tileRect(key)` (plane metres).
- `tile-fill.ts` — `HeightSample = (x, y, finest)`,
  `fillTile(key, sample, {finest(x,y)})`: `(grid+2)²` lattice with an outer ring
  for normals, each point `planeToWorld(x, y, h)`; positions float32 relative to
  the tile's float64 `centre`; flared skirt; `borderLoop`, `tileBuffers`.
- Readers of `TileKey`/`tileRect`/`tileSide`: `quadtree.ts`, `split.ts`,
  `detail.ts`, `tile-cover.ts` (`distanceTo`, `nearestFirst`, `within`,
  `parentOf` — plane `x/y` arithmetic), `tile-meshes.ts`, `tile-pool.ts`,
  `tile-protocol.ts`, `island-scene.ts` (`ROOTS` from `MIN_LEVEL`).

### `entities/terrain/quadtree`

- `quadtree.ts` — `selectTiles(eye, {coast, frustum, ground})`: descend from the
  one root, `visible` (horizon via angle `middle`↔border, frustum hull of
  border points at low/high, `bulge`), `balance` (neighbours by `x±1, y±1`
  inside `2^level`, no wrap).
- `split.ts` — `children`, `splitRule(eye, coast)`: side over distance from
  `eye` to the tile's plane-clamped nearest point at the eye's height;
  `COAST_FINER 2` levels more where `|sampleCoastField(centre)| < side`.
- `detail.ts` — `detailCut(eye, coast)(x, y)`: leaf holding the point, the
  coarser leaves in the 3×3 around each ancestor, `gap`/`apart` between plane
  rectangles, `reach` ramp. All plane rectangles.

### `entities/terrain/world` (bite 2's planar world)

- `world-field.ts` — `buildWorldField(world, mask)`: dome + tapered waves by
  `ifft2` on the 1024² `GRID` → `contourOf` → `signedDistanceField`;
  `worldSeed`. `square.ts` — `SQUARE`, `GRID`. `contour.ts` — `isLand`, marching
  squares in plane metres. `hash.ts` — `murmur3`, `isWorldNumber`
  (`/^[1-9]\d*$/`, so `#0` is refused today), `worldHash`. `mask.ts` —
  `OUR_WORLD = '1'`, `MASK`, `worldWords`. `layout.ts`, `dome.ts`,
  `harmonic.ts`, `fft.ts`, `decode.ts` — R5 retires layout, dome, mask, square
  and the planar field at the switch.
- Readers: `terrain/index.ts` re-exports `SQUARE`, `buildWorldField`,
  `worldSeed`, `OUR_WORLD`, `isWorldNumber`, `assertWorldNumber`;
  `tile-worker.ts`, `world-hash.ts`, `scripts/play-island.ts`,
  `scripts/lib/play-tab.ts`.

### `features/eye`

- `eye.ts` — `Eye = PlanePoint & Elevated & {heading, floor, aim}`, heading
  clockwise from plane north; `aimed` moves `x/y` by `onPlane(heading)`;
  `withinPlane` clamps to `PLANE_LIMIT`; `step` eases `x/y` linearly, height in
  log, heading with whole-turn bookkeeping (`shortest`); `GroundAt(x,y)`.
- `pose.ts` — `poseOf(eye, aspect)`: `planeToWorld(x, y, floor+height)`,
  `tangentAt` (the azimuthal map's differential), pitch by height.
- `eye-controls.ts` — produces `Intent` only (screen-space); no plane, keeps.

### `pages/island`

- `lib/tile-worker.ts` — `init` builds `buildWorldField(world)` + `worldSeed`,
  `fill` = `fillTile` + `heightAt` + `detailCut(eye, field)`, sea tile
  `fillTile(key, () => 0)`.
- `lib/tile-protocol.ts` — `WorldField = {field: CoastField, seed}`, requests
  carry `key: TileKey`, `eye: Vec3`.
- `lib/tile-pool.ts` — 2 workers, each builds the field; `want` sorts by
  `nearestFirst(keys, worldToPlane(eye))`.
- `lib/world-hash.ts` — `worldOfHash`: `isWorldNumber` else `OUR_WORLD`.
- `lib/sun.ts` — `sunToward(elev, az)` over `CENTRE`'s horizon.
- `model/tile-cover.ts` — `coverOf`, `coverAround` (key arithmetic: needs a
  face, else plane-free), `distanceTo`/`nearestFirst` (plane rects).
- `ui/island-scene.ts` — `ROOTS` (4^MIN_LEVEL keys), `groundOf`,
  `eyeAt({x:0, y:0, height: MAX})`, `moveTo(x, y, m)`, `turnTo(heading)`,
  `setWorld`. Relative-to-eye drawing is already float64 (`tile-meshes.ts`).
- `ui/play-hook.ts`, `shared/play/play-hook.ts` — `moveTo(x, y, m)` in plane
  metres, `turnTo(heading)` from north.
- `ui/ground-lighting.ts` — one world-fixed sun (20° over 10° N's horizon from
  the NW) + a hemisphere fill kept over the eye.

### `scripts/`

- `play-island.ts` — five heights; `INLET` shots at plane points
  `(515 km, 1,750 km)`, `(510 km, 1,250 km)`, `turnTo(−π/2)`, only on `#1`.
- `film-descent.ts` — `LANDING = (499,000, 1,113,200)` plane m, `START (0,0)`,
  interpolates plane `x/y` with height.
- `lib/play-tab.ts` — `worldArgument` (`assertWorldNumber`), `worldPrefix`,
  `playPath` (no hash for `OUR_WORLD`).
- `entities/coast.retired.md` — the tracer, `coast.json`, `fit-world.ts` and
  `lib/fit-*` are at 695281ebf; one `git checkout` line restores them plus two
  `package.json` entries (`trace:island`, `fit:island`).

## 2. Design for step B

### 2.1 The cube-to-sphere map: equal-angle

Face `(a, b) ∈ [−1, 1]²` → `(tan(πa/4), tan(πb/4), 1)` normalised, permuted per
face. Measured on a 512² face (scratch numpy, this note):

| map                | cell area max/min | cell edge max/min | inverse     |
| ------------------ | ----------------- | ----------------- | ----------- |
| gnomonic (tangent) | 5.18              | 2.12              | closed form |
| equal-angle        | 1.41              | 1.41              | closed form |
| Nowell/Everitt     | 1.34              | 1.73              | iterative   |

Equal-angle wins on edge ratio, which is what sets vertex spacing and so the
detail cut and `MAX_LEVEL`; Everitt's 5% better area costs a worse edge and a
Newton inverse in the hot path (`sphereToFace` per sample, per eye). COBE is
equal-area but has slope breaks on the diagonals and no closed inverse. All
three keep the cube corners' 60° cells; that is inherent.

Traps for the implementer:

- `Math.tan(Math.PI / 4)` is `0.9999999999999999`. A face edge must map `a = ±1`
  to exactly `±1` (special-case it), or two faces disagree on the shared edge's
  vertices.
- Orient the six faces so that along every shared edge the along-edge coordinate
  is equal or negated on the two sides (a fixed table of 24 edge transforms,
  tested both ways). Negation is exact in float, so shared vertices stay
  bit-equal.
- Sizes: face arc ≈ πR/2 = 10,007 km, so with `TILE_GRID 65` a level-`l` cell is
  10,007 km / 2^l / 64 at the face's middle, up to 1.41× that toward its edges.
  `MAX_LEVEL = 17` gives 0.84–1.19 m (today 0.98 m); `MIN_LEVEL = 2` gives 96
  roots with 28–39 km cells (today 64 roots, 64 km). Recommend 17 and 2.

### 2.2 The coast field on the sphere

**Where it lives: on step A's lat-lon grid, not resampled onto faces.** The grid
A synthesises is the one `f` exists on; resampling onto six face grids (~1024²
each, 6.3 M nodes) would need an interpolation of a band-limited `f` sampled
near Nyquist, plus a contour and a sweep that cross 12 seams. The lat-lon grid
needs only two topology rules, both cheap:

- longitude wraps (column `n` = column 0);
- across a pole, ring `−1` at `λ` is ring `0` at `λ + π` (Gauss–Legendre rings;
  equiangular ones put one value on the pole row). Bilinear sampling in `(θ, λ)`
  is then continuous everywhere, the pole's ~20 km cap included.

**Resolution is the open number.** A's minimum, `L+1 = 512` rings ×
`2L+2 = 1024` longitudes, is 39 km at the equator — four times coarser than bite
2's 10.2 km grid, and the contour is linear between nodes. Recommend `2×`: 1024
× 2048 (19.6 km, 4 nodes per finest wave). Longitudes are nearly free (a
zero-padded FFT per ring); rings cost one Legendre pass each (~L²/2 ≈ 131 k
multiply-adds), so doubling them doubles A's synthesis. Take A's measured
per-ring cost: if 1024 rings fit A's ~1.5 s, use them; else synthesise A's rings
and interpolate the extra ones cubically in θ (f is smooth at that scale).

**Distance: call 1 and B7 disagree; keep B7's true distance.** Call 1 says
height derives from `f` "as bite 2's build does on the plane (`d = f/|∇f|`)".
Bite 2's build does not: B7 (the lead's ruling, memo 22:10) replaced `f/|∇f|`
with a true distance to `f`'s zero line, because the pseudo-distance spiked on
saddles between near water (ridges at 1,000 km) and undershot deep inland (snow
lost). Nothing about the sphere removes either defect — with no dome, saddles
are more common. So: marching squares on the lat-lon grid (wrap and pole rules
above), segment endpoints turned into 3D unit vectors, and
`signedDistanceField`'s sweep with each offer measuring the 3D chord to the
segment (great-circle `2R·asin(c/2)` once per node at the end; at ≤ 1,000 km the
two differ < 0.1%). Cost: bite 2's sweep was ~100 ms on 1 M nodes; 2 M nodes
with 3D segment maths, estimate 300–500 ms. The sweep needs a third pass for the
wrap (left-to-right cannot carry across column 0 → `n−1`): run the row passes
twice around, or seed both ends. The lead should confirm B7 over call 1's
wording in writing before B2 starts.

### 2.3 Height and noise at a point

- `heightAt(field, seed, p, finest)` with `p` a unit vector;
  `d = sampleSphereField(field, p)`; everything after `d` unchanged.
- Value noise in 3D metres: `valueNoise3(salt, u, v, w)` on `R·p`, 8 corner
  hashes (`hash(ix, iy, iz, salt)` with a third `Math.imul` constant), quintic
  fade. Each octave turned by a fixed 3D rotation (e.g. about axis
  `(1, 1, 1)/√3` by `0.618(o+1)`) so lattices never align. Lattice indices at
  the 6.1 m octave reach `R/6.1 ≈ 1.04 M`: inside int32, `Math.imul` safe. Cost
  ~2× per octave; tiles fill in workers, so it is budget, not jank.
- `OCTAVE_STEEPEST` becomes `3.75√3·1.4 + 1.5√2 + 1` (three axes): raises
  `GROUND_SLOPE`, so `relief`'s cull gets looser, not wrong.
- Noise on the sphere's surface point, not the vertex's elevated point, so a
  height does not feed back into its own noise.

### 2.4 Quadtree, split, detail, fill

- `TileKey = { face: 0..5, level, x, y }`, `tileId` = `f/l/x/y`. Pure function
  of `(world, face, level, x, y)`.
- A tile's geometry: a `TileCap` (unit centre, angular radius over its four
  corners and edge midpoints). Every plane rectangle in `split.ts`, `detail.ts`,
  `quadtree.ts`, `tile-cover.ts` becomes a cap: `distance(eye, key)` = chord to
  the cap's nearest point at the eye's clamped height; `gap(cap, p)` =
  `max(0, angle(p, centre) − radius)·R`; `apart(a, b)` alike. The `reach` ramp
  keeps its contract (≥ the leaf's need under the leaf, continuous); caps
  over-cover a square's corners, which only asks more.
- `tileSide(key)` → the tile's longest cell edge × cells (position-dependent, ≤
  1.41× the face-centre value), so the split stays conservative.
- **One neighbour function serves three readers**: `neighbour(key, dir)`
  (crosses a face edge through the 24-transform table). `balance`, `detail`'s
  3×3 `around`, and tests all go through it. Roots: 6 × 4^MIN_LEVEL.
- `holding(p)`: `sphereToFace(p)` → face, `(a, b)` → descend.
- `fillTile(key, sample(p, finest))`: lattice `(a, b)` from `latticeCoordinate`
  in face units (exact at shared edges in-face; at face edges by the `±1` rule
  above). **Normals across a face edge**: the outer ring beyond the face must be
  the neighbour face's lattice row, not this face's map extrapolated past
  `a = 1`, or the two tiles light the seam differently. At a cube corner (three
  faces) the outer-ring point does not exist; take the normal from the three
  real neighbours.
- Sea tile: `fillTile(key, () => 0)` unchanged in role.

### 2.5 Precision near R = 6,371 km

Float64 in JS (ulp 9e-10 m at R; face units resolve level 17 with 1e9 to spare).
Float32 reaches the GPU only relative to a tile's float64 centre (root tile
~2,500 km: ulp 0.25 m where a cell is 39 km) and as `centre − eye` offsets
already taken in float64 (`tile-meshes.ts`). No new work; the one new hazard is
`tan(π/4)` (2.1).

### 2.6 The eye on the sphere

State:
`{ at: Vec3 (unit), ahead: Vec3 (unit tangent at `at`), height, floor, aim: { at, ahead, height } }`.
No latitude, longitude or heading angle is stored, so a pole is an ordinary
point.

- Steer/shift: rotate `aim.at` about `normalise(at × dir)` by `dist/R`, `dir`
  from screen right/up in `(ahead, ahead × at)`; the same rotation carries
  `aim.ahead` (parallel transport). Flying north over a pole keeps screen-up:
  the heading-from-north flips by π there, which is right.
- Turn/twist: rotate `aim.ahead` about `aim.at`.
- Ease: slerp `at` toward `aim.at` by `toward`; transport `aim.ahead` to the new
  `at` and rotate `ahead` toward it by `toward` of the signed angle — the
  shortest way, so `shortest`'s whole-turn bookkeeping goes.
- `poseOf`: `position = at·(R + floor + height)`, `level = ahead`; `tangentAt`
  and `PLANE_LIMIT` go.
- Angles only at the edges: `eyeAt({ lat, lon, height, heading })` and the
  hook's `turnTo(heading)` take heading from geographic north; at a pole (|φ| >
  89.9999°) north falls back to the `+X` meridian's.
- `GroundAt = (p: Vec3) => number`.
- Openings: #1 at `CENTRE` (10° N, 0°), heading north, `MAX_HEIGHT` — today's.
  #0 over the Mediterranean, e.g. 38° N, 15° E, at `MAX_HEIGHT`. This fixes the
  convention that Earth's Greenwich sits on `+X`, longitude east toward `−Z`;
  the #0 fit (step C) must use it.
- Hook: `moveTo(lat°, lon°, m)` replaces `moveTo(x, y, m)`.

### 2.7 Worker, pinned table, URL

- Worker `init {world}` → `rollWorld(world)` (A) or the pinned row → A's
  synthesis → contour + true distance → `{ field: SphereField, seed }`. Budget 3
  s desktop: A ≤ 1.5 s, distance ≤ 0.5 s, the rest slack. Two workers build in
  parallel, so wall time is one build; phone figure to report.
- Pinned table (call 5): `world/model/pinned/<N>.json`,
  `{ L, bits, scale, words: base64 }`, loaded by a dynamic `import()` keyed by
  number so a row ships only when opened; zod-parsed at the boundary. 262,144
  coefficients: at 32 bits 1.0 MB (1.4 MB base64), at 12 bits 393 KB. Step B
  writes row #1; #0 opens as `H(0, ·)` until step C writes its row (say so in
  B's report).
- `isWorldNumber` → `/^(0|[1-9]\d*)$/` (R1 makes `"0"` a number); no hash still
  means `'1'`.

### 2.8 The #1 fit brings the rings back

- Restore per `coast.retired.md` (695281ebf): `entities/coast/` (tracer, rings
  with all five lakes, `coast.json`), `fit-world.ts`, `lib/fit-*`, the two
  `package.json` entries. Re-adding the slice means `check:masd` counts it
  again: it has only scripts as readers, so it needs the
  `// masd-disable insignificant -- …` marker, which is the operator's call.
  Alternative to ask about: move `coast.json` + the tracer under `scripts/lib/`
  (scripts are not slices), dodging the marker.
- `planeToWorld`/`worldToPlane`, `CENTRE/EAST/NORTH` move from `shared/globe` to
  `scripts/lib/azimuthal.ts` — the plane survives only there (call 8). `sun.ts`
  needs a local frame of its own (below).
- Target on A's analysis grid: each node `p` → `worldToPlane(p)` → the rings'
  signed distance (`buildCoastField` + `sampleCoastField`, plane metres ≈ ground
  metres near the island: the map is exact radially and stretches tangentially
  by `(d/R)/sin(d/R)`, 4% at 2,000 km), clipped (call 6) at e.g. ±500 km; nodes
  beyond 9,000 km of `CENTRE` are set to the clip (the antipode is undefined in
  `worldToPlane`). B10's case for unclipped was the dome; there is no dome now,
  so call 6's clip stands.
- Analysis to L = 511 (A), quantise at `bits`, resynthesise, compare sign with
  the rings' inside mask on the grid, and print the wrong-land share (bite 2:
  0.63%; the contract's bar 0.7%) and where (lat/lon boxes), then the fewest
  bits that keep it. Writes `pinned/1.json`.
- Test: the row decodes to the fitted coefficients exactly.

### 2.9 Open calls (for the lead)

1. **B7 vs call 1** — recommend true distance (2.2); needs the lead's word.
2. **Coast-field resolution** — 1024 × 2048 recommended; depends on A's per-ring
   cost.
3. **The sun.** It is fixed over 10° N; the hemisphere fill follows the eye but
   the sun does not, so half the planet is lit by fill alone (~25% of the land's
   light). "#0 from four sides and both poles" will show night. Options: (a) the
   sun stands 20° over the eye's own horizon from the NW, the frame from the
   polar axis, falling back near a pole (a jump there); (b) the fixed sun
   rotated by the minimal rotation taking `CENTRE` to the eye (smooth everywhere
   but one point, 10° S 180°, open ocean). Recommend (b); (a) if the lead wants
   "north-west" to mean geographic NW everywhere.
4. **The coast slice's return** — masd marker vs `scripts/lib` (2.8); and #0 is
   the random `H(0, ·)` in step B's frames until step C.

## 3. The cut — build steps

B1–B6 add files beside the planar ones, the game untouched (new code inside
existing slices, so `check:masd` sees no test-only slice); B7 switches; B8
deletes and films. Order: B1 first (small); then B2 (needs A), B3, B4 (needs
B3's `TileKey`) and B5 in parallel on disjoint files; B6 beside them once A
lands; B7, then B8, alone.

- **B1 — cube and geo primitives.** `faceToSphere(face, a, b)`,
  `sphereToFace(p)`, the 24 edge transforms and `neighbour(key-like, dir)` on
  bare `(face, level, x, y)`, `latLonToUnit`/`unitToLatLon`, `northAt(p)` with
  its pole fallback. Ends: tests — round trip to 1e-12; shared-edge points
  bit-equal from both faces (all 12 edges, all levels to 17); `neighbour` is an
  involution across every edge; cell edge ratio ≤ 1.415.
- **B2 — the sphere coast field and world build.** Marching squares on the
  lat-lon grid with wrap and pole rules; 3D segments; the true-distance sweep
  with wrap; `sampleSphereField(field, p)`; `buildSphereWorld(world)` =
  roll/pinned → A's synthesis (at the resolution of open call 2) → field + seed.
  Ends: tests — a small-circle land cap `f = p·c − cos 20°` gives distances
  within one cell of the analytic great-circle distance, including a cap centred
  on a pole and one across the date line; sampling continuous across `λ = 0` and
  the pole; a timing line for `L = 511` in Node (the worker budget). Frame: R6's
  equirectangular PNG with the distance's zero line drawn, #2.
- **B3 — cube tiles and the quadtree.** `TileKey` with `face` (in a new module
  beside `tile.ts`, switching the type at B7), `tileCap`, `tileSide(key)`,
  `latticeCoordinate` per face; `selectTiles`, `splitRule`, `balance`,
  `detailCut` over caps and `neighbour`. Ends: tests ported from
  `quadtree.test.ts`/`detail.test.ts` plus: an eye over a face edge and over a
  pole selects a balanced set (no shared edge differs by > 1 level, across faces
  included); `detailCut` continuous across a face edge (sampled pairs 1 mm apart
  differ < 1e-6 relative). The heaviest step: one agent, full.
- **B4 — height and fill on the sphere.** 3D value noise,
  `heightAtSphere( field-sampler, seed, p, finest)` taking `(p) => d` so it does
  not wait for B2, the new `OCTAVE_STEEPEST`; `fillTile` for a cube key with the
  neighbour-face outer ring. Ends: tests — noise continuous and seed-stable; two
  tiles sharing a face edge give bit-equal positions and equal normals (1e-6) on
  it; ported `height.test.ts` slope bound holds.
- **B5 — the eye on the sphere.** State and `step` per 2.6, `poseOf`. Ends:
  tests — a held steer north from 80° N crosses the pole in a straight line with
  screen-up constant; turn then steer at the pole; easing converges; `eyeAt` at
  the openings; ported `eye.test.ts`/`pose.test.ts` cases.
- **B6 — the fit and the pinned table.** Restore per 2.8; azimuthal map to
  `scripts/lib`; fit #1; `pinned/1.json` at the fewest bits; loader with dynamic
  import and zod. Ends: the fit prints wrong-land share and where; test that row
  #1 decodes to the fitted coefficients exactly; R6's PNG of #1 beside bite 2's
  orbit frame. Runs as soon as A lands.
- **B7 — the switch.** Worker builds `buildSphereWorld`; protocol carries
  `SphereField`; pool sorts by angle from the eye; `tile-cover` on caps and
  faces; scene: `ROOTS` per face, sphere eye, `GroundAt(p)`; hook
  `moveTo(lat, lon, m)`; `isWorldNumber` allows `0`; `sun.ts` per open call 3.
  Ends: `pnpm play:island` five heights on #1, phone and desktop; the build time
  per world printed (desktop, and a phone figure via the play run's mobile
  screen).
- **B8 — retire the plane and film.** Delete `layout`, `dome`, `mask*`,
  `square`, planar `world-field`/`contour`, `buildCoastField`'s plane grid (if
  the fit keeps it, it moves to `scripts/lib`), `PlanePoint` and the plane
  functions from `shared/globe`, the old tile/quadtree/eye modules and their
  tests; `play-island`'s `INLET` and `film-descent`'s `LANDING` as lat/lon
  constants computed once through `scripts/lib/azimuthal.ts`. Ends: frames — a
  flight across a face edge (e.g. along 45° E at 1,000 km and 10 km) and over
  the North Pole, no seam; vet's checks green.
