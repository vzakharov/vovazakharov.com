# Relief — hand-over note

Branch `claude/island-beauty-relief`, cut from `claude/island-beauty-c1rj3b`.
Everything is inside `src/island/entities/terrain/height/model/`.
`heightAtSphere(distance, seed, p, finest)` keeps its signature; no per-vertex
attribute was added.

## What the ground is now

- **`shore.ts`** — the beach, the dune belt and the lowland floor. Dunes: up to
  12 m, ridges 110 m apart along the shore, from 30 m in, gone by ~850 m. The
  floor is 65 m, reached over 700 m, so ground is above the sand band (20 m)
  from ~260 m inland.
- **`octaves.ts`** — the 17 noise octaves (400 km → 6 m) and the three kinds of
  ground: `GREEN`, `BROWN`, `ALPINE`. Each kind is four numbers and two
  amplitude lists; tuning a band is editing its entry.
- **`relief.ts`** — `reliefAt`: the broad relief (plateau + regional octaves +
  belt uplift, basins levelled near 160 m) tells the kind — green under 300 m,
  brown by 550 m, alpine 600 → 1100 m, blended. The seven hill octaves draw one
  "line field" (a sharp line where an octave's noise crosses zero, each shorter
  octave kept near the lines before it, so lines branch). Green and brown read
  the lines as valleys, alpine as crests.
- **`ranges.ts`** — `upliftAtSphere`: mountain belts from three slow seeded
  fields. Inland belts follow the zero lines of a 2400 km field; coastal ranges
  stand 80–360 km behind some shores; a 3300 km field says which regions have
  either.
- **`height-sphere.ts`** — draws the noise, bends each octave's lattice point
  by the octave before it, passes the uplift.

## Numbers others depend on

- `HIGHEST_GROUND` 4647, `LOWEST_GROUND` −5525, `SPHERE_GROUND_SLOPE` ≈ 199.
  All true bounds, all loose. The quadtree's height bracket is the full range
  for any tile wider than ~23 m.
- Tile fill 1.1–1.2× the baseline; `groundAt` ~9.5 µs.
- World 0 land by height: 99.8% above 60 m, 40% above 300, 22% above 450, 8%
  above 800, 4% above 1150, 1.7% above 1650; crests to ~3.6 km.

## What is wrong, in the order I would fix it

1. **Straight crests.** Value noise crosses zero along its lattice cells, so a
   crest can run straight for several kilometres and meet another at a corner.
   Mixing each octave with the one before (`LINE_OWN`) softens it. The cure is
   a gradient noise for the hill band, at roughly 1.3× the noise cost.
2. **Green hills are gentle and their valleys are not one drainage tree.**
   Valleys branch but do not join downhill; a real fix is a flow field, which
   does not fit a pure per-point function cheaply.
3. **Valley floors that reach the lowland floor are level at 65 m.**
4. The slope bound is ~16× looser than before; tightening its arithmetic would
   give the quadtree tighter brackets.

## How to look at it without a browser

Scratch scripts of mine lived in `tmp/` (not committed): a hillshade renderer
calling `heightAtSphere` over a patch, and a tile-fill benchmark calling
`fillCubeTile` at levels 3–17. Both are a page of code over the public barrel
`@/island/entities/terrain`.
