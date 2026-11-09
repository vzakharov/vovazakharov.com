import { fft, ifft } from './fft';
import {
  LEGENDRE_00,
  legendreColumn,
  type LegendreRecursion,
  legendreRecursion,
  orderMajorSize,
} from './legendre';
import { cellArea, type RingGrid, ringGrid } from './sphere-grid';

/**
 * A real spherical-harmonic series `f = Σ_{l ≤ L} Σ_{|m| ≤ l} c_lm Y_lm` in
 * the real orthonormal harmonics
 *
 * - `Y_l0 = P_l0(cos θ)`,
 * - `Y_lm = √2·P_lm(cos θ)·cos mφ` for `m > 0`,
 * - `Y_lm = √2·P_l|m|(cos θ)·sin |m|φ` for `m < 0`,
 *
 * `P_lm` as `legendre.ts` has it. The `√2` sits in the harmonic, never in
 * `c_lm`, so `∫ f² = Σ c_lm²` and unit normal `c_lm` make an isotropic field.
 * `c_lm` is at `l² + l + m`, `(L + 1)²` in all; `f` is on a `RingGrid`, ring
 * `r`'s value at longitude `j` at `r·columns + j`.
 */
export type SphereTransform = {
  grid: RingGrid;
  recursion: LegendreRecursion;
};

export const harmonicSlot = (l: number, m: number) => l * l + l + m;

/**
 * Below this, a sectoral `P_mm` on a ring is dropped with every higher order:
 * near a pole `P_mm ~ sin^m θ` falls past any harmonic up to the degree lifting
 * it back, and carrying it on into subnormals costs time and nothing else.
 */
const NEGLIGIBLE = 1e-280;

/** The grid and recursion for a series up to `degree`. */
export const sphereTransform = (degree: number): SphereTransform => ({
  grid: ringGrid(degree),
  recursion: legendreRecursion(degree),
});

/**
 * How many ring pairs: rings `r` and `rings − 1 − r` mirror each other across
 * the equator, where `P_lm(−x) = (−1)^{l+m}·P_lm(x)`, so one recursion serves
 * both. With an odd count the middle ring is its own pair.
 */
const ringPairs = ({ rows }: RingGrid) => Math.ceil(rows / 2);

/** `c_lm` for `±m`, reordered order-major to match `legendreColumn`. */
function orderMajor({ degree, start }: LegendreRecursion, c: Float64Array) {
  const cosine = new Float64Array(orderMajorSize(degree));
  const sine = new Float64Array(orderMajorSize(degree));
  for (let m = 0; m <= degree; m += 1) {
    const base = (start[m] ?? 0) - m;
    for (let l = m; l <= degree; l += 1) {
      cosine[base + l] = c[harmonicSlot(l, m)] ?? 0;
      if (m > 0) sine[base + l] = c[harmonicSlot(l, -m)] ?? 0;
    }
  }
  return { cosine, sine };
}

