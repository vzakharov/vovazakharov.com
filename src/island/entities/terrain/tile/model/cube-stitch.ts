import {
  cross,
  type CubeCell,
  type Direction,
  DIRECTIONS,
  dot,
  R,
  scaled,
  sub,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import {
  cubeCut,
  type CubeFillOptions,
  type CubeHeightSample,
  type CubeLattice,
  latticeDirection,
  liftCubeLattice,
  sampleCubeLattice,
} from './cube-fill';
import { faceLattice } from './cube-tile';
import {
  latticeNormal,
  type LatticePoint,
  ringAt,
  type TileMesh,
} from './tile-mesh';

const CORNERS = ['sw', 'se', 'nw', 'ne'] as const;

/** A tile's corner: south-west is its lattice's `(0, 0)`. */
export type Corner = (typeof CORNERS)[number];

/**
 * The coarsest level of the drawn tiles meeting a tile along each edge, and
 * at each corner (the edge neighbours' included); the tile's own level where
 * none there is coarser. Balance keeps an edge's within one level; a
 * corner's may be any.
 */
export type NeighbourLevels = {
  readonly edges: Readonly<Record<Direction, number>>;
  readonly corners: Readonly<Record<Corner, number>>;
};

type Spot = { readonly i: number; readonly j: number };

/** Each border vertex that a coarser tile meets, by grid index, and that tile's level. */
function coarseBorder(
  { level }: CubeCell,
  grid: number,
  { edges, corners }: NeighbourLevels,
): Map<number, Spot & { readonly level: number }> {
  const last = grid - 1;
  const found = new Map<number, Spot & { readonly level: number }>();
  const meet = (i: number, j: number, coarser: number) => {
    if (coarser >= level) return;
    const v = j * grid + i;
    const known = found.get(v)?.level ?? level;
    found.set(v, { i, j, level: Math.min(known, coarser) });
  };
  const sides: Record<Direction, (k: number) => Spot> = {
    left: (k) => ({ i: 0, j: k }),
    right: (k) => ({ i: last, j: k }),
    down: (k) => ({ i: k, j: 0 }),
    up: (k) => ({ i: k, j: last }),
  };
  for (const direction of DIRECTIONS) {
    const at = sides[direction];
    const coarser = edges[direction];
    if (coarser < level - 1) {
      throw new RangeError(
        `unbalanced ${direction} edge: ${coarser} < ${level - 1}`,
      );
    }
    for (let k = 0; k < grid; k++) {
      const { i, j } = at(k);
      meet(i, j, coarser);
    }
  }
  meet(0, 0, corners.sw);
  meet(last, 0, corners.se);
  meet(0, last, corners.nw);
  meet(last, last, corners.ne);
  return found;
}

/**
 * Where ray `p` (unit) meets the line through `a` and `b`, as a distance
 * along it: the chord `a`–`b` of a coarser tile's border, both in the plane
 * of `p`. Solved over `b − a`, short, so the two long vectors never cancel.
 */
function alongRayToChord(p: Vec3, a: Vec3, b: Vec3): number {
  const d = sub(b, a);
  const w = cross(a, d);
  return dot(w, w) / dot(cross(p, d), w);
}

/**
 * Rewrites, in place, the heights of a sampled lattice's border vertices that
 * a coarser tile meets, and returns their normals, so the border lies on the
 * coarser tile's border and lights as it does. A vertex on the coarser
 * lattice takes the height that tile samples there and the normal it takes by
 * central difference over its own lattice; one between two such vertices
 * goes onto the chord joining them, its normal halfway between theirs.
 */
export function stitchCubeLattice(
  key: CubeCell,
  lattice: CubeLattice,
  levels: NeighbourLevels,
  sample: CubeHeightSample,
  options: CubeFillOptions = {},
): Map<number, Vec3> {
  const grid = lattice.ring - 2;
  const cells = grid - 1;
  const coarse = coarseBorder(key, grid, levels);

  const sampled = new Map<string, LatticePoint>();
  /** Global lattice point `(kU, kV)` at `level`, as that level's tiles sample it. */
  const coarsePoint = (level: number, kU: number, kV: number) => {
    const name = `${level}/${kU}/${kV}`;
    const known = sampled.get(name);
    if (known !== undefined) return known;
    const lines = 2 ** level * cells;
    const index = (k: number) => faceLattice(level, cells, k);
    const p = latticeDirection(key.face, kU, kV, index, lines);
    const height = sample(p, cubeCut(level, cells, options.finest)(p));
    const point = { world: scaled(p, R + height), height };
    sampled.set(name, point);
    return point;
  };

  const setHeight = ({ i, j }: Spot, height: number) => {
    lattice.heights[(j + 1) * lattice.ring + i + 1] = height;
  };
  const worldAt = ({ i, j }: Spot) => {
    const height = lattice.heights[(j + 1) * lattice.ring + i + 1];
    if (height === undefined) throw new RangeError(`no height at ${i}, ${j}`);
    return scaled(ringAt(lattice, i, j), R + height);
  };

  const normals = new Map<number, Vec3>();
  const between: Array<Spot & { readonly v: number }> = [];
  for (const [v, spot] of coarse) {
    const step = 2 ** (key.level - spot.level);
    const kU = key.x * cells + spot.i;
    const kV = key.y * cells + spot.j;
    if (kU % step !== 0 || kV % step !== 0) {
      between.push({ ...spot, v });
      continue;
    }
    const [cU, cV] = [kU / step, kV / step];
    const at = (dU: number, dV: number) =>
      coarsePoint(spot.level, cU + dU, cV + dV);
    setHeight(spot, at(0, 0).height);
    normals.set(
      v,
      latticeNormal(
        at(1, 0).world,
        at(-1, 0).world,
        at(0, 1).world,
        at(0, -1).world,
      ),
    );
  }

  const last = grid - 1;
  for (const { i, j, v } of between) {
    // Off the coarser lattice only along an edge one level coarser, so both
    // neighbours along that edge are on it.
    const alongJ = i === 0 || i === last;
    const [before, after]: readonly [Spot, Spot] = alongJ
      ? [
          { i, j: j - 1 },
          { i, j: j + 1 },
        ]
      : [
          { i: i - 1, j },
          { i: i + 1, j },
        ];
    const p = ringAt(lattice, i, j);
    setHeight(
      { i, j },
      alongRayToChord(p, worldAt(before), worldAt(after)) - R,
    );
    normals.set(
      v,
      unit(
        sum(normalOf(normals, grid, before), normalOf(normals, grid, after)),
      ),
    );
  }
  return normals;
}

function normalOf(
  normals: ReadonlyMap<number, Vec3>,
  grid: number,
  { i, j }: Spot,
) {
  const normal = normals.get(j * grid + i);
  if (normal === undefined)
    throw new RangeError(`no coarse normal at ${i}, ${j}`);
  return normal;
}

/**
 * Fills a cube tile as `fillCubeTile` does, its border stitched to each
 * coarser tile `levels` names (`stitchCubeLattice`).
 */
export function fillStitchedCubeTile(
  key: CubeCell,
  sample: CubeHeightSample,
  levels: NeighbourLevels,
  options: CubeFillOptions = {},
): TileMesh<CubeCell> {
  const lattice = sampleCubeLattice(key, sample, options);
  const normals = stitchCubeLattice(key, lattice, levels, sample, options);
  return liftCubeLattice(key, lattice, options, normals);
}
