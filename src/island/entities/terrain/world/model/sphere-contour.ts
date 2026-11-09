import {
  gridFrame,
  type LatLonGrid,
  nodeOf,
  nodePosition,
} from '../../coast-field';

/**
 * Whether a world field's value `f` is land, lakes being water: the one test
 * the coast's contour and the land mask its distance is signed by both read,
 * so the two agree on every node.
 */
export const isLand = (f: number): boolean => f > 0;

/**
 * The zero line of `f` (a field on `grid`'s nodes, land where `isLand`) by
 * marching squares, as segments of six numbers each, two unit vectors.
 * The cells wrap in longitude, and each pole is covered by `columns / 2`
 * cells between ring 0 (or the last) at `λ` and at `λ + π` — `nodeOf`'s
 * ring past the pole. A crossing is placed linearly along the chord between
 * two nodes and pushed back onto the sphere. A saddle cell joins the corners
 * its centre's sign matches.
 */
export function sphereContourOf(
  f: Float64Array,
  grid: LatLonGrid,
): Float64Array {
  const { rows, columns } = grid;
  const frame = gridFrame(grid);
  const positions = new Float64Array(3 * rows * columns);
  for (let n = 0; n < rows * columns; n += 1) {
    nodePosition(frame, columns, n, positions, 3 * n);
  }
  const segments: number[] = [];
  const corner = new Int32Array(4);
  const value = new Float64Array(4);
  const land = new Uint8Array(4);
  const point = (p: number, q: number, out: number[]) => {
    const fp = value[p] ?? Number.NaN;
    const t = fp / (fp - (value[q] ?? Number.NaN));
    const np = 3 * (corner[p] ?? 0);
    const nq = 3 * (corner[q] ?? 0);
    let length = 0;
    for (let a = 0; a < 3; a += 1) {
      const x = positions[np + a] ?? Number.NaN;
      out[a] = x + ((positions[nq + a] ?? Number.NaN) - x) * t;
      length += (out[a] ?? 0) ** 2;
    }
    length = Math.sqrt(length);
    for (let a = 0; a < 3; a += 1) out[a] = (out[a] ?? 0) / length;
    return out;
  };
  const crossed: number[][] = [];
  const scratch = [0, 1, 2, 3].map(() => [0, 0, 0]);
  const join = (p: readonly number[], q: readonly number[]) =>
    segments.push(...p, ...q);

  const cell = (ring: number, column: number) => {
    // Corners counter-clockwise in (λ, θ): a, b along the ring, c, d below.
    corner[0] = nodeOf(grid, ring, column);
    corner[1] = nodeOf(grid, ring, column + 1);
    corner[2] = nodeOf(grid, ring + 1, column + 1);
    corner[3] = nodeOf(grid, ring + 1, column);
    for (let k = 0; k < 4; k += 1) {
      value[k] = f[corner[k] ?? 0] ?? Number.NaN;
      land[k] = isLand(value[k] ?? Number.NaN) ? 1 : 0;
    }
    const sum =
      (land[0] ?? 0) + (land[1] ?? 0) + (land[2] ?? 0) + (land[3] ?? 0);
    if (sum === 0 || sum === 4) return;
    crossed.length = 0;
    // Edges in order: a→b, b→c, d→c, a→d.
    const edges = [
      [0, 1],
      [1, 2],
      [3, 2],
      [0, 3],
    ] as const;
    for (const [e, [p, q]] of edges.entries()) {
      if (land[p] !== land[q]) {
        crossed.push(point(p, q, scratch[e] ?? [0, 0, 0]));
      }
    }
    const [p, q, r, s] = crossed;
    if (p === undefined || q === undefined) return;
    if (r === undefined || s === undefined) {
      join(p, q);
      return;
    }
    const centre =
      ((value[0] ?? 0) + (value[1] ?? 0) + (value[2] ?? 0) + (value[3] ?? 0)) /
      4;
    if (isLand(centre) === (land[0] === 1)) {
      // The centre joins a and c, cutting off b and d.
      join(p, q);
      join(r, s);
    } else {
      // The centre joins b and d, cutting off a and c.
      join(s, p);
      join(q, r);
    }
  };

  for (let j = 0; j < columns / 2; j += 1) cell(-1, j);
  for (let r = 0; r + 1 < rows; r += 1) {
    for (let j = 0; j < columns; j += 1) cell(r, j);
  }
  for (let j = 0; j < columns / 2; j += 1) cell(rows - 1, j);
  return Float64Array.from(segments);
}