/** The series' values on the grid. */
export function synthesize(
  { grid, recursion }: SphereTransform,
  c: Float64Array,
): Float64Array {
  const { rows: rings, columns } = grid;
  const { degree, sectoral, start } = recursion;
  const { cosine, sine } = orderMajor(recursion, c);
  const field = new Float64Array(rings * columns);
  const column = new Float64Array(degree + 1);
  const spectrum = {
    re: new Float64Array(columns),
    im: new Float64Array(columns),
  };
  for (let pair = 0; pair < ringPairs(grid); pair += 1) {
    const x = grid.x[pair] ?? 0;
    const sineTheta = Math.sqrt(1 - x * x);
    spectrum.re.fill(0);
    spectrum.im.fill(0);
    let pmm = LEGENDRE_00;
    for (let m = 0; m <= degree; m += 1) {
      if (m > 0) pmm *= -(sectoral[m] ?? 0) * sineTheta;
      if (Math.abs(pmm) < NEGLIGIBLE) break;
      legendreColumn(recursion, m, x, pmm, column);
      const base = start[m] ?? 0;
      let cosEven = 0;
      let cosOdd = 0;
      let sinEven = 0;
      let sinOdd = 0;
      for (let k = 0; k <= degree - m; k += 2) {
        const p = column[k] ?? 0;
        cosEven += p * (cosine[base + k] ?? 0);
        sinEven += p * (sine[base + k] ?? 0);
      }
      for (let k = 1; k <= degree - m; k += 2) {
        const p = column[k] ?? 0;
        cosOdd += p * (cosine[base + k] ?? 0);
        sinOdd += p * (sine[base + k] ?? 0);
      }
      // Ring values `Σ_m C_m cos mφ + S_m sin mφ`, north and south packed as
      // the real and imaginary parts of one inverse transform.
      if (m === 0) {
        spectrum.re[0] = (cosEven + cosOdd) * columns;
        spectrum.im[0] = (cosEven - cosOdd) * columns;
        continue;
      }
      const half = (Math.SQRT2 / 2) * columns;
      const cn = (cosEven + cosOdd) * half;
      const cs = (cosEven - cosOdd) * half;
      const sn = (sinEven + sinOdd) * half;
      const ss = (sinEven - sinOdd) * half;
      spectrum.re[m] = cn + ss;
      spectrum.im[m] = cs - sn;
      spectrum.re[columns - m] = cn - ss;
      spectrum.im[columns - m] = cs + sn;
    }
    ifft(spectrum);
    field.set(spectrum.re, pair * columns);
    field.set(spectrum.im, (rings - 1 - pair) * columns);
  }
  return field;
}

/** The series up to the grid's degree whose synthesis is `field`. */
export function analyze(
  { grid, recursion }: SphereTransform,
  field: Float64Array,
): Float64Array {
  const { rows: rings, columns } = grid;
  const { degree, sectoral, start } = recursion;
  const cosine = new Float64Array(orderMajorSize(degree));
  const sine = new Float64Array(orderMajorSize(degree));
  const column = new Float64Array(degree + 1);
  const signal = { re: new Float64Array(columns), im: new Float64Array(columns) };
  for (let pair = 0; pair < ringPairs(grid); pair += 1) {
    const south = rings - 1 - pair;
    const x = grid.x[pair] ?? 0;
    const sineTheta = Math.sqrt(1 - x * x);
    signal.re.set(field.subarray(pair * columns, (pair + 1) * columns));
    if (south === pair) signal.im.fill(0);
    else signal.im.set(field.subarray(south * columns, (south + 1) * columns));
    fft(signal);
    const { re, im } = signal;
    const quadrature = cellArea(grid, pair);
    let pmm = LEGENDRE_00;
    for (let m = 0; m <= degree; m += 1) {
      if (m > 0) pmm *= -(sectoral[m] ?? 0) * sineTheta;
      if (Math.abs(pmm) < NEGLIGIBLE) break;
      // Each ring's own transform `F_m = Σ_j f_j e^{−imφ_j}`, unpacked.
      const mirror = (columns - m) % columns;
      const wr = re[m] ?? 0;
      const wi = im[m] ?? 0;
      const vr = re[mirror] ?? 0;
      const vi = im[mirror] ?? 0;
      const scale = (m === 0 ? 1 : Math.SQRT2) * quadrature;
      const cn = ((wr + vr) / 2) * scale;
      const sn = (-(wi - vi) / 2) * scale;
      const cs = ((wi + vi) / 2) * scale;
      const ss = ((wr - vr) / 2) * scale;
      legendreColumn(recursion, m, x, pmm, column);
      const base = start[m] ?? 0;
      for (let k = 0; k <= degree - m; k += 1) {
        const p = column[k] ?? 0;
        const even = k % 2 === 0;
        cosine[base + k] = (cosine[base + k] ?? 0) + p * (even ? cn + cs : cn - cs);
        sine[base + k] = (sine[base + k] ?? 0) + p * (even ? sn + ss : sn - ss);
      }
    }
  }
  const c = new Float64Array((degree + 1) ** 2);
  for (let m = 0; m <= degree; m += 1) {
    const base = (start[m] ?? 0) - m;
    for (let l = m; l <= degree; l += 1) {
      c[harmonicSlot(l, m)] = cosine[base + l] ?? 0;
      if (m > 0) c[harmonicSlot(l, -m)] = sine[base + l] ?? 0;
    }
  }
  return c;
}
