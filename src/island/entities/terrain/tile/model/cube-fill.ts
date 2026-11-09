import {
  type CubeCell,
  type Direction,
  EDGES,
  type Face,
  faceToSphere,
  R,
  scaled,
  type Vec3,
} from '@/island/shared/globe';

import { faceLattice } from './cube-tile';
import { TILE_GRID } from './tile';
import type { CoarseEdges } from './tile-indices';
import {
  assembleTile,
  entry,
  type LatticePoint,
  type MeshOptions,
  type Ringed,
  type TileMesh,
} from './tile-mesh';

/**
 * Height above sea level, in metres, over unit direction `p`, holding no
 * relief shorter than `finest` metres.
 */
export type CubeHeightSample = (p: Vec3, finest: number) => number;

export type CubeFillOptions = MeshOptions & {
  /**
   * The shortest relief to draw over a unit direction, metres
   * (`cubeDetailCut`): a vertex cuts at the larger of it and twice the level's
   * widest spacing.
   */
  readonly finest?: (p: Vec3) => number;
};

/**
 * The widest cell edge anywhere at `level`: the equal-angle map moves `π/4`
 * radians per face unit along a face's middle line and less everywhere else.
 * One value per level, so two tiles cut a shared edge's relief alike.
 */
export const cubeLevelSpacing = (level: number, cells: number) =>
  (R * Math.PI) / (2 * 2 ** level * cells);

/** The relief cut a `level` tile samples each direction at. */
export const cubeCut = (
  level: number,
  cells: number,
  finest: CubeFillOptions['finest'],
) => {
  const floor = 2 * cubeLevelSpacing(level, cells);
  return (p: Vec3) =>
    finest === undefined ? floor : Math.max(finest(p), floor);
};

/**
 * A cube tile's lattice before it is lifted to world metres: the unit
 * direction and height of every point, ringed. Lifting reads nothing else, so
 * the heights of a border row, or of the ring beyond it, can be replaced
 * between `sampleCubeLattice` and `liftCubeLattice` without sampling again.
 */
export type CubeLattice = Ringed<Vec3> & {
  readonly heights: Float64Array<ArrayBuffer>;
};

const isForward = (direction: Direction) =>
  direction === 'right' || direction === 'up';

const isAlongU = (direction: Direction) =>
  direction === 'right' || direction === 'left';

/**
 * The point one lattice row inside the face beyond `face`'s `direction` edge,
 * at index `along` on that edge (`0..lines`): the same expression the tile on
 * that face builds the point with, so the two agree bit for bit.
 */
function beyondEdge(
  face: Face,
  direction: Direction,
  along: number,
  index: (k: number) => number,
  lines: number,
): Vec3 {
  const { face: beyond, back, flip } = EDGES[face][direction];
  const a = flip ? lines - along : along;
  const inside = isForward(back) ? lines - 1 : 1;
  return isAlongU(back)
    ? faceToSphere(beyond, index(inside), index(a))
    : faceToSphere(beyond, index(a), index(inside));
}

/**
 * The unit direction of global lattice point `(kU, kV)` of `face`, each index
 * at most one past `[0, lines]`. One past an edge, it is the neighbour face's
 * row; past two, at a cube corner's outer ring, it is the point both ring
 * neighbours reach, one step along the third face edge.
 */
export function latticeDirection(
  face: Face,
  kU: number,
  kV: number,
  index: (k: number) => number,
  lines: number,
): Vec3 {
  const offU = kU < 0 ? 'left' : kU > lines ? 'right' : null;
  const offV = kV < 0 ? 'down' : kV > lines ? 'up' : null;
  if (offU !== null) {
    const along = offV === null ? kV : offV === 'down' ? 0 : lines;
    return beyondEdge(face, offU, along, index, lines);
  }
  if (offV !== null) return beyondEdge(face, offV, kU, index, lines);
  return faceToSphere(face, index(kU), index(kV));
}

/** Samples a cube tile's ringed lattice. */
export function sampleCubeLattice(
  key: CubeCell,
  sample: CubeHeightSample,
  options: CubeFillOptions = {},
): CubeLattice {
  const grid = options.grid ?? TILE_GRID;
  const cells = grid - 1;
  const lines = 2 ** key.level * cells;
  const index = (k: number) => faceLattice(key.level, cells, k);
  const cut = cubeCut(key.level, cells, options.finest);

  const ring = grid + 2;
  const points: Vec3[] = [];
  const heights = new Float64Array(ring * ring);
  for (let b = 0; b < ring; b++) {
    const kV = key.y * cells + b - 1;
    for (let a = 0; a < ring; a++) {
      const kU = key.x * cells + a - 1;
      const p = latticeDirection(key.face, kU, kV, index, lines);
      heights[points.length] = sample(p, cut(p));
      points.push(p);
    }
  }
  return { ring, points, heights };
}

/**
 * Lifts a sampled lattice to world metres and assembles the tile's mesh,
 * `normalAt` and `coarse` as `assembleTile` takes them.
 */
export function liftCubeLattice(
  key: CubeCell,
  lattice: CubeLattice,
  options: MeshOptions = {},
  normalAt?: ReadonlyMap<number, Vec3>,
  coarse?: CoarseEdges,
): TileMesh<CubeCell> {
  const { ring, heights } = lattice;
  const cells = ring - 3;
  const points = lattice.points.map((p, n): LatticePoint => {
    const height = entry(heights, n);
    return { world: scaled(p, R + height), height };
  });
  const half = cells / 2;
  const middle = scaled(
    faceToSphere(
      key.face,
      faceLattice(key.level, cells, key.x * cells + half),
      faceLattice(key.level, cells, key.y * cells + half),
    ),
    R,
  );
  const skirtDepth =
    options.skirtDepth ?? 2 * cubeLevelSpacing(key.level, cells);
  return assembleTile(
    key,
    { ring, points },
    middle,
    skirtDepth,
    normalAt,
    coarse,
  );
}

/**
 * Fills a cube tile from its key and the height function. Normals across a
 * face edge come from the neighbour face's lattice, never from this face's map
 * carried past `±1`, so two tiles light a face edge alike; at a cube corner
 * the corner vertex's normal is the plane of its three real neighbours.
 */
export const fillCubeTile = (
  key: CubeCell,
  sample: CubeHeightSample,
  options: CubeFillOptions = {},
): TileMesh<CubeCell> =>
  liftCubeLattice(key, sampleCubeLattice(key, sample, options), options);
