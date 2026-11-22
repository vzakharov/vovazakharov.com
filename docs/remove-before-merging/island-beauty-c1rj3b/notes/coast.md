# Coast package — hand-over notes

Branch `claude/island-beauty-coast`, cut from the lead's `bd43fa32`.

## Built

- `height/model/coast-detail.ts`: `detailedCoast(distance, seed)` → a
  `CoastDistance` `(p, finest = 0) => d(p + w(p))`, a **domain warp**: the field
  is read at a point pushed along the ground, so the line and every band behind
  it (beach, dune belt) bend together and the distance stays a distance. (The
  first, additive version moved the line 3–9% of each wavelength and read as
  ruler-straight from 4.4 km.)
- 13 bends, 20 km down to 4.9 m, each three noise channels from one
  `valueNoise3x3` call (one hash per lattice corner, split into three 10-bit
  channels). A bend pushes up to `0.3·λ` from 4 km down and
  `0.3·4000·√(4000/λ)` above: 1.07 km at 5 km, 760 m at 10 km, 540 m at 20 km.
  Salts `noiseSalt(seed, 3000 + i)`, the roughness `3099` (relief 0–16, belts
  2000–2002).
- One slow seeded roughness field (50 km), pushed toward its ends, scales the
  whole push between 0.3× (calm) and 1.6× (rough). `CoastDistance.calm(p)` gives
  the stretch's share of calm (0–1): the dunes stand only on calm stretches
  (`reliefAt`'s `calm`), and a rough stretch's sand is a ~20 m strip at the
  water (`sandAt`'s `calm`); both read it lazily, only where a dune or sand
  could be.
- Skerries (salt `3098`): on rough stretches, noise 300 m long over 0.4 lifts
  the sea's distance by up to 600 m, rising from 400 m out of the coast bent
  down to 600 m bends and dying from 800 m out — islets ~80 m across about
  600 m offshore, roughly one per 4 km of rough coast. A cut under 300 m keeps
  them; bounds carry them.
- `resolvedAt(finest, λ)` (shore.ts) is the one fade every cut uses: relief,
  bounds and the coast.
- Whole within 6 km of the field's coast, faded out over the next 10 km; past
  16 km the field reads unchanged.
- Band-limited like `reliefAt`: `λ ≤ finest` left out, up to `2·finest` faded
  in; a cut at 20 km is the field itself.
- Built in one place on the page: `pages/island/lib/world-ground.ts`
  `coastOf(field, seed)`, read by the worker, the selection and `groundOf`.
- Bounds: `COAST_STEEPEST` = √2 × the push's stretch (fade, roughness change,
  each bend's slope at full roughness); `coastCutReach` = √2 × the push the cut
  leaves out.
- `groundSlope(…, coastSteepest, finest)`, `detailReach = reliefReach + 124 ·
coastCutReach`, `groundSpread(m)` (height-sphere.ts) — see below.

## Measured

- Look (top-down maps, `tmp/coast/map.ts`, around 44.02, 10.05): bays and
  points 0.5–2 km deep at 8–40 km, tens of metres in and out at 1 km, metres at
  120 m, no confetti islets or lakes; Brittany and Liguria hold at 150 km.
- The coast moves at most 3.8 km (2000 samples near shore; test < 4 km): about
  a pixel from 820 km.
- Fill time, five tiles L6–L16 at 44.019, 10.046, a rough stretch
  (`tmp/coast/bench.ts`, warm, two runs): raw 216 ms → 336 ms (+56%) with
  bends, calm and skerries.
- `COAST_STEEPEST` 557 (true but loose); `SPHERE_GROUND_SLOPE` ~69 900;
  `groundSpread` sits at the range cap at every span. Tile counts unchanged
  (alpine 143/145/144, lowland 161/150/149, `tmp/coast/count-tiles.ts`).
- `detailReach(8)` 2140 m (no production reader; the relief test's bound is
  3000).
- Calm at: Liguria 44.019, 10.046 → 0 (rough); Versilia 43.735, 10.266 → 1;
  Brittany 48.4, −4.6 → 0.2.
- Pins: the dune-belt sand pin moved to Versilia, 43.735, 10.266 (Liguria is
  rough, so it lost its belt); the heights at 10° N did not move. `lowland.test.ts` passes.

## `groundSpread`

- `groundSlope(…, finest)`: the slope of the ground drawn at one cut, each
  octave weighted by its `resolved` share, the dunes' noise term gone where
  `DUNE_SPACING ≤ 2·finest`.
- `groundSpread(m)` = min(range, min over f ∈ {0, each octave's λ} of
  2·reliefReach(f) + slope_f·m), through the ground cut at f over the coast read
  whole. A test (3000 pairs, shore and inland, random seeds) holds it.
- `cube-quadtree.ts`'s bracket takes it for its slack.

## For the speed member

- **The bracket buys no tiles**, before or after the warp: counts are the same
  with `groundSpread` at the range cap.
- **The terms that hold the slope bound up:** (1) `hills` — the alpine lift
  (3200 m) × (steepest + 1) times the line field's slope, `2/LINE_WIDTH · (1 +
hillRank)` (up to ×15); (2) `broad × (1 + KIND_STEEPEST·(reach + FINE))`, ×19;
  (3) the coast's steepness, 557 against a measured few, entering
  `groundSlope` affinely at ~124 m per unit. All sup-times-sup. What would
  reach 2–3× of measured: brackets from the filled tile's own heights plus a
  slack from the finest level, or interval arithmetic of `reliefAt` over a tile.
- **The bracket's cut gap:** cap heights are `groundAt` (no cut), a tile draws at
  its cut; `detailReach` bounds the gap (relief 3.9 m at an 8 m cut, 101 m at
  128 m, plus the coast's cut bends). It predates the coast package.

## Next

- An exit per bend near the line, if fill time matters (+56% on rough coast).
- Outside these files: a rock colour in the tile cover/shader for rough
  stretches, which today draw bare ground where calm ones draw sand.
