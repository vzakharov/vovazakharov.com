# Relief — hand-over note

Branch `claude/island-beauty-relief`, cut from `claude/island-beauty-c1rj3b`.
Everything is inside `src/island/entities/terrain/height/model/`.
`heightAtSphere(distance, seed, p, finest)` keeps its signature; no per-vertex
attribute was added.

## What the ground is now

- **`shore.ts`** — the beach, the dune belt and the lowland floor. Dunes: up to
  22 m, ridges 160 m apart with the steep face inland, bent and broken into
  runs by three noise octaves
  (780, 390, 195 m), from 30 m in to 1.5 km, thinning where the ground under
  them passes 90 m. Ground over 20 m is not sand-coloured, so most dunes draw
  green: the colour is the renderer's to settle. The
  floor is 65 m, reached over 700 m, so ground is above the sand band (20 m)
  from ~260 m inland.
- **`octaves.ts`** — the 17 noise octaves (400 km → 6 m) and the three kinds of
  ground: `GREEN`, `BROWN`, `ALPINE`. Each kind is four numbers and two
  amplitude lists; tuning a band is editing its entry.
- **`relief.ts`** — `reliefAt`: the broad relief (plateau + regional octaves +
  belt uplift, basins levelled near 220 m) tells the kind — green under 300 m,
  brown by 550 m, alpine 600 → 1100 m, blended. The seven hill octaves draw one
  "line field" (a sharp line where an octave's noise crosses zero, each shorter
  octave kept near the lines before it, so lines branch). Green and brown read
  the lines as valleys, alpine as crests. The 6 km and 3 km octaves lead the
  field: when the 25 km one led, a range from orbit was rings of snow. On land
  the hill band grows in over 1.5 km from the shore, a kind's lift over 6 km.
- **`ranges.ts`** — `upliftAtSphere`: mountain belts from three slow seeded
  fields. Inland belts follow the zero lines of a 2400 km field; coastal ranges
  stand 80–360 km behind some shores; a 3300 km field says which regions have
  either.
- **`height-sphere.ts`** — draws the noise, bends each octave's lattice point
  by the octave before it, passes the uplift.

## Numbers others depend on

- `HIGHEST_GROUND` 4997, `LOWEST_GROUND` −5525, `SPHERE_GROUND_SLOPE` ≈ 742.
  All true bounds, all loose. The quadtree's height bracket is the full range
  for any tile wider than ~7 m.
- Tile fill 1.1–1.2× the baseline; `groundAt` ~8.5 µs.
- Green ground's relief inside a 1 km window, tilt removed: 55–110 m.

## What is wrong, in the order I would fix it

1. **Straight crests.** Value noise crosses zero along its lattice cells, so a
   crest can run straight for several kilometres and meet another at a corner.
   Mixing each octave with the one before (`LINE_OWN`) softens it. The cure is
   a gradient noise for the hill band, at roughly 1.3× the noise cost.
2. **Valleys are not one drainage tree.** They branch but do not join
   downhill; a real fix is a flow field, which does not fit a pure per-point
   function cheaply.
3. **Faint curved creases in green ground**, where a line dies out or the
   lowland floor's squeeze begins: the height is smooth there, its curvature
   is not.
4. The slope bound is ~60× looser than the baseline's; tightening its
   arithmetic would give the quadtree tighter brackets.

## How to look at it without a browser

Scratch scripts of mine lived in `tmp/` (not committed): a hillshade renderer
calling `heightAtSphere` over a patch, and a tile-fill benchmark calling
`fillCubeTile` at levels 3–17. Both are a page of code over the public barrel
`@/island/entities/terrain`.
