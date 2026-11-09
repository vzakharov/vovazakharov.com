import type { Gridded } from '@/scene/shared/lib/plane';

/**
 * A latitude–longitude grid:`rows` rings at the Gauss–Legendre nodes in
 * `x = cos θ`, north to south, and `columns` equally spaced longitudes from
 * `φ = 0`.
 */
export type RingGrid = Gridded & {
  /** `cos θ` of each ring, falling. */
  x: Float64Array;
  /** Each ring's Gauss–Legendre weight in `x`; they sum to 2. */
  weights: Float64Array;
};

const NEWTON_TOLERANCE = 1e-15;
const NEWTON_STEPS = 100;

/** The Legendre polynomial `P_n(x)` and its derivative, by recurrence. */
function legendrePolynomial(n: number, x: number) {
  let previous = 1;
  let current = x;
  for (let k = 2; k <= n; k += 1) {
    const next = ((2 * k - 1) * x * current - (k - 1) * previous) / k;
    previous = current;
    current = next;
  }
  return {
    value: current,
    slope: (n * (x * current - previous)) / (x * x - 1),
  };
}

/** The `n`-point Gauss–Legendre nodes (falling) and weights on `[−1, 1]`. */
export function gaussLegendre(n: number) {
  const x = new Float64Array(n);
  const weights = new Float64Array(n);
  for (let i = 0; i < Math.ceil(n / 2); i += 1) {
    let node = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5));
    let slope = 1;
    for (let step = 0; step < NEWTON_STEPS; step += 1) {
      const p = legendrePolynomial(n, node);
      slope = p.slope;
      const delta = p.value / slope;
      node -= delta;
      if (Math.abs(delta) < NEWTON_TOLERANCE) break;
    }
    slope = legendrePolynomial(n, node).slope;
    const weight = 2 / ((1 - node * node) * slope * slope);
    x[i] = node;
    x[n - 1 - i] = -node;
    weights[i] = weight;
    weights[n - 1 - i] = weight;
  }
  if (n % 2 === 1) x[(n - 1) / 2] = 0;
  return { x, weights };
}

const leastPowerOfTwo = (n: number) => 2 ** Math.ceil(Math.log2(n));

/**
 * The grid for a series up to `degree`: `degree + 1` rings, which make the
 * quadrature exact for every product of two harmonics up to `degree` and put
 * none on a pole, and the least power of two of at least `2·degree + 2`
 * longitudes.
 */
export function ringGrid(degree: number): RingGrid {
  const rows = degree + 1;
  return {
    rows,
    columns: leastPowerOfTwo(2 * degree + 2),
    ...gaussLegendre(rows),
  };
}

/** The area of one cell of ring `ring` on the unit sphere. */
export const cellArea = (grid: RingGrid, ring: number) =>
  ((grid.weights[ring] ?? 0) * 2 * Math.PI) / grid.columns;
