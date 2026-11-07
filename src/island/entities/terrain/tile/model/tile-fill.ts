import {
  cross,
  type Elevated,
  length,
  planeToWorld,
  scaled,
  sub,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import {
  latticeCoordinate,
  TILE_GRID,
  type TileKey,
  type TileKeyed,
  tileSide,
} from './tile';

/**
 * Height above sea level, in metres, at plane point `(x, y)`, holding no
 * relief shorter than `finest` metres — at least twice the tile's vertex
 * spacing, the shortest wave its lattice draws without aliasing.
 */
export type HeightSample = (x: number, y: number, finest: number) => number;

export type FillOptions = {
  /** Vertices along a side; defaults to `TILE_GRID`. */
  readonly grid?: number;
  /** How far the skirt hangs below the edge, in metres; two cells by default. */
  readonly skirtDepth?: number;
  /**
   * The shortest relief to draw at a plane point, metres, when it should not
   * depend on the tile's own level (`detailCut`): a vertex then cuts at the
   * larger of it and twice the tile's spacing.
   */
  readonly finest?: (x: number, y: number) => number;
};

/**
 * One tile's mesh, every array its own buffer so a worker can transfer it.
 * The first `grid²` vertices are the grid, row by row from the south-west
 * corner eastward; the skirt's `4·(grid − 1)` follow, hanging from the border
 * walked counter-clockwise from that corner, each one cell outside it.
 * Triangles wind counter-clockwise seen from outside, the skirt's facing away
 * from the tile.
 */
export type TileMesh = TileKeyed & {
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

/** `height` is above the sea. */
type LatticePoint = Elevated & { readonly world: Vec3 };

function entry<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`no entry ${index}`);
  return item;
}

/**
 * Fills a tile from its key and the height function: a `grid × grid` lattice
 * bent onto the sphere, plus a skirt hiding the cracks against a neighbour one
 * level coarser or finer. Normals come from an extra ring of samples outside
 * the tile, so they agree across a shared edge as positions do.
 */
export function fillTile(
  key: TileKey,
  sample: HeightSample,
  options: FillOptions = {},
): TileMesh {
  const grid = options.grid ?? TILE_GRID;
  const cells = grid - 1;
  const spacing = tileSide(key.level) / cells;
  const skirtDepth = options.skirtDepth ?? 2 * spacing;
  const { finest } = options;
  const cutAt = (x: number, y: number) =>
    finest === undefined ? 2 * spacing : Math.max(finest(x, y), 2 * spacing);

  // The lattice with one extra ring all round, `i` east and `j` north from -1.
  const ring = grid + 2;
  const lattice: LatticePoint[] = [];
  for (let b = 0; b < ring; b++) {
    const y = latticeCoordinate(key.level, cells, key.y * cells + b - 1);
    for (let a = 0; a < ring; a++) {
      const x = latticeCoordinate(key.level, cells, key.x * cells + a - 1);
      const height = sample(x, y, cutAt(x, y));
      lattice.push({ world: planeToWorld(x, y, height), height });
    }
  }
  const at = (i: number, j: number) => entry(lattice, (j + 1) * ring + i + 1);

  const half = cells / 2;
  const middle = planeToWorld(
    latticeCoordinate(key.level, cells, key.x * cells + half),
    latticeCoordinate(key.level, cells, key.y * cells + half),
  );

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
