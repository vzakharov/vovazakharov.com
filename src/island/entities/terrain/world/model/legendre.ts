/**
 * The orthonormal associated Legendre functions `P_lm(x)`, `x = cos θ`, with
 * `P_00 = 1/√(4π)` and the Condon–Shortley phase, so `P_lm(cos θ)·e^{imφ}` is
 * the complex orthonormal `Y_lm` (the lead's probe, `sphere.py`'s
 * `legendre`). Up from the sectoral `P_mm = −√((2m+1)/2m)·sin θ·P_{m−1,m−1}`,
 * `P_{m+1,m} = √(2m+3)·x·P_mm`, then for `l ≥ m + 2`
 * `P_lm = a_lm·(x·P_{l−1,m} − b_lm·P_{l−2,m})`.
 */
export type LegendreRecursion = {
  degree: number;
  /** `√((2m+1)/2m)` at `m`, the sectoral step's factor; 0 at `m = 0`. */
  sectoral: Float64Array;
  /** `a_lm` and `b_lm` at `start[m] + l − m`, order-major. */
  a: Float64Array;
  b: Float64Array;
  start: Int32Array;
};

/** `P_00`. */
export const LEGENDRE_00 = 1 / Math.sqrt(4 * Math.PI);

/** How many `(l, m)` with `0 ≤ m ≤ l ≤ degree`. */
export const orderMajorSize = (degree: number) =>
  ((degree + 1) * (degree + 2)) / 2;

/** The recursion's coefficients up to `degree`, computed once per degree. */
export function legendreRecursion(degree: number): LegendreRecursion {
  const start = new Int32Array(degree + 2);
  for (let m = 0; m <= degree; m += 1) {
    start[m + 1] = (start[m] ?? 0) + degree - m + 1;
  }
  const a = new Float64Array(orderMajorSize(degree));
  const b = new Float64Array(orderMajorSize(degree));
  const sectoral = new Float64Array(degree + 1);
  for (let m = 0; m <= degree; m += 1) {
    if (m > 0) sectoral[m] = Math.sqrt((2 * m + 1) / (2 * m));
    const base = (start[m] ?? 0) - m;
    for (let l = m + 2; l <= degree; l += 1) {
      a[base + l] = Math.sqrt((4 * l * l - 1) / (l * l - m * m));
      b[base + l] = Math.sqrt(
        ((l - 1) ** 2 - m * m) / (4 * (l - 1) ** 2 - 1),
      );
    }
  }
  return { degree, sectoral, a, b, start };
}

/**
 * Fills `out[l − m]` with `P_lm(x)` for `l = m … degree`, from `pmm = P_mm(x)`.
 */
export function legendreColumn(
  { degree, a, b, start }: LegendreRecursion,
  m: number,
  x: number,
  pmm: number,
  out: Float64Array,
): void {
  out[0] = pmm;
  if (m === degree) return;
  let previous = pmm;
  let current = Math.sqrt(2 * m + 3) * x * pmm;
  out[1] = current;
  const base = (start[m] ?? 0) - m;
  for (let l = m + 2; l <= degree; l += 1) {
    const next =
      (a[base + l] ?? 0) * (x * current - (b[base + l] ?? 0) * previous);
    out[l - m] = next;
    previous = current;
    current = next;
  }
}

/**
 * Every `P_lm(x)` up to `degree`, at `l·(l+1)/2 + m`: the direct table the
 * ring transforms avoid building, for checking them.
 */
export function legendreTable(degree: number, x: number): Float64Array {
  const recursion = legendreRecursion(degree);
  const table = new Float64Array(orderMajorSize(degree));
  const column = new Float64Array(degree + 1);
  const sine = Math.sqrt(1 - x * x);
  let pmm = LEGENDRE_00;
  for (let m = 0; m <= degree; m += 1) {
    if (m > 0) pmm *= -(recursion.sectoral[m] ?? 0) * sine;
    legendreColumn(recursion, m, x, pmm, column);
    for (let l = m; l <= degree; l += 1) {
      table[(l * (l + 1)) / 2 + m] = column[l - m] ?? 0;
    }
  }
  return table;
}
