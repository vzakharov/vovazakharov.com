import type { CoastGrid } from '../../coast-field';

type Point = readonly [number, number];

/**
 * Whether a world field's value `f` is land, lakes being water: the one test
 * the coast's contour and the land mask its distance is signed by both read,
 * so the two agree on every node.
 */
export const isLand = (f: number): boolean => f > 0;

/** Where `f` crosses zero between values `p` and `q`, as a share of the way. */
const crossing = (p: number, q: number) => p / (p - q);

/**
 * The zero line of `f` (a field on `grid`'s nodes, land where `isLand`) by
 * marching squares, as segments of four numbers each, `ax, ay, bx, by` in
 * plane metres. A saddle cell joins the corners its centre's sign matches.
 */
export function contourOf(f: Float64Array, grid: CoastGrid): Float64Array {
  const { columns, rows, originX, originY, cellMetres } = grid;
  const value = (i: number, j: number) => f[j * columns + i] ?? Number.NaN;
  const segments: number[] = [];
  const join = (p: Point, q: Point) => segments.push(p[0], p[1], q[0], q[1]);
  for (let j = 0; j + 1 < rows; j += 1) {
    for (let i = 0; i + 1 < columns; i += 1) {
      const a = value(i, j);
      const b = value(i + 1, j);
      const c = value(i + 1, j + 1);
      const d = value(i, j + 1);
      const land = [isLand(a), isLand(b), isLand(c), isLand(d)] as const;
      if (land.every((l) => l === land[0])) continue;
      const at = (u: number, v: number): Point => [
        originX + (i + u) * cellMetres,
        originY + (j + v) * cellMetres,
      ];
      // Edges counter-clockwise from the bottom: a→b, b→c, d→c, a→d.
      const edges: ReadonlyArray<Point | undefined> = [
        land[0] === land[1] ? undefined : at(crossing(a, b), 0),
        land[1] === land[2] ? undefined : at(1, crossing(b, c)),
        land[3] === land[2] ? undefined : at(crossing(d, c), 1),
        land[0] === land[3] ? undefined : at(0, crossing(a, d)),
      ];
      const crossed = edges.filter((e): e is Point => e !== undefined);
      const [p, q, r, s] = crossed;
      if (p === undefined || q === undefined) continue;
      if (r === undefined || s === undefined) {
        join(p, q);
      } else if (isLand((a + b + c + d) / 4) === land[0]) {
        // The centre joins a and c, cutting off b (bottom–right) and d.
        join(p, q);
        join(r, s);
      } else {
        // The centre joins b and d, cutting off a (left–bottom) and c.
        join(s, p);
        join(q, r);
      }
    }
  }
  return Float64Array.from(segments);
}
