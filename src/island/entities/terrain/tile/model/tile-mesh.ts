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

export function entry<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`no entry ${index}`);
  return item;
}

/**
 * A tile's lattice laid out with one extra ring all round: `(grid + 2)²`
 * entries, row `j` (north) by column `i` (east), each from `−1`.
 */
export type Ringed<T> = { readonly ring: number; readonly points: readonly T[] };

export const ringAt = <T>({ ring, points }: Ringed<T>, i: number, j: number) =>
  entry(points, (j + 1) * ring + i + 1);

/**
 * Builds the mesh from a ringed lattice and the tile's middle: the grid, its
 * normals by central difference over the ring — so they agree across a shared
 * edge as positions do — and a skirt hiding the cracks against a neighbour one
 * level coarser or finer.
 */
export function assembleTile<K extends GridCell>(
  key: K,
  lattice: Ringed<LatticePoint>,
  middle: Vec3,
  skirtDepth: number,
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
      const normal = unit(
        cross(
          sub(at(i + 1, j).world, at(i - 1, j).world),
          sub(at(i, j + 1).world, at(i, j - 1).world),
        ),
      );
      gridNormals.push(normal);
      put(j * grid + i, world, normal, height);
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
    indices: triangulate(grid, loop, vertexCount),
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

function triangulate(grid: number, loop: number[], vertexCount: number) {
  const cells = grid - 1;
  const triangles: number[] = [];
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      const sw = j * grid + i;
      const nw = sw + grid;
      triangles.push(sw, sw + 1, nw + 1, sw, nw + 1, nw);
    }
  }
  const skirt = grid * grid;
  for (const [k, top] of loop.entries()) {
    const next = (k + 1) % loop.length;
    const following = entry(loop, next);
    triangles.push(
      top,
      skirt + k,
      following,
      following,
      skirt + k,
      skirt + next,
    );
  }
  return vertexCount <= 0xff_ff
    ? new Uint16Array(triangles)
    : new Uint32Array(triangles);
}
