import {
  cross,
  type CubeCell,
  dot,
  type FacePoint,
  faceToSphere,
  length,
  R,
  type Vec3,
} from '@/island/shared/globe';

/** The deepest level: 17 puts a 65-vertex grid's spacing at ≤ ~1.2 m. */
export const CUBE_MAX_LEVEL = 17;

/** The shallowest level drawn: 6 × 16 tiles, ≤ ~2 500 km a side. */
export const CUBE_MIN_LEVEL = 2;

/** A stable string for a key, for maps and caches. */
export const cubeTileId = ({ face, level, x, y }: CubeCell) =>
  `${face}/${level}/${x}/${y}`;

/**
 * The face coordinate of lattice line `k` at `level` with `cells` cells per
 * tile: `2k / (2^level · cells) − 1`. Every term is a power of two or a small
 * integer, so the value is exact, and a face edge lands on exactly `±1`; with
 * `faceToSphere`, neighbours on one face and across a face edge agree on every
 * shared lattice point bit for bit.
 */
export const faceLattice = (level: number, cells: number, k: number) =>
  (2 * k) / (2 ** level * cells) - 1;

/** The tile's span of face coordinates, low to high along `u` and along `v`. */
function faceSpan({ level, x, y }: CubeCell) {
  return {
    u: [faceLattice(level, 1, x), faceLattice(level, 1, x + 1)],
    v: [faceLattice(level, 1, y), faceLattice(level, 1, y + 1)],
  } as const;
}

/** Whether the cube point lies in the tile, its edges included. */
export function tileHolds(key: CubeCell, { face, u, v }: FacePoint) {
  const {
    u: [west, east],
    v: [south, north],
  } = faceSpan(key);
  return (
    face === key.face && west <= u && u <= east && south <= v && v <= north
  );
}

/** Radians between two directions of any length but zero. */
const arc = (a: Vec3, b: Vec3) => Math.atan2(length(cross(a, b)), dot(a, b));

/**
 * A tile's ground as a spherical cap: the unit direction of its middle and
 * the angle from it that holds the whole tile, with the tile's corners and
 * edge midpoints (unit) it was measured over. A tile's sides are great-circle
 * arcs shorter than a quadrant, so its farthest point from the middle is among
 * them.
 */
export type TileCap = {
  readonly centre: Vec3;
  readonly radius: number;
  readonly border: readonly Vec3[];
};

export function tileCap(key: CubeCell): TileCap {
  const {
    u: [west, east],
    v: [south, north],
  } = faceSpan(key);
  const mu = (west + east) / 2;
  const mv = (south + north) / 2;
  const centre = faceToSphere(key.face, mu, mv);
  const border = (
    [
      [west, south],
      [east, south],
      [west, north],
      [east, north],
      [mu, south],
      [mu, north],
      [west, mv],
      [east, mv],
    ] as const
  ).map(([u, v]) => faceToSphere(key.face, u, v));
  const radius = Math.max(...border.map((p) => arc(centre, p)));
  return { centre, radius, border };
}

/** Radians from `direction` to the nearest point of `cap`, 0 inside it. */
export const capGap = (cap: TileCap, direction: Vec3) =>
  Math.max(0, arc(cap.centre, direction) - cap.radius);

/** Radians between the nearest points of two caps, 0 where they meet. */
export const capsApart = (a: TileCap, b: TileCap) =>
  Math.max(0, arc(a.centre, b.centre) - a.radius - b.radius);

/**
 * Radians per unit of `u` along a line of constant `v` on the equal-angle
 * cube, at `tan(πu/4) = s`, `tan(πv/4) = t`; the same with the roles swapped
 * along `v`. Grows with `|s|`, shrinks with `|t|`, and is `π/4` wherever `t` is 0.
 */
const pace = (s: number, t: number) =>
  ((Math.PI / 4) * (1 + s * s) * Math.sqrt(1 + t * t)) / (1 + s * s + t * t);

const slope = (c: number) => Math.tan((Math.PI / 4) * c);

/** The span's largest and smallest `|c|`, the smallest 0 where it holds 0. */
function magnitudes([low, high]: readonly [number, number]) {
  const most = Math.max(Math.abs(low), Math.abs(high));
  const least =
    low <= 0 && high >= 0 ? 0 : Math.min(Math.abs(low), Math.abs(high));
  return { most, least };
}

/**
 * Metres: the longest cell edge anywhere in the tile times the cells along a
 * side, so `cubeTileSide / cells` bounds every cell edge from above. Between
 * `2√2/3` (a face's corner) and 1 times the face-centre `R · π/4 · 2 / 2^level`.
 */
export function cubeTileSide(key: CubeCell): number {
  const { u, v } = faceSpan(key);
  const across = magnitudes(u);
  const up = magnitudes(v);
  const fastest = Math.max(
    pace(slope(across.most), slope(up.least)),
    pace(slope(up.most), slope(across.least)),
  );
  return R * fastest * (u[1] - u[0]);
}
