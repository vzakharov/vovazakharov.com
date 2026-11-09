import type { Gridded } from '@/scene/shared/lib/plane';

/**
 * A latitude–longitude node grid on the unit sphere: `rows` rings at
 * colatitudes `theta` (rising, north to south, none on a pole) and `columns`
 * (even) longitudes `λ_j = 2πj / columns` east of Greenwich. Node
 * `(ring, column)` sits at `ring · columns + column`, at the point
 * `latLonToUnit` gives that latitude and longitude.
 */
export type LatLonGrid = Gridded & { theta: Float64Array };

/**
 * The node at `(ring, column)` with the grid's two topology rules applied:
 * longitude wraps, and a ring past a pole is the ring as far on this side of
 * it, half a turn round — ring `−1` at `λ` is ring `0` at `λ + π`, ring
 * `rows` is ring `rows − 1` likewise.
 */
export function nodeOf(grid: Gridded, ring: number, column: number): number {
  const { rows, columns } = grid;
  let r = ring;
  let c = column;
  if (r < 0) {
    r = -1 - r;
    c += columns / 2;
  } else if (r >= rows) {
    r = 2 * rows - 1 - r;
    c += columns / 2;
  }
  return r * columns + (((c % columns) + columns) % columns);
}

/**
 * Each ring's `sin θ` and `cos θ` and each column's `cos λ` and `sin λ`, so
 * node `(r, j)` is `(sinθ_r·cosλ_j, cosθ_r, −sinθ_r·sinλ_j)` — Greenwich on
 * `+X`, north `+Y`, east toward `−Z`, as `latLonToUnit` has it.
 */
export function gridFrame({ theta, columns }: LatLonGrid) {
  const ringSin = theta.map((t) => Math.sin(t));
  const ringCos = theta.map((t) => Math.cos(t));
  const columnCos = new Float64Array(columns);
  const columnSin = new Float64Array(columns);
  for (let j = 0; j < columns; j += 1) {
    const lambda = (2 * Math.PI * j) / columns;
    columnCos[j] = Math.cos(lambda);
    columnSin[j] = Math.sin(lambda);
  }
  return { ringSin, ringCos, columnCos, columnSin };
}

export type GridFrame = ReturnType<typeof gridFrame>;

/** Node `n`'s unit vector, written into `out` at `offset`. */
export function nodePosition(
  frame: GridFrame,
  columns: number,
  n: number,
  out: Float64Array,
  offset = 0,
) {
  const r = Math.floor(n / columns);
  const j = n - r * columns;
  const s = frame.ringSin[r] ?? Number.NaN;
  out[offset] = s * (frame.columnCos[j] ?? Number.NaN);
  out[offset + 1] = frame.ringCos[r] ?? Number.NaN;
  out[offset + 2] = -s * (frame.columnSin[j] ?? Number.NaN);
}

/** The colatitude and east longitude (in `[0, 2π)`) of a nonzero vector. */
export function colatitudeLongitude(p: readonly [number, number, number]) {
  const [x, y, z] = p;
  const theta = Math.atan2(Math.hypot(x, z), y);
  const lambda = Math.atan2(-z, x);
  return { theta, lambda: lambda < 0 ? lambda + 2 * Math.PI : lambda };
}

/**
 * The ring at or north of colatitude `theta`: `−1` north of ring 0, `rows − 1`
 * south of the last. Starts from the Gauss–Legendre nodes' asymptote and
 * steps, so it is a few comparisons for any ring spacing near it.
 */
export function ringAbove({ theta: rings, rows }: LatLonGrid, theta: number) {
  let r = Math.min(
    rows - 1,
    Math.max(-1, Math.floor((theta * (rows + 0.5)) / Math.PI - 0.75)),
  );
  while (r >= 0 && (rings[r] ?? 0) > theta) r -= 1;
  while (r + 1 < rows && (rings[r + 1] ?? Infinity) <= theta) r += 1;
  return r;
}
