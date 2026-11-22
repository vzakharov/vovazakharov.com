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

## Next

Step 2: frames before (lead head `bd43fa32`) and after at 820 km, 34 km, 4400 m,
560 m, 60 m, 2 m along lat 44, lon 10; then tune.
