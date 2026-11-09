# b3-b9a — call 14, the stitch (pure part)

## Done

`tile/model/cube-stitch.ts`: `stitchCubeLattice` rewrites a sampled lattice's
border heights between `sampleCubeLattice` and `liftCubeLattice` (B4b's hook),
and `fillStitchedCubeTile` wraps the three. Input is `NeighbourLevels`: the
coarsest drawn level along each edge and at each corner, the corner's counting
the diagonal tile and both edge tiles.

- **The choice is the stitch, not a morph.** The finer tile's border takes the
  coarser tile's heights, as B4b prepared. Nothing in the reading stopped it.
- **A border vertex on the coarser lattice** takes the height that level's tiles
  sample there: the same `latticeDirection` and the same cut
  (`cubeCut(level, …, finest)`). So position and height are bit-equal to the
  coarse tile's own vertex, across face edges too. Its normal is the coarse
  tile's central difference over that level's lattice, equal to 1e-6.
- **A vertex between two of those** goes onto the coarse chord. It meets the ray
  along its direction, solved over `b − a` so the long vectors never cancel.
  Measured off the chord: under 1e-6 m. Its normal is `unit(nA + nB)`, which is
  what the coarse triangle interpolates halfway.
- **Corners need their own levels.** A tile can have no coarser edge neighbour
  and still have a coarser tile touching its corner diagonally, sometimes two
  levels coarser. Its two edge neighbours stitch that point, so it must too. A
  corner always lies on every coarser lattice that touches it.
- `assembleTile` takes `normalAt`, a normal override per grid vertex.
  `cube-fill.ts` exports `latticeDirection`, `liftCubeLattice` and `cubeCut`.
  The planar fill is unchanged.
- An edge more than one level coarser throws, because balance forbids it.

Numbers: the B8b sparkle comes from the sag, `cell²/8R`. A level-5 cell is
`cubeLevelSpacing(5, 64)` ≈ 4.9 km, so the sag is ≈ 0.47 m. That matches B8b's ≈
0.5 m. After the stitch, the fine border's odd vertices sit within 1e-6 m of the
coarse chord, in float64 before the float32 cast. The tests run grid 17 at
levels 4 (every face edge, both ways, four places along each), 9 and 10.

## Left: the wiring (B9b)

It takes more than one step, because the view caches by tile id. It also draws a
cover that can differ from the selection.

1. **Levels from the cover**: add a pure helper in `quadtree`, beside
   `balanceCube`'s `covering`. Given the leaves, it returns each key's
   `NeighbourLevels`. Each edge is `covering(neighbour(key, d))?.level`, or the
   key's own level when the neighbour is finer (undefined). Each corner is the
   minimum over both edge neighbours and both two-step diagonals,
   `neighbour(neighbour(key, d1), d2)` and the other way round. At a cube corner
   those two-step paths land on edge tiles, which is harmless. Test it against
   `selectCubeTiles` output.
2. **Protocol and worker**: `fill` carries `levels`. The worker calls
   `fillStitchedCubeTile` for the ground. The sea tile (`() => 0`) needs no
   stitch for heights, because every level samples 0. Its odd vertices still sit
   on the sphere, not on the coarse chord, so the sea needs the same call with
   `() => 0`.
3. **Refill on change**: `tile-view.ts` keys `held` on the id plus the levels'
   eight numbers, so a tile whose neighbours changed level is missing and gets
   refilled. Most tiles keep their signature from frame to frame. Only the ring
   along a level change refills. The ids that `want` and the eviction use must
   carry the same signature.
4. **The drawn cover is the risk.** `coverAround` mixes `shown` with new tiles,
   so the drawn cover can be a set no selection produced. Its neighbours' levels
   can then differ from the ones each tile was stitched to. The skirts still
   close any hole there, as they do today. One option is to compute the levels
   from the drawn cover and pick each tile's stitched variant where one is held.
   Another is to accept the gap while the cover is mixed.

Caveat that also applies today: the heights depend on the eye through `finest`.
Two tiles filled from different eyes can differ at a shared vertex, whatever
their levels. On a coarse–fine edge, `max(finest, coarseCut)` is almost always
`coarseCut`, because the coarse leaf's ramp is full there. So the stitch is no
worse there than a same-level edge is.

## DRY notes

`cubeCut` is the one place a level's cut is computed, shared by
`sampleCubeLattice` and the stitch. `latticeNormal` is `assembleTile`'s central
difference, which the stitch reuses for the coarse normal. `latticeDirection` is
reused rather than redone, so ring points past a face edge and at cube corners
come from one expression.
