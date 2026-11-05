/**
 * Plane geometry for the folding engine. Paper coordinates put the sheet on
 * the unit square; the flat folded state lives in the same plane, reached
 * through each piece's `Affine`.
 */

export type Vec = readonly [number, number];
export type Polygon = readonly Vec[];
export type Segment = readonly [Vec, Vec];
/** A line through `p` along `d`; `d` need not be unit length. */
export type Line = { readonly p: Vec; readonly d: Vec };
/** `[a, b, c, d, tx, ty]` maps `(u, v)` to `(a·u + b·v + tx, c·u + d·v + ty)`. */
export type Affine = readonly [number, number, number, number, number, number];

export const EPS = 1e-9;
/** Tolerance for "on the line" and "same point", looser than `EPS` because
 * points on a crease are reached through several composed placements. */
export const NEAR = 1e-7;

export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s];
export const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1];
const cross = (a: Vec, b: Vec): number => a[0] * b[1] - a[1] * b[0];
export const length = (a: Vec): number => Math.hypot(a[0], a[1]);
export const normalize = (a: Vec): Vec => scale(a, 1 / length(a));
/** `a` turned a quarter counter-clockwise. */
export const perpendicular = (a: Vec): Vec => [-a[1], a[0]];

/** The element at `i`, wrapping around both ends. */
function cyclic<T>(xs: readonly T[], i: number): T {
  const x = xs[((i % xs.length) + xs.length) % xs.length];
  if (x === undefined) throw new Error('cyclic: empty list');
  return x;
}

export const edges = (poly: Polygon): Segment[] =>
  poly.map((a, i) => [a, cyclic(poly, i + 1)] as const);

export const IDENTITY: Affine = [1, 0, 0, 1, 0, 0];

export const apply = (m: Affine, [u, v]: Vec): Vec => [
  m[0] * u + m[1] * v + m[4],
  m[2] * u + m[3] * v + m[5],
];

/** `outer ∘ inner`: apply `inner` first. */
export const compose = (outer: Affine, inner: Affine): Affine => [
  outer[0] * inner[0] + outer[1] * inner[2],
  outer[0] * inner[1] + outer[1] * inner[3],
  outer[2] * inner[0] + outer[3] * inner[2],
  outer[2] * inner[1] + outer[3] * inner[3],
  outer[0] * inner[4] + outer[1] * inner[5] + outer[4],
  outer[2] * inner[4] + outer[3] * inner[5] + outer[5],
];

export const determinant = (m: Affine): number => m[0] * m[3] - m[1] * m[2];

export function invert(m: Affine): Affine {
  const det = determinant(m);
  const a = m[3] / det;
  const b = -m[1] / det;
  const c = -m[2] / det;
  const d = m[0] / det;
  return [a, b, c, d, -(a * m[4] + b * m[5]), -(c * m[4] + d * m[5])];
}

/** The mirror across `line`, which is what a flat fold does to its flap. */
export function reflection(line: Line): Affine {
  const [x, y] = normalize(line.d);
  const r: Affine = [x * x - y * y, 2 * x * y, 2 * x * y, y * y - x * x, 0, 0];
  const [tx, ty] = sub(line.p, apply(r, line.p));
  return [r[0], r[1], r[2], r[3], tx, ty];
}

/** Positive left of `line` (looking along `d`), negative right, ~0 on it. */
export const side = (pt: Vec, line: Line): number =>
  cross(line.d, sub(pt, line.p));

export const lineThrough = (p: Vec, q: Vec): Line => ({ p, d: sub(q, p) });

export function area(poly: Polygon): number {
  return Math.abs(
    edges(poly).reduce((sum, [a, b]) => sum + cross(a, b), 0) / 2,
  );
}

const dedupe = (poly: Polygon): Polygon =>
  poly.filter((v, i) => length(sub(v, cyclic(poly, i + 1))) > EPS);

const proper = (poly: Polygon): Polygon | undefined =>
  poly.length >= 3 && area(poly) > EPS ? poly : undefined;

/** A convex polygon cut by a line into its left and right parts. */
export function splitConvex(
  poly: Polygon,
  line: Line,
): { left: Polygon | undefined; right: Polygon | undefined } {
  const left: Vec[] = [];
  const right: Vec[] = [];
  for (const [i, a] of poly.entries()) {
    const b = cyclic(poly, i + 1);
    const sa = side(a, line);
    const sb = side(b, line);
    if (sa >= -EPS) left.push(a);
    if (sa <= EPS) right.push(a);
    if ((sa > EPS && sb < -EPS) || (sa < -EPS && sb > EPS)) {
      const crossing = add(a, scale(sub(b, a), sa / (sa - sb)));
      left.push(crossing);
      right.push(crossing);
    }
  }
  return { left: proper(dedupe(left)), right: proper(dedupe(right)) };
}

/** Whether a convex polygon of either winding holds `pt`, boundary included. */
export function contains(poly: Polygon, pt: Vec): boolean {
  let sign = 0;
  for (const [a, b] of edges(poly)) {
    const c = cross(sub(b, a), sub(pt, a));
    if (Math.abs(c) < NEAR) continue;
    if (sign === 0) sign = Math.sign(c);
    else if (Math.sign(c) !== sign) return false;
  }
  return true;
}

/** Whether two convex polygons overlap with positive area (separating axes). */
export function overlaps(a: Polygon, b: Polygon, eps = 1e-6): boolean {
  for (const poly of [a, b]) {
    for (const [p, q] of edges(poly)) {
      const n = perpendicular(sub(q, p));
      const tolerance = eps * length(n);
      const pa = a.map((v) => dot(v, n));
      const pb = b.map((v) => dot(v, n));
      if (
        Math.max(...pa) <= Math.min(...pb) + tolerance ||
        Math.max(...pb) <= Math.min(...pa) + tolerance
      ) {
        return false;
      }
    }
  }
  return true;
}

/** The overlap of two collinear segments, when it has positive length. */
export function sharedSegment(
  [a, b]: Segment,
  [c, d]: Segment,
): Segment | undefined {
  const ab = sub(b, a);
  const len = length(ab);
  if (
    Math.abs(cross(ab, sub(c, a))) / len > NEAR ||
    Math.abs(cross(ab, sub(d, a))) / len > NEAR
  ) {
    return undefined;
  }
  const u = normalize(ab);
  const tc = dot(sub(c, a), u);
  const td = dot(sub(d, a), u);
  const lo = Math.max(0, Math.min(tc, td));
  const hi = Math.min(len, Math.max(tc, td));
  return hi - lo > NEAR
    ? [add(a, scale(u, lo)), add(a, scale(u, hi))]
    : undefined;
}
