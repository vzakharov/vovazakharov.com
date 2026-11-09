import { type CoastField, signedDistanceField } from '../../coast-field';
import { contourOf, isLand } from './contour';
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
import { GRID, GRID_NODES } from './square';

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
 * `inner`, gone by `outer`. The waves are periodic, so untapered land reaching
 * the square's edge would wrap to the far side; past `outer` the field is the
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
 * World `N`'s land as a `CoastField` over its square: `f = dome + taper ·
 * waves` on `GRID` decides land (`isLand`), and each node
 * stores its signed distance in metres to `f`'s zero line, so a height read
 * off it rises with the true distance to the coast.
 */
export function buildWorldField(
  world: string,
  mask: Uint32Array = MASK,
): CoastField {
  const words = worldWords(world, mask);
  const dome = domeOf(words);
  const f = wavesOf(words);
  const inside = new Uint8Array(N * N);
  for (let j = 0; j < N; j += 1) {
    for (let i = 0; i < N; i += 1) {
      const n = j * N + i;
      f[n] = (f[n] ?? 0) * taperAt(i / N, j / N) + domeAt(dome, i / N, j / N);
      inside[n] = isLand(f[n] ?? 0) ? 1 : 0;
    }
  }
  const coast = contourOf(f, GRID);
  if (coast.length === 0) {
    throw new Error(`buildWorldField: world ${world} has no coast`);
  }
  return signedDistanceField(coast, inside, GRID);
}

/** World `N`'s per-tile noise seed: its word 5, raw. */
export const worldSeed = (world: string, mask: Uint32Array = MASK): number =>
  worldWords(world, mask)[SEED_WORD] ?? Number.NaN;
