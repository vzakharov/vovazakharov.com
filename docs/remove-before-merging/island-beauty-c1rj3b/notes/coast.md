# Coast package — hand-over notes

Branch `claude/island-beauty-coast`, cut from the lead's `bd43fa32`.

## Built (step 1)

- `height/model/coast-detail.ts`: `detailedCoast(distance, seed)` → a
  `CoastDistance` `(p, finest = 0) => d + near·Σ aᵢ·nᵢ(p)`. 13 bends, 20 km down
  to 4.9 m, `aᵢ = 0.12·λ^0.85` (543 m at 20 km, 0.47 m at 4.9 m, 1.22 km all
  together). Salts `noiseSalt(seed, 3000 + i)` (relief 0–16, belts 2000–2002).
  Each bend's lattice is `turned` (moved to `lattice.ts`) by `0.618(i+1)+0.5`.
  Band-limited like `reliefAt`: `λ ≤ finest` left out, up to `2·finest` faded
  in. Faded out by `ramp(|d| / 4.9 km)`; past that the loop is skipped.
- The bent coast is built in one place on the page:
  `pages/island/lib/world-ground.ts` `coastOf(field, seed)`, which the worker,
  the selection (`island-scene.ts`, one line) and `groundOf` all read.
  `heightAtSphere` and `sandAtSphere` pass `finest` to the distance; the
  quadtree's `astride` test reads it whole (`finest` 0).
- Bounds: `groundSlope(noise, uplift, coastSteepest = √2)` — every `√2` there
  was the distance's slope. `COAST_STEEPEST` = √2·(1 + 1.5·1.22/4.9) + Σ
  aᵢ·LATTICE_STEEPEST/λᵢ. `detailReach` adds `ALONG_COAST_STEEPEST ·
coastCutReach(finest)`, the first being the c-coefficient of the (affine)
  `groundSlope`.

## Measured

- `SPHERE_GROUND_SLOPE`: 969 → 1607 (`tmp/coast-numbers.ts`).
- `ALONG_COAST_STEEPEST` 124 m per metre of coast: loose (real ≲ 1), so
  `detailReach` grows: 8 m cut 3.9 → 164 m, 128 m cut 101 → 2478 m. No
  production code reads `detailReach`; the relief test's "< 30 at 8 m" is
  relaxed to < 200.
- Measured steepest bent distance over 4000 half-metre steps: 1.44 (bound 5.9).
- Fill time, five tiles L6–L16 at 44.019, 10.046 (`tmp/coast/bench.ts`, warm
  run): raw 225 ms → bent 296 ms (+31%) on coast tiles; inland tiles unchanged.
- Pins: none moved (`world-pin` now reads the bent coast; all 8 points are far
  from shore; sand on the 44.019, 10.046 dune belt still 1).
- `lowland.test.ts` (no sea inland on Earth, cuts 0–60 km) passes from the bent
  coast, each cut judged by its own coast.

## Built (the lead's addition: `groundSpread`)

- `groundSlope(…, finest)`: the slope of the ground drawn at one cut everywhere,
  each octave weighted by its `resolved` share (constant at one cut), the dunes'
  noise term gone where `DUNE_SPACING ≤ 2·finest`.
- `detailReach = reliefReach + 124 · coastCutReach`; `reliefReach` is the
  relief's part alone.
- `groundSpread(m)` (height-sphere.ts) = min(range, min over f ∈ {0, each
  octave's λ} of 2·reliefReach(f) + slope_f·m). It goes through the ground cut
  at f over the coast read whole, so the coast's cut never enters it. A test
  (3000 pairs, shore and inland, random seeds, bent coast, 1 m – 500 km) holds
  it.
- `cube-quadtree.ts`'s bracket takes `groundSpread` for its slack;
  `SPHERE_GROUND_SLOPE` is no longer exported from the barrel.

## For the speed member

- **The swap buys no tiles.** Counts (`tmp/coast/count-tiles.ts`, world 0,
  heading north, 60° fov, 16:9) are identical before and after: alpine 3000 m
  143, 300 m 145, 2 m 144; lowland 3000 m 161, 300 m 150, 2 m 149.
- **Why:** groundSpread vs your measured spread: 2 m 2762 (×690), 32 m 13 790
  (×160), 512 m 90 000 (×100), 2 km 324 000 (×217); from ~5 km up the range
  cap (~13.8 km) holds it. Slope bound at cut f, split (`tmp/coast/slope-parts.ts`):
  f = 0: 813 from the coast distance + 786 from noise; f = 2 km: 354 + 93; f ≥
  25 km: ~145 + ~0. **The terms that hold it up:** (1) `hills` — the alpine
  lift (3200 m) × (steepest + 1) times the line field's slope, whose noise part
  carries `2/LINE_WIDTH · (1 + hillRank)` (up to ×15 on the shortest hill
  octave) and whose coast part is the 1.5 km / 6 km rise; (2) `broad ×
(1 + KIND_STEEPEST·(reach + FINE))`, a ×19 multiplier from the kind blend.
  Both are sup-times-sup; real ground never aligns them. Arithmetic on this
  structure cannot reach 2–3× of measured. What would: brackets from the
  filled tile's own heights (your "exact" column) plus a slack from the finest
  level only, or interval arithmetic of `reliefAt` over a tile.
- **The bracket's cut gap:** the cap heights are `groundAt` (no cut), while a
  tile draws at its cut, which `groundSpread` does not cover. `detailReach`
  bounds it: 3.9 m from the relief at an 8 m cut, 19.5 m at 32 m, 101 m at
  128 m; plus the coast's cut bends, real ~a few metres near shore (bound 124
  m per metre of coast moved: 164 m at 8 m). It predates the coast package.

## Next

Tune from the lead's frames (the lead shoots the coast on the merged build).
The lead's taste: Earth's coast at 20 km stays; between 5 km and 50 m
headlands, coves and the odd skerry, not an even wiggle — if it reads even,
modulate the amplitude along the coast by one slow seeded field (calm long
beaches carrying the dune belt, rough broken-rock stretches).
