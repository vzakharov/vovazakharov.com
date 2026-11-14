import type { Rgb } from '@/cube/shared/lib/colour';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { type SkyParts, skyParts } from '@/cube/shared/outside';

/**
 * The clear sky as a closed form the shader evaluates. The sun does not move
 * and the eye never leaves the sea's level, so each part of the sky is a
 * smooth function of two numbers: how high the ray looks and how far round
 * from the sun. The logarithm of each is fitted, by least squares against the
 * model, with a Chebyshev series in each.
 */

/** Terms of the series in height, and in the turn from the sun. */
export const FIT_TERMS = { lift: 8, turn: 3 } as const;

const PARTS = ['rayleigh', 'mie', 'many'] as const;
type Part = (typeof PARTS)[number];

/**
 * The fit: for each part, its coefficients as colours, the series in height
 * for the first term in turn, then for the second, and so on.
 */
export type SkyFit = Record<Part, readonly Rgb[]>;

/**
 * Where a ray climbing at sine `y` falls on the fit's height axis, −1 at the
 * horizon to 1 at the zenith: the cube root spends most of it on the first
 * degrees, where the sky turns fastest.
 */
export const liftOf = (y: number): number => 2 * Math.cbrt(Math.max(0, y)) - 1;

/** The cosine of the turn from the sun's bearing to `dir`'s, about the zenith. */
export const turnOf = (dir: Vec3, sun: Vec3): number => {
  const flat = Math.hypot(dir[0], dir[2]) * Math.hypot(sun[0], sun[2]);
  return flat < 1e-9 ? 1 : (dir[0] * sun[0] + dir[2] * sun[2]) / flat;
};

/** Chebyshev's first `count` polynomials at `x`. */
const chebyshev = (x: number, count: number): number[] => {
  const terms = [1, x];
  for (let n = 2; n < count; n++) {
    terms.push(2 * x * (terms[n - 1] ?? 0) - (terms[n - 2] ?? 0));
  }
  return terms.slice(0, count);
};

/** The fit's basis at a height and a turn, in the order `SkyFit` holds it. */
const basisAt = (lift: number, turn: number): number[] => {
  const up = chebyshev(lift, FIT_TERMS.lift);
  return chebyshev(turn, FIT_TERMS.turn).flatMap((round) =>
    up.map((term) => term * round),
  );
};

/** `rows · x = column`, solved in place by elimination with pivoting. */
export const solve = (rows: number[][], column: number[]): number[] => {
  const size = column.length;
  const at = (i: number, j: number): number => rows[i]?.[j] ?? 0;
  for (let k = 0; k < size; k++) {
    let pivot = k;
    for (let i = k + 1; i < size; i++) {
      if (Math.abs(at(i, k)) > Math.abs(at(pivot, k))) pivot = i;
    }
    [rows[k], rows[pivot]] = [rows[pivot] ?? [], rows[k] ?? []];
    [column[k], column[pivot]] = [column[pivot] ?? 0, column[k] ?? 0];
    for (let i = k + 1; i < size; i++) {
      const factor = at(i, k) / at(k, k);
      const row = rows[i] ?? [];
      for (let j = k; j < size; j++) row[j] = at(i, j) - factor * at(k, j);
      column[i] = (column[i] ?? 0) - factor * (column[k] ?? 0);
    }
  }
  const x = Array.from({ length: size }, () => 0);
  for (let i = size - 1; i >= 0; i--) {
    let rest = column[i] ?? 0;
    for (let j = i + 1; j < size; j++) rest -= at(i, j) * (x[j] ?? 0);
    x[i] = rest / at(i, i);
  }
  return x;
};

/** Sample rays per axis: enough over the terms that the fit cannot ring. */
const SAMPLES = { lift: 40, turn: 12 } as const;

/** A ray the fits are made on: where it falls on their axes, and itself. */
/**
 * A ray and the sun, both in the frame whose x is the sun's bearing, and
 * where the ray falls on the fit's `axes`: its height, then its turn, which
 * `dir` loses at the zenith.
 */
type FitRay = { dir: Vec3; toSun: Vec3; axes: readonly [number, number] };

/**
 * The rays a fit of the sky under a sun toward `sun` is made on, even in
 * height as `liftOf` spreads it and in the turn from the sun, in the frame
 * whose x is the sun's bearing.
 */
export function fitRays(sun: Vec3): FitRay[] {
  const toSun: Vec3 = [Math.hypot(sun[0], sun[2]), sun[1], 0];
  const rays: FitRay[] = [];
  for (let i = 0; i < SAMPLES.lift; i++) {
    const lift = (2 * i) / (SAMPLES.lift - 1) - 1;
    const y = ((lift + 1) / 2) ** 3;
    const out = Math.sqrt(1 - y * y);
    for (let j = 0; j < SAMPLES.turn; j++) {
      const round = (Math.PI * j) / (SAMPLES.turn - 1);
      rays.push({
        dir: [out * Math.cos(round), y, out * Math.sin(round)],
        toSun,
        axes: [lift, Math.cos(round)],
      });
    }
  }
  return rays;
}

/** The sky under a sun toward `sun`, fitted. */
export function fitSky(sun: Vec3): SkyFit {
  const size = FIT_TERMS.lift * FIT_TERMS.turn;
  const samples = fitRays(sun).map(({ dir, toSun, axes }) => ({
    basis: basisAt(...axes),
    parts: skyParts(dir, toSun),
  }));
  const normal = (): number[][] =>
    Array.from({ length: size }, (_, a) =>
      Array.from({ length: size }, (__, b) =>
        samples.reduce(
          (sum, { basis }) => sum + (basis[a] ?? 0) * (basis[b] ?? 0),
          0,
        ),
      ),
    );
  const fitted = (part: Part, channel: 0 | 1 | 2): number[] =>
    solve(
      normal(),
      Array.from({ length: size }, (_, a) =>
        samples.reduce(
          (sum, { basis, parts }) =>
            sum + (basis[a] ?? 0) * Math.log(parts[part][channel]),
          0,
        ),
      ),
    );
  const part = (name: Part): Rgb[] => {
    const [r, g, b] = [fitted(name, 0), fitted(name, 1), fitted(name, 2)];
    return r.map((red, n) => [red, g[n] ?? 0, b[n] ?? 0]);
  };
  return { rayleigh: part('rayleigh'), mie: part('mie'), many: part('many') };
}

/** The parts of the sky `fit` gives along `dir`, a ray at or over the horizon. */
export function fittedParts(fit: SkyFit, dir: Vec3, sun: Vec3): SkyParts {
  const basis = basisAt(liftOf(dir[1]), turnOf(dir, sun));
  const part = (name: Part): Rgb => {
    const sum = [0, 0, 0];
    for (const [n, colour] of fit[name].entries()) {
      for (const c of [0, 1, 2] as const) {
        sum[c] = (sum[c] ?? 0) + colour[c] * (basis[n] ?? 0);
      }
    }
    return [
      Math.exp(sum[0] ?? 0),
      Math.exp(sum[1] ?? 0),
      Math.exp(sum[2] ?? 0),
    ];
  };
  return { rayleigh: part('rayleigh'), mie: part('mie'), many: part('many') };
}
