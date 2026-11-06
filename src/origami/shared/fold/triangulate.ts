/**
 * Delaunay triangulation of a convex polygon, for meshing one piece of the
 * sheet: Bowyer–Watson over its boundary points and the points inside it.
 */
import { area, type Polygon, type Vec } from './geometry.ts';

export type Triangle = readonly [number, number, number];

type Circled = {
  readonly corners: Triangle;
  readonly cx: number;
  readonly cy: number;
  readonly r2: number;
};

/** How far the helper triangle's corners stand off, in polygon extents: far
 * enough that boundary points on one line still each make an edge. */
const SUPER_REACH = 100;

function at(points: readonly Vec[], i: number): Vec {
  const point = points[i];
  if (!point) throw new Error(`triangulate: no point ${i}`);
  return point;
}

function circled(points: readonly Vec[], corners: Triangle): Circled {
  const a = at(points, corners[0]);
  const b = at(points, corners[1]);
  const c = at(points, corners[2]);
  const bx = b[0] - a[0];
  const by = b[1] - a[1];
  const cx = c[0] - a[0];
  const cy = c[1] - a[1];
  const d = 2 * (bx * cy - by * cx);
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const ux = (cy * b2 - by * c2) / d;
  const uy = (bx * c2 - cx * b2) / d;
  return { corners, cx: a[0] + ux, cy: a[1] + uy, r2: ux * ux + uy * uy };
}

/**
 * Triangles over `points`, each counter-clockwise, whose first `rim` points
 * run counter-clockwise around a convex polygon and whose rest lie strictly
 * inside it. Every rim segment comes out as an edge. Throws when the triangles
 * fail to tile the polygon exactly, which only near-degenerate input causes.
 */
export function triangulateConvex(
  points: readonly Vec[],
  rim: number,
): Triangle[] {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const reach = SUPER_REACH * Math.max(maxX - minX, maxY - minY);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const all: Vec[] = [
    ...points,
    [midX - reach, midY - reach],
    [midX + reach, midY - reach],
    [midX, midY + reach],
  ];
  const n = points.length;
  let triangles: Circled[] = [circled(all, [n, n + 1, n + 2])];

  for (const [p, [x, y]] of points.entries()) {
    const bad = triangles.filter(
      ({ cx, cy, r2 }) => (x - cx) ** 2 + (y - cy) ** 2 < r2 * (1 - 1e-12),
    );
    const count = new Map<string, number>();
    const key = (i: number, j: number) => (i < j ? `${i},${j}` : `${j},${i}`);
    for (const {
      corners: [a, b, c],
    } of bad) {
      for (const [i, j] of [
        [a, b],
        [b, c],
        [c, a],
      ] as const) {
        count.set(key(i, j), (count.get(key(i, j)) ?? 0) + 1);
      }
    }
    const fresh = bad.flatMap(({ corners: [a, b, c] }) =>
      (
        [
          [a, b],
          [b, c],
          [c, a],
        ] as const
      )
        .filter(([i, j]) => count.get(key(i, j)) === 1)
        .map(([i, j]) => circled(all, [i, j, p])),
    );
    const gone = new Set(bad);
    triangles = [...triangles.filter((t) => !gone.has(t)), ...fresh];
  }

  const out = triangles
    .map(({ corners }) => corners)
    .filter((corners) => corners.every((i) => i < n));
  const rimPolygon: Polygon = points.slice(0, rim);
  const covered = out.reduce(
    (sum, corners) => sum + area(corners.map((i) => at(points, i))),
    0,
  );
  const directed = new Set(
    out.flatMap(([a, b, c]) => [`${a},${b}`, `${b},${c}`, `${c},${a}`]),
  );
  const missing = Array.from({ length: rim }, (_, i) => i).find(
    (i) => !directed.has(`${i},${(i + 1) % rim}`),
  );
  if (
    missing !== undefined ||
    Math.abs(covered - area(rimPolygon)) > 1e-9 * Math.max(1, covered)
  ) {
    throw new Error(
      `triangulate: the triangles do not tile the polygon${missing === undefined ? '' : ` (rim edge ${missing} missing)`}`,
    );
  }
  return out;
}
