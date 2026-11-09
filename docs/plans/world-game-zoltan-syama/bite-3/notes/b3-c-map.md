# b3-c-map — step C (Earth as world #0): facts, design, cut

Reader's note, branch `wt/b3-c-map`, base `23db004d`. No code. Contract:
`origin/island/stretch-2:docs/plans/world-game-zoltan-syama/bite-3.md` (calls 4,
5, 6, 10; "Out of the bite"; "Done when"). Numbers marked _probe_ come from a
scratch numpy run (not committed; the method is in § 3) and are what step C
should expect, not what it reports.

## 1. How #1 is pinned today

- **Entry**: `pnpm fit:island [--clip 500] [--compare] [--bits 16,…,6]` →
  `src/island/scripts/fit-sphere.ts` (161 lines). Hard-wired to #1: `ROW_FILE`
  is `pinned/1.json`, `encodePinnedRow('1', …)`, patches reported in plane km
  through `worldToPlane`, `drawnLakes` checked.
- **Target** (`scripts/lib/fit-drawn.ts`, `lib/sphere-fit.ts`,
  `lib/coast-field.ts`): **planar**. The drawn rings' signed distance is built
  on the island plane (`buildCoastField`, plane metres, half a drawing pixel per
  cell), and each sphere node reads it through the azimuthal map
  (`worldToPlane`). Nodes past `FAR_METRES` = 9,000 km of `ISLAND_CENTRE` take
  `−clip` outright (the plane loses its direction at the antipode). Clip ±500 km
  (`DRAWN_CLIP_METRES`).
- **Analysis**: `sphereTransform(LAND_DEGREE)` (A's Gauss–Legendre 512 rings ×
  1024 longitudes, L = 511), `analyze(transform, target)` →
  `Float64Array((L+1)²)` at `sphere-series`' slots.
- **Measure**:
  `wrongLand(fine.grid, synthesize(fine, padSeries(series)), truth)` on the
  doubled GL grid 1024 × 2048 (`sphereTransform(1023)`); truth = the unclipped
  target's sign there. Prints added/dropped km², top-10 wrong patches (lat/lon),
  and each lake's water share.
- **Bits**: tries each depth high → low and keeps the fewest whose share stays
  within `KEEP_TOLERANCE` = 1e-4 (0.01 points) of the float64 share.
- **Row** (`entities/terrain/world/land/model/pinned-row.ts`):
  `{ world, degree, bits, scales[degree+1], words }`, `c_lm = q_lm·scales[l]`,
  `q` signed at `bits`, offset to unsigned, packed LSB-first, base64. One scale
  per degree. Loaded per number by dynamic `import()` from `PINNED_ROWS` (today
  only `'1'`), zod-parsed; `pinnedSeries(world)` decodes it.
- **Budget**: (L+1)² = 262,144 words. #1 sits at **8 bits: 256 KB packed, 351 KB
  JSON**, 0.68% wrong (S9). #0 has the same word count; only its bits differ.
- **Test**: `scripts/lib/fit-drawn.test.ts` re-fits #1 from the committed rings
  and checks the row equals the fit's encoding field for field.
- **Runtime**: the worker calls `openSphereWorld(world)` →
  `pinnedSeries(world) ?? landSeries(rollWorld…, PROBE_ENVELOPE)`, then
  `buildSphereWorld` synthesises onto the 1024 × 2048 field grid and runs
  `fieldOf` (contour + `sphereDistanceField`). The worker gets the number only.

**What changes for a whole-sphere coast**: nothing past the target. The
analysis, the measure (`wrongLand` is already lat/lon), the bit search and the
row codec are coastline-blind. The planar target is the one piece that cannot
serve Earth — no azimuthal plane holds a globe — so #0's target is built on the
sphere with the runtime's own pieces (§ 3).

## 2. Natural Earth

- **Reachable**: `curl` through the proxy, HTTP 200. Node 24's own `fetch` also
  gets 200 in this container (no proxy agent needed).
