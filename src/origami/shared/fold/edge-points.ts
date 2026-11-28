/**
 * Contact points along the paper's outline edges besides their ends. An edge
 * can pass between another layer's vertices without either end touching a
 * triangle; points along it see that.
 */
import type { Outlined } from './mesh.ts';

export type EdgePoints = {
  /** Each point's edge, as its two end vertices, flattened. */
  readonly ends: Int32Array;
  /** Each point's share of its edge's first end: the point sits at
   * `weight·x[a] + (1 − weight)·x[b]`. */
  readonly weight: Float64Array;
};

/** `perEdge` points along each outline edge, evenly spaced: 1 the midpoint,
 * 3 the quarter points. */
export function edgePoints({ outline }: Outlined, perEdge: number): EdgePoints {
  const ends: number[] = [];
  const weight: number[] = [];
  for (const [a, b] of outline) {
    for (let k = 1; k <= perEdge; k++) {
      ends.push(a, b);
      weight.push(1 - k / (perEdge + 1));
    }
  }
  return { ends: Int32Array.from(ends), weight: Float64Array.from(weight) };
}

/** Writes the mesh's positions `x` into `into`, followed by each edge
 * point's, so edge points ride the same loops as vertices. */
export function spread(
  { ends, weight }: EdgePoints,
  x: Float64Array,
  into: Float64Array,
): void {
  into.set(x);
  const real = x.length / 3;
  for (const [p, w] of weight.entries()) {
    const a = 3 * (ends[2 * p] ?? 0);
    const b = 3 * (ends[2 * p + 1] ?? 0);
    for (let axis = 0; axis < 3; axis++) {
      into[3 * (real + p) + axis] =
        w * (x[a + axis] ?? 0) + (1 - w) * (x[b + axis] ?? 0);
    }
  }
}

/** Writes `from`'s vertex forces into `f`, each edge point's force added to
 * its edge's ends by its weight on them. */
export function gather(
  { ends, weight }: EdgePoints,
  from: Float64Array,
  f: Float64Array,
): void {
  const real = f.length / 3;
  f.set(from.subarray(0, 3 * real));
  for (const [p, w] of weight.entries()) {
    const a = 3 * (ends[2 * p] ?? 0);
    const b = 3 * (ends[2 * p + 1] ?? 0);
    for (let axis = 0; axis < 3; axis++) {
      const g = from[3 * (real + p) + axis] ?? 0;
      f[a + axis] = (f[a + axis] ?? 0) + w * g;
      f[b + axis] = (f[b + axis] ?? 0) + (1 - w) * g;
    }
  }
}
