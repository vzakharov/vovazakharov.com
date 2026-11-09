# b3-b9a — call 14, the stitch

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

## Done: the wiring (B9b)

1. **Levels from the cover**: `quadtree/model/cube-neighbours.ts`.
   `neighbourLevels(leaves)` gives each leaf's `NeighbourLevels`; `covering`
   moved there from `balanceCube` and is shared. `diagonal(key, d1, d2)` turns
   the second step into the new face's frame when the first crosses a face edge
   (`EDGES[face][d1].flip`); without that the two-step path lands on the wrong
   cell. Tested: every level-2 cell's diagonals touch its corner on all six
   faces; a brute-force reading (nudged points, `tileHolds`) agrees with
   `selectCubeTiles` output at all six `PLACES`, 10 km and 1 000 km; a
   hand-built cover over pz's cube corner.
2. **Protocol and worker**: `TileOrder` = key + levels; `orderId` is the tile id
   plus the eight levels. `fill` is a `TileOrder`, `FilledTile` carries it back.
   The worker fills ground and sea through `fillStitchedCubeTile`.
3. **Refill on change**: `tile-meshes.ts` holds variants by `orderId` (with
   `hasTile` and `variantOf` over a per-tile list). `tile-view.ts` wants the
   selection's variants it lacks (roots under flat levels), evicts outside the
   selection's and the shown's variants. `nearestFirst` takes any keyed tile.
4. **The drawn cover**: `draw` reads the levels off the cover actually drawn
   (cached by its ids: 1.5 ms per read of a 182-tile cover) and shows that
   variant where held, else the shown's, the selection's, the last added. In
   steady state the cover is the selection, so every tile is exact. A mixed
   cover's fallback has a border either unstitched or on the coarse chord, so
   its step is never larger than an unstitched edge, which the 2-cell skirt
   already hides. Mixed-cover variants are never requested (transient, and
   possibly unbalanced, which the stitch throws on).

Refill cost (`tmp/refill.ts`, Node, flat ground, pitch 30°, fov 1, 16:9; per
reselection, which happens at most once a frame: 2 % of height, 0.05 rad):

| run (10 km)     | tiles | new tiles mean / max | same tile, new levels mean / max |
| --------------- | ----- | -------------------- | -------------------------------- |
| descent 12→8 km | 62    | 0.8 / 16             | 0.0 / 0                          |
| turn 1 rad      | 66    | 1.6 / 4              | 0.9 / 6                          |
| glide 4 km      | 65    | 0.8 / 8              | 0.4 / 4                          |
| over the coast: |       |                      |                                  |
| descent         | 144   | 3.0 / 12             | 2.4 / 12                         |
| turn            | 171   | 6.1 / 13             | 3.4 / 7                          |
| glide           | 125   | 1.4 / 8              | 2.0 / 12                         |

So the stitch adds at most about as many fills as new tiles bring, ≤ 12 per
reselection.

## Left (B9c)

- The look: the frames. A seam at a level change should be gone in ground and
  sea; a stand-in moment (mixed cover) may still show the skirt.
- Not measured: worker fill time per restitched tile, and whether the held
  variants (capacity 900, now counted per variant) churn.

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
