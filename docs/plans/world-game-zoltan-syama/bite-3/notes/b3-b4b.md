# b3-b4b — step B4, second half: `fillCubeTile`

Base 7e7dbf03, branch `wt/b3-b4b`. Done. Everything is under
`entities/terrain/tile`. `height/` was not touched.

## API (`@/island/entities/terrain/tile`)

```ts
type CubeHeightSample = (p: Vec3, finest: number) => number; // p unit
type CubeFillOptions = MeshOptions & { finest?: (p: Vec3) => number }; // matches cubeDetailCut
function fillCubeTile(key: CubeCell, sample: CubeHeightSample, options?: CubeFillOptions): TileMesh<CubeCell>;
```

`TileMesh` and `TileKeyed` now take the key type,
`TileMesh<K extends GridCell = GridCell>`, so every planar use reads as before.
The mesh layout is the planar one: the same vertex order, skirt and indices.

## Modules

- `model/tile-mesh.ts`: the shared assembly. It holds `MeshOptions` (`grid`,
  `skirtDepth`), `TileMesh`, `tileBuffers`, `borderLoop`, `Ringed<T>` with
  `ringAt`, and `assembleTile(key, ringed lattice, middle, skirtDepth)`, which
  builds the normals, the skirt and the triangles. Only the code moved. Twelve
  planar meshes hash identically to base 7e7dbf03 after the split: levels 3, 7,
  9, 10, 12 and 18, grids 17, 65 and 257, with and without `finest`/
  `skirtDepth`, land and sea. The script is `tmp/b4b/golden.ts`, which is not in
  git. It was rebuilt at base before the refactor.
- `model/tile-fill.ts`: the planar lattice, then `assembleTile`.
- `model/cube-fill.ts`: `sampleCubeLattice` gives a `CubeLattice` (unit
  directions plus a `Float64Array` of heights, ringed). The private
  `liftCubeLattice` turns it into world points `p·(R + h)`, the middle
  `faceToSphere(mid)·R`, and the mesh. `fillCubeTile` runs one after the other.
- `model/tile-mesh.test-kit.ts`: mesh readers and `assertFlatMesh`, shared by
  both fill tests.

## Decisions and departures

- **The outer ring and the cube corner** follow `b3-b4.md` exactly. One step
  past an edge, the along index is `flip ? N − k : k` and the perpendicular
  index is `N − 1` or `1`, from `EDGES`. At a corner of the outer ring at a cube
  corner, the clamped index lands on the point that both ring neighbours reach.
  A test checks that the point is bit-equal from both sides on all six faces.
- **Departure: the relief cut and the default skirt use one spacing per level,
  not `cubeTileSide(key)/cells`.** The value is
  `cubeLevelSpacing(level, cells) = R·π / (2·2^level·cells)`, the widest cell
  anywhere on the level (the pace is `π/4` along a face's middle line and
  smaller everywhere else). The reason: `cubeTileSide` differs between two
  neighbours, so their cuts would differ and their shared edge would not have
  bit-equal heights. `cubeDetailCut`'s floor is built on the same widest value
  (`b3-b3.md`).
- **`assertFlatMesh` now checks the skirt differently.** It used to check that
  each skirt normal is radial at the skirt vertex. It now checks that each skirt
  vertex carries its border vertex's normal, which is what the code does. The
  old check only held for small cells: at level 2 the one-cell flare tilts the
  vertical by 6 mrad.

## Tests (`cube-fill.test.ts`, 12 cases; 34 in the tile slice)

- Shared edges are matched by bit-equal direction. Heights must be bit-equal
  (`Object.is`) and every normal component within 1e-6. The test covers the four
  in-face neighbours, all 24 directed face edges at three places along each
  (corner tiles included), and a face edge at levels 12 and 17.
- At each of the 8 cube corners, the 3 tiles agree on height and normal. The 24
  two-tile meetings on face edges agree too.
- The test checks that the relief is cut at one spacing per level.
- A sea tile, at a face middle, a face edge and a face corner, has the planar
  sea tile's vertex count and identical indices. Grid normals point up, faces
  wind outward, the grid sits at R, and the skirt hangs at depth, flared
  outward.
- A mutation check: extrapolating this face's map past ±1 fails three of the
  tests, with a normal gap of 6e-3 on a face edge.

## Numbers (Node, grid 65)

| level | sample           | planar ms/tile | cube ms/tile | cube/planar |
| ----- | ---------------- | -------------- | ------------ | ----------- |
| 10    | cheap analytic   | 2.81           | 1.79         | 0.64        |
| 10    | `heightAtSphere` | 19.1           | 19.1         | 1.00        |
| 16    | cheap analytic   | 2.74           | 1.71         | 0.62        |
| 16    | `heightAtSphere` | 28.1           | 28.1         | 1.00        |

A face-corner tile costs the same as any other (1.79 ms with the cheap sample).
The sample dominates the time. The cube lattice itself costs less than
`planeToWorld`. Worst normal gap on shared vertices, at levels 4, 10 and 17,
grid 65: 0 at float32 (in-face, face edges, corner tiles). Scripts:
`tmp/b4b/bench.ts`, `tmp/b4b/gaps.ts`.

## Call 14 — where it plugs in (not built)

The hook is the gap between `sampleCubeLattice` and `liftCubeLattice`. Lifting
reads only `directions` and `heights`, so B9 rewrites `heights` in place for
each side whose neighbour is one level coarser, which B7's tile cover knows.
Then it lifts. Nothing is sampled twice. B9 exports `liftCubeLattice`, or gives
`fillCubeTile` an option carrying the coarser sides. For a coarser side:

- **Even border vertices** coincide with the coarse tile's vertices. They take
  the coarse tile's heights, which are sampled at the coarse cut,
  `2·cubeLevelSpacing(level − 1)`. That is one extra sample per even vertex, or
  the coarse tile's own heights handed over.
- **Odd border vertices** take the height that puts them on the coarse chord
  between their two even neighbours. A lattice line of constant `u` or `v` is a
  great circle, so the ray along `p` meets that chord. Set `R + h` to the
  distance along `p` to the meeting point. The mean of the two heights is not
  enough at coarse levels: the sagitta is `cell²/8R`, about 30 m for a level-2
  cell and negligible at metre cells.
- **Normals**: a border normal comes from the ring by central difference at the
  fine spacing, so it still differs from the coarse tile's normal there. If B9
  wants the shading to match too, `assembleTile` needs a normal override for the
  border rows. Heights alone do not give that.
- Across a face edge it works the same way: the coarse neighbour's lattice is
  reached through `neighbour`/`EDGES`, as the ring is.

## For B7

- The tile worker should call
  `fillCubeTile(key, (p, finest) => heightAtSphere(distance, seed, p, finest), { finest: cubeDetailCut(...) })`
  and `fillCubeTile(key, () => 0)` for the sea.
- knip lists `fillCubeTile`, `CubeFillOptions` and `CubeHeightSample` as unread
  until B7 wires them.
