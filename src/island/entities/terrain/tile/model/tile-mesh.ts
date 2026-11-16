import {
  cross,
  type Elevated,
  type GridCell,
  length,
  scaled,
  sub,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import type { TileKeyed } from './tile';
import { type CoarseEdges, NO_COARSE_EDGES, tileIndices } from './tile-indices';

/** What a fill takes however its lattice is laid. */
export type MeshOptions = {
  /** Vertices along a side; defaults to `TILE_GRID`. */
  readonly grid?: number;
  /** How far the skirt hangs below the edge, in metres; two cells by default. */
  readonly skirtDepth?: number;
};

/**
 * One tile's mesh, every array its own buffer so a worker can transfer it.
 * The first `grid²` vertices are the grid, row by row from the south-west
 * corner eastward; the skirt's `4·(grid − 1)` follow, hanging from the border
 * walked counter-clockwise from that corner, each one cell outside it.
 * Triangles wind counter-clockwise seen from outside, the skirt's facing away
 * from the tile.
 */
export type TileMesh<K extends GridCell = GridCell> = TileKeyed<K> & {
  readonly grid: number;
  /** World position of the tile's centre on the sphere (sea level), float64. */
  readonly centre: Float64Array<ArrayBuffer>;
  /** `xyz` per vertex, relative to `centre`. */
  readonly positions: Float32Array<ArrayBuffer>;
  /** Unit outward normal per vertex, world axes. */
  readonly normals: Float32Array<ArrayBuffer>;
  /** Height above sea level per vertex. */
  readonly heights: Float32Array<ArrayBuffer>;
  readonly indices: Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
};

/** The buffers of a mesh, for `postMessage`'s transfer list. */
export const tileBuffers = (mesh: TileMesh): ArrayBuffer[] => [
  mesh.centre.buffer,
  mesh.positions.buffer,
  mesh.normals.buffer,
  mesh.heights.buffer,
  mesh.indices.buffer,
];

/** A lattice vertex in world metres; `height` is above the sea. */
export type LatticePoint = Elevated & { readonly world: Vec3 };

export function entry<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`no entry ${index}`);
  return item;
}

/**
 * A tile's lattice laid out with one extra ring all round: `(grid + 2)²`
 * entries, row `j` (north) by column `i` (east), each from `−1`.
 */
export type Ringed<T> = {
  readonly ring: number;
  readonly points: readonly T[];
};

export const ringAt = <T>({ ring, points }: Ringed<T>, i: number, j: number) =>
  entry(points, (j + 1) * ring + i + 1);

/** A lattice vertex's normal by central difference over its four neighbours. */
export const latticeNormal = (
  east: Vec3,
  west: Vec3,
  north: Vec3,
  south: Vec3,
) => unit(cross(sub(east, west), sub(north, south)));

/**
 * Builds the mesh from a ringed lattice and the tile's middle: the grid, its
 * normals by central difference over the ring — so they agree across a shared
 * edge as positions do — and a skirt hiding the cracks against a neighbour one
 * level coarser or finer. `normalAt`, by grid vertex, replaces the central
 * difference where a border vertex must light as a coarser tile lights it;
 * along each `coarse` edge the grid meets the coarser tile's vertices only
 * (`gridTriangles`).
 */
export function assembleTile<K extends GridCell>(
  key: K,
  lattice: Ringed<LatticePoint>,
  middle: Vec3,
  skirtDepth: number,
  normalAt: ReadonlyMap<number, Vec3> = new Map(),
  coarse: CoarseEdges = NO_COARSE_EDGES,
): TileMesh<K> {
  const grid = lattice.ring - 2;
  const cells = grid - 1;
  const at = (i: number, j: number) => ringAt(lattice, i, j);

  const loop = borderLoop(grid);
  const vertexCount = grid * grid + loop.length;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const heights = new Float32Array(vertexCount);
  const put = (v: number, world: Vec3, normal: Vec3, height: number) => {
    positions.set(sub(world, middle), v * 3);
    normals.set(normal, v * 3);
    heights[v] = height;
  };

  const gridNormals: Vec3[] = [];
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const { world, height } = at(i, j);
      const v = j * grid + i;
      const normal =
        normalAt.get(v) ??
        latticeNormal(
          at(i + 1, j).world,
          at(i - 1, j).world,
          at(i, j + 1).world,
          at(i, j - 1).world,
        );
      gridNormals.push(normal);
      put(v, world, normal, height);
    }
  }

  // The skirt flares one cell outward as it drops — diagonally at a corner —
  // so seen from overhead it overlaps the neighbour and fills a pinhole along
  // the shared edge, which a skirt hanging plumb shows edge-on and cannot.
  const outward = (k: number) => (k === 0 ? -1 : k === cells ? 1 : 0);
  for (const [n, v] of loop.entries()) {
    const i = v % grid;
    const j = Math.floor(v / grid);
    const { world, height } = at(i, j);
    const out = at(i + outward(i), j + outward(j)).world;
    const lowered = (length(world) - skirtDepth) / length(out);
    put(
      grid * grid + n,
      scaled(out, lowered),
      entry(gridNormals, v),
      height - skirtDepth,
    );
  }

  return {
    key,
    grid,
    centre: new Float64Array(middle),
    positions,
    normals,
    heights,
    indices: tileIndices(grid, loop, coarse),
  };
}

/**
 * The grid's border vertices, counter-clockwise from the south-west corner:
 * the order the skirt hangs in, skirt vertex `grid² + k` under the `k`th.
 */
export function borderLoop(grid: number): number[] {
  const last = grid - 1;
  const loop: number[] = [];
  for (let i = 0; i < last; i++) loop.push(i);
  for (let j = 0; j < last; j++) loop.push(j * grid + last);
  for (let i = last; i > 0; i--) loop.push(last * grid + i);
  for (let j = last; j > 0; j--) loop.push(j * grid);
  return loop;
}