- **Files** (`…/natural-earth-vector/<commit>/geojson/`): `ne_50m_land.geojson`
  1,636,166 B (1,420 features, 60,669 vertices); `ne_50m_lakes.geojson` 876,018
  B (412 polygons: Lake, Alkaline Lake, Reservoir; 19,778 vertices);
  `ne_50m_antarctic_ice_shelves_polys.geojson` 131,055 B (64 features). About
  2.6 MB in all.
- **The commit to name**: `ca96624a56bd078437bca8184e78163e5039ad19` (master's
  head, 2022-06-02; the land file last changed in 693f1142, the lakes in
  ace5fed0). The pinned-commit URL serves the same bytes as `master`. sha256,
  which the fit checks:
  - land `e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b`
  - lakes `d350b75978b26fe839b797c2c529b2fb8f47fb3983c03f4964e36d5df9378a52`
  - shelves `fedf866d20e20e37d037fa19968b6d3022fbe5323fd8728527b0f0ddb547e790`
- **Committed or fetched**: fetched at fit time, never committed (call 6). Cache
  under gitignored `tmp/island/natural-earth/<commit>/` so a re-fit does not
  re-download.
- **Licence line**: "Natural Earth — public domain (naturalearthdata.com/about/
  terms-of-use). Made with Natural Earth." The GitHub repo reports no SPDX id;
  the terms page is the source. Goes in the script header and the PR body.
- **Topology facts**: Antarctica's land polygon reaches the pole and covers it;
  Ross and Filchner–Ronne are **not** in `ne_50m_land` but in the ice-shelves
  layer. The Caspian is a hole in Eurasia (sea), not a lake. Suez and Panama are
  land; the Bering Strait is water. Polygons are split at ±180°, so a lon/lat
  scanline never wraps.

## 3. The target, the degree, the words

