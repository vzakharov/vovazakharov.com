import type { CoastField } from '../../coast-field';
import { domeAt, domeOf } from './dome';
import { ifft2 } from './fft';
import { coefficientOf } from './harmonic';
import {
  HARMONIC_COUNT,
  harmonicWord,
  SEED_WORD,
  type Wavevector,
  wavevectorOf,
} from './layout';
import { MASK, worldWords } from './mask';
import { GRID, GRID_NODES, SQUARE } from './square';

const N = GRID_NODES;

/** `x mod N` into `[0, N)`, for a frequency's bin. */
const bin = (x: number) => ((x % N) + N) % N;

/** Wavevector `k`'s bin in the grid's row-major `N²` spectrum. */
export const spectrumBin = ({ kx, ky }: Wavevector): number =>
  bin(ky) * N + bin(kx);

/**
 * The waves `Σ c_k e^{2πi k·p}` on the grid, node `(i, j)` at
 * `p = (i, j) / N`: every coefficient and its conjugate set into one
 * spectrum, then one inverse 2D FFT.
 */
export function wavesOf(words: Uint32Array): Float64Array {
  const re = new Float64Array(N * N);
  const im = new Float64Array(N * N);
  // `ifft2` divides by N²; the series is the unscaled sum.
  const unscale = N * N;
  for (let h = 0; h < HARMONIC_COUNT; h += 1) {
    const k = wavevectorOf(h);
    const c = coefficientOf(
      k,
      words[harmonicWord(h, 'phase')] ?? Number.NaN,
      words[harmonicWord(h, 'factor')] ?? Number.NaN,
    );
    const at = spectrumBin(k);
    re[at] = (re[at] ?? 0) + unscale * c.re;
    im[at] = (im[at] ?? 0) + unscale * c.im;
    if (h === 0) continue;
    const conjugate = spectrumBin({ kx: -k.kx, ky: -k.ky });
    re[conjugate] = (re[conjugate] ?? 0) + unscale * c.re;
    im[conjugate] = (im[conjugate] ?? 0) - unscale * c.im;
  }
  ifft2({ re, im }, N);
  return re;
}

/**
 * The waves' edge taper, from the middle in units of the side: whole within
 * `INNER`, gone by `OUTER`. The waves are periodic, so untapered land reaching
 * the square's edge would wrap to the far side; past `OUTER` the field is the
 * dome alone, deep sea.
 */
export const TAPER = { inner: 0.4, outer: 0.48 } as const;

/** One axis of the taper at `p`, square units: 1 − smoothstep. */
function taperAxis(p: number): number {
  const t = (Math.abs(p - 0.5) - TAPER.inner) / (TAPER.outer - TAPER.inner);
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  return 1 - t * t * (3 - 2 * t);
}

/** The taper at `(px, py)`, square units: a product of the two axes'. */
export const taperAt = (px: number, py: number): number =>
  taperAxis(px) * taperAxis(py);

/**
 * The floor under `|∇f|`, per metre: a quarter of the dome's gentlest slope,
 * which a cone has along its longer axis, `1 / (max(a, b) · side)`.
 */
const gradientFloor = (radiusA: number, radiusB: number) =>
  1 / (4 * Math.max(radiusA, radiusB) * SQUARE.side);

/**
 * World `N`'s land as a `CoastField` over its square: `f = dome + taper ·
 * waves` on the 1024² grid, stored as the pseudo-distance `f / max(|∇f|, floor)` in
 * metres — the true distance to the coast near it, positive on land — with
 * `∇f` by central differences (one-sided on the grid's edge).
 */
export function buildWorldField(
  world: string,
  mask: Uint32Array = MASK,
): CoastField {
  const words = worldWords(world, mask);
  const dome = domeOf(words);
  const f = wavesOf(words);
  for (let j = 0; j < N; j += 1) {
    for (let i = 0; i < N; i += 1) {
      const n = j * N + i;
      f[n] = (f[n] ?? 0) * taperAt(i / N, j / N) + domeAt(dome, i / N, j / N);
    }
  }
  const floor = gradientFloor(dome.radiusA, dome.radiusB);
  const value = (i: number, j: number) => f[j * N + i] ?? Number.NaN;
  const slope = (low: number, high: number, a: number, b: number) =>
    (b - a) / ((high - low) * GRID.cellMetres);
  const distance = new Float32Array(N * N);
  for (let j = 0; j < N; j += 1) {
    const below = Math.max(0, j - 1);
    const above = Math.min(N - 1, j + 1);
    for (let i = 0; i < N; i += 1) {
      const left = Math.max(0, i - 1);
      const right = Math.min(N - 1, i + 1);
      const gx = slope(left, right, value(left, j), value(right, j));
      const gy = slope(below, above, value(i, below), value(i, above));
      distance[j * N + i] = value(i, j) / Math.max(Math.hypot(gx, gy), floor);
    }
  }
  return { ...GRID, distance };
}

/** World `N`'s per-tile noise seed: its word 5, raw. */
export const worldSeed = (world: string, mask: Uint32Array = MASK): number =>
  worldWords(world, mask)[SEED_WORD] ?? Number.NaN;