**Rasterise** land ∪ ice shelves, minus lakes, by an even-odd scanline per GL
ring in lon/lat (NE's vertices are dense enough that straight lon/lat edges are
the data's own): one membership mask per layer, then `land | ice & ~lakes` — OR,
not XOR, since the shelves abut the land polygons.

**Signed distance on the sphere** — recommended route: rasterise on the 1024 ×
2048 field grid (`fieldGrids(1024, 2048)`), take `fieldOf(±1 mask)`
(`sphereContourOf` + `sphereDistanceField`, the runtime's own), and read the 512
× 1024 analysis nodes with `sampleSphereField`, clipped ±500 km. The contour of
a ±1 mask lies mid-cell, ~10 km off the true coast — under a quarter of the
finest wave (78 km). The same mask is the truth `wrongLand` reads on that grid,
so target and truth agree by construction, as B6's do.

**Degree**: L = 511, as #1 (call 2 forbids raising it; lowering it only for #0
saves bytes but loses coasts — _probe_ wrong land 15% at L = 127, 9% at 255,
5.9% at 511). Orbit reads as Earth at any of these; "three coasts at 1,000 km"
needs 511. Words: 262,144, at #1's 8 bits 256 KB packed / ~351 KB JSON; the
fewest bits that keep the share is C2's measure.

**_Probe_ numbers** (numpy, GL 512 × 1024, distance to coast nodes, measured on
the analysis grid itself — coarser than B6's measure):

|                                     | Land share | > 1% of land | Largest, next                                    |
| ----------------------------------- | ---------: | -----------: | ------------------------------------------------ |
| NE raster, ice shelves in           |     28.85% |            5 | 53.8%, 26.1% (Americas), 9.4%, 5.2%, 1.5%        |
| NE raster, shelves out (L 255 grid) |     28.50% |            6 | 54.7%, 14.2% + 12.2% (Panama cut at 78 km cells) |
| Fit L = 511, clip 500               |          — |            5 | 54.4%, 15.5% + 12.1%: **Panama opens**           |

- **Wrong land 5.9%** at clip 500 (2.85% added, 3.05% dropped) — 9× #1's, and
  **every wrong node lies within one half-cell of the coast**. Earth's coast is
  ~30,000 grid nodes long against #1's few hundred, so the share is a
  coastline-length fringe, not misplaced land. By region (share of all land):
  Canadian Arctic 0.70%, Indonesia + Philippines 0.47%, Antarctica 0.47%,
  Greenland 0.36%, Norway 0.19%, Japan 0.11%; north of 30° N holds 3.5 of the
  5.9 points.
- Afro-Eurasia holds through Suez; Antarctica stays one mass over the pole.

## 4. Earth's envelope (call 4)

- **Measure**: per degree `A(l) = √(Σ_m c_lm² / (2l+1))` of #0's fitted series —
  the rms that `env(l)·normal` gives a random world, so the two compare
  directly. Units cancel: the sea decodes in units of `σ`
  (`fieldDeviation(env)`), so only the shape (knee, slope) carries.
- **Fit**: least squares of `log A(l)` on `log(knee² + l²)` over a knee grid;
  slope = −2 × the coefficient. _Probe_ at L = 511, l = 1..511 equally weighted:
  **clip 500 → knee 8, slope 2.29**; clip 1000 → knee 6, slope 2.31; unclipped →
  knee 4.5, slope 2.32. The slope is robust; the knee follows the clip. A(l) at
  l = 1, 2, 6, 10, 30, 100, 511 (clip 500): 291, 137, 63, 41, 8.3, 0.42, 0.012
  (metres). The land indicator's own spectrum is a different object (slope 1.2)
  and is not the one to use: random worlds threshold a smooth field, as #0's is.
- **Not lace** (_probe_, `sphere.py` L = 127, 29% land, six seeds): knee 8 /
  slope 2.29 gives 31–47 pieces, 7–14 over 1%, largest 20–50%; the probe's knee
  6 / slope 2 gives 38–57, 7–11, 22–76%. Earth's envelope makes slightly
  smoother planets than the probe's, with more mid-sized continents than Earth's
  own (5 over 1%, largest 54%).
- **Random worlds**: `landSeries(land, L, env)` already takes the envelope;
  `sphere-world.ts`' default `PROBE_ENVELOPE` and `frame-worlds.ts`'
  `--knee 6 --slope 2` defaults are the two places that switch.
  `SEA_MEAN`/`SEA_SPREAD` are σ-relative (R7), so the 29% mean should carry; the
  50-world measurement is re-run under the new envelope and the test re-pinned
  only if it moves.
- **Frames asked**: #2–#6 at orbit, two sides each, under both envelopes; and
  the table (land share, landmasses > 1%, largest's share) for Earth and 20
  random worlds. `pnpm frame:island 0 2 … 21 --knee K --slope S` already prints
  the table rows (a pinned world draws its row) and the equirectangular PNG.

## 5. The row, the route, the opening

- **Row #0**: `pinned/0.json` beside `1.json`, and
  `'0': async () => (await import('./pinned/0.json')).default` in `PINNED_ROWS`.
  Nothing else in the runtime changes: `openSphereWorld('0')` then takes the
  pinned series, and `frame-worlds` draws it.
- **`#0` route**: already done by B7. `parsePlace('#0')` → world `'0'`;
  `openingOf(0)` is `EARTH_OPENING` (38° N, 15° E, `MAX_HEIGHT` 20,000 km,
  facing north); the equinox sun opens at the 20°-up afternoon hour over it
  (S17). #0 is `H(0, ·)` until the row lands (S6).
- **The east trap**: `latLonToUnit` is
  `[cos lat cos lon, sin lat, −cos lat sin lon]` and the fit's nodes take
  `lon = 2πj/columns`. #1's check could not see a mirrored longitude (it sits on
  lon 0); Earth would show it as a mirrored globe. C1 pins it with a test (§ 7).
- **Build budget**: Earth's coast is far longer than a rolled world's;
  `fieldOf`'s sweep cost grows with coast length. `pnpm play:island --world 0`
  prints `buildMs` — it must stay under 3 s (call 9).

## 6. Open calls

1. **Ice shelves.** "Antarctica's ice counts as land": (a) `ne_50m_land` only
   (its ice sheet is in, Ross and Filchner–Ronne out); (b) union the ice-shelves
   layer (+0.35 points of land share, Antarctica 8.3% → 9.4% of land).
   **Recommend (b)**: the shelves are what Antarctica looks like from the
   south-pole frame the Done list asks for.
2. **Which lakes.** (a) all 412 of `ne_50m_lakes`, reservoirs included; (b)
   scalerank 0 only; (c) an area floor. **Recommend (a)**: the 1:50m layer is
   already the "large lakes" cut, and lakes under the finest wave vanish in the
   fit anyway. Report the water share of the named big ones (Superior, Michigan,
   Huron, Victoria, Tanganyika, Baikal, Great Bear, Great Slave, Ladoga,
   Balkhash, the Aral pair, Titicaca) the way B6 reports #1's five.
3. **The distance route.** (a) the mask's contour on the 1024 × 2048 grid
   through `fieldOf`, sampled at the analysis nodes (≤ ~10 km off); (b) NE's own
   edges as unit-vector segments into `sphereDistanceField`, exact, but the
   ±180° seams, the −90° closing edges and the land/shelf shared edges must be
   filtered out or they read as coast. **Recommend (a)**: no topology to get
   wrong, the mask and the coast agree by construction, and it reuses the
   runtime's code.
4. **Clip.** 500 km as #1 (knee 8), or wider (knee 6 at 1,000, 4.5 unclipped).
   **Recommend 500**: call 6 names one target for both worlds, and the slope
   barely moves.
5. **What "wrong land" reports for #0.** The share is a coast-length fringe (§
   3). (a) report it bare; (b) also report the share lying farther than half a
   finest wave (39 km) from the true coast, which is the misplaced land.
   **Recommend (b)**, both numbers in the PR body; the keep-tolerance bit search
   runs on the bare share as for #1.
6. **Panama.** The fit opens it (_probe_), splitting the Americas 15.5% + 12.1%.
   (a) accept and report; (b) bias the target along isthmuses. **(a)**: L is
   fixed, and a hand-tuned target is a second formula. C2 confirms with the real
   target.
7. **Envelope fit weighting.** (a) every degree equal (the high degrees, nine
   tenths of them past l = 50, decide); (b) bins equal in `log l`, so the knee
   region weighs as much as the tail. **Recommend (b)**, with (a) printed beside
   it; neither is the contract's, so the lead sees both.
8. **Which envelope the random worlds take** — the lead's, with the operator,
   from C3's frames (call 4). C4 waits on it.
9. **How #2–#6 are framed under two envelopes "at orbit from two sides".** The
   worker takes only the number (call 9), so the game shows one envelope per
   build. (a) an orthographic globe view added to `frame-worlds` (two sides per
   world, script only); (b) two game builds with the constant flipped.
   **Recommend (a)** for the comparison, then game frames under the chosen
   envelope in C5.
10. **Lighting for "four sides".** At a fixed hour two sides are under the moon.
    **Recommend** shooting each side at its own afternoon with the play hook's
    `setTime`, so every frame is in sunlight; poles at the hour that lights them
    best (equinox sun grazes both).
11. **The #0 row's test.** The data is never committed, so the suite cannot
    re-fit #0 offline as `fit-drawn.test.ts` re-fits #1. (a) offline: row #0
    loads, its `degree`/`bits`/`scales` length are consistent, and
    `encodePinnedRow(decodePinnedRow(row))` equals it exactly; plus a
    `fit:island 0 --verify` that re-fits from the cache and diffs; (b) a network
    test. **Recommend (a)**; the contract's "each row decodes to its fitted
    coefficients exactly" is then met for #0 by `--verify`, which C2 runs and
    reports.

## 7. Steps

Each is one agent. Shared files: `entities/terrain/index.ts` and
`world/land/index.ts` gain exports in C2; B9d is editing tile files, so a barrel
conflict on `entities/terrain/index.ts` is possible at merge (one line each
side).

- **C1 — Natural Earth to a mask.** Files: `scripts/lib/natural-earth.ts` (fetch
  at the named commit, sha256 check, cache in `tmp/`, zod schema for a
  FeatureCollection of Polygon/MultiPolygon), `scripts/lib/earth-mask.ts`
  (`earthMask(grid): Uint8Array`, land ∪ shelves − lakes, scanline per ring),
  tests beside each on inline fixtures: a square, a lake hole, a pair split at
  ±180°, a ring closing on −90° covering the pole, and the **east test** (a
  polygon around 14° E is land at +14° and sea at −14° through `latLonToUnit`
  and the grid's `lon = 2πj/columns`). Ends when the tests pass and a scratch
  run prints the mask's land share (28.8 ± 0.2%) and landmasses on 1024 × 2048.
- **C2 — the fit takes a world.** Files: `fit-sphere.ts` takes the world
  (`pnpm fit:island 0|1`; #1's output unchanged), a per-world target module
  (`lib/fit-drawn.ts` for #1, new `lib/fit-earth.ts` for #0: mask → `fieldOf` →
  `sampleSphereField` at analysis nodes → clip; truth = the mask on the measure
  grid), the far-from-coast wrong share (call 5 above), the named lakes' water
  share, `--verify`; `pinned/0.json` and the `PINNED_ROWS` entry; exports
  `fieldGrids`, `fieldOf` from the land barrel. Tests: `pinned-row.test.ts`
  gains row #0's checks (call 11); `fit-drawn.test.ts` still passes untouched.
  Ends with row #0 committed, and the note carrying the wrong share (bare and
  far), where it lies, the bits table and row size, the lakes, and
  `frame:island 0`'s PNG and table row.
- **C3 — Earth's envelope, measured and framed.** Files: a measuring script or a
  `--spectrum` mode of `fit-sphere.ts` (A(l) per degree from row #0, both
  weightings, knee and slope printed), `EARTH_ENVELOPE = kneeEnvelope(k, s)` in
  `land-series.ts` (exported, not yet the default), and open call 9's globe
  views in `frame-worlds.ts` (`--views`, orthographic, two sides). Frames: #2–#6
  under both envelopes; the table for 0 and 2–21 under both. Ends with the
  frames and tables in the note and a memo to the lead asking call 8 — "if
  Earth's envelope gives lace, say so".
- **C4 — the envelope switch** (after the lead's call 8). Files:
  `sphere-world.ts` default, `frame-worlds.ts` defaults, `land-series.ts`
  constants and their test (50 worlds' mean land share re-measured, re-pinned
  only if it leaves 29 ± 0.5%). Ends with tests green and the table re-run.
- **C5 — Earth in the game.** Files: `scripts/play-island.ts` (a shot set per
  world: #0 at orbit over 0°, 90° E, 180°, 90° W and both poles, and at 1,000 km
  over three coasts — say Italy 41° N 14° E, Florida 27° N 81° W, Japan 36° N
  138° E — each at its own afternoon through `setTime`; #2–#6 at orbit from two
  sides). Run on phone and desktop; record #0's `buildMs` against 3 s. Ends with
  frames in `notes/b3-c5-play/` and the verdict in the note.

**Order**: C1 → C2 → C3 → (lead) → C4. C5's script change runs **in parallel
with C1–C3** against `H(0, ·)`, then re-shoots once row #0 and the chosen
envelope are in. C3's globe views in `frame-worlds.ts` may start beside C2 (no
shared file).

## DRY notes

- Reused unchanged: `analyze`, `synthesize`, `sphereTransform`, `padSeries`,
  `wrongLand`, `encodePinnedRow`/`decodePinnedRow`, the bit search, `fieldOf`,
  `sphereDistanceField`, `sampleSphereField`, `landmasses`, `landShare`,
  `kneeEnvelope`, `frame-worlds`.
- New and Earth-only: the GeoJSON fetch and the lon/lat scanline. The planar
  `insideMask` in `coast-field.ts` scans plane rows over plane segments; a
  shared scanline would need a coordinate adapter for two callers with different
  grids, so the two stay separate.
- `fit-sphere.ts` keeps one bit search and one report for both worlds; only the
  target and the per-world extras (plane km for #1, lakes per world) differ.
