import {
  coefficientOf,
  type Dome,
  domeWords,
  encodeCoefficient,
  envelope,
  fft2,
  GRID_NODES,
  HARMONIC_COUNT,
  harmonicWord,
  SEED_WORD,
  wavevectorOf,
  WORD_COUNT,
} from '@/island/entities/terrain';

const N = GRID_NODES;
const MEAN = { kx: 0, ky: 0 };

/** The largest factor a word decodes to, either sign: the normal's tail. */
export const FACTOR_LIMIT =
  coefficientOf(MEAN, 0, 0xff_ff_ff_ff).re / envelope(MEAN);

/** One harmonic whose factor the decoder cannot reach. */
export type Clipped = { kx: number; ky: number; factor: number };

/** Ours, as words, and how hard the fit pressed the factors. */
export type FittedWords = {
  words: Uint32Array;
  /** The largest `|factor|` the fit asked for, harmonic by harmonic. */
  maxFactor: number;
  /** The largest asked among `|k| ≤ 1.5`, at a tenth of the envelope. */
  maxLowFactor: number;
  /** Every harmonic asked past `FACTOR_LIMIT`, encoded at the limit. */
  clipped: Clipped[];
};

/** `x mod N` into `[0, N)`, for a frequency's bin. */
const bin = (x: number) => ((x % N) + N) % N;

/**
 * The words that make world 1 `dome + waves`, `waves` real on the world grid:
 * its forward FFT, each harmonic's bin over `N²` encoded (the conjugate
 * implied, `c_0` real), the dome's five words, and `seed` as the noise word.
 */
export function fitWords(
  waves: Float64Array,
  dome: Dome,
  seed: number,
): FittedWords {
  const spectrum = {
    re: Float64Array.from(waves),
    im: new Float64Array(N * N),
  };
  fft2(spectrum, N);
  const words = new Uint32Array(WORD_COUNT);
  words.set(domeWords(dome), 0);
  words[SEED_WORD] = seed;
  let maxFactor = 0;
  let maxLowFactor = 0;
  const clipped: Clipped[] = [];
  for (let h = 0; h < HARMONIC_COUNT; h += 1) {
    const k = wavevectorOf(h);
    const at = bin(k.ky) * N + bin(k.kx);
    const c = {
      re: (spectrum.re[at] ?? Number.NaN) / (N * N),
      im: h === 0 ? 0 : (spectrum.im[at] ?? Number.NaN) / (N * N),
    };
    const { phaseWord, factorWord } = encodeCoefficient(k, c);
    words[harmonicWord(h, 'phase')] = phaseWord;
    words[harmonicWord(h, 'factor')] = factorWord;
    const factor = Math.hypot(c.re, c.im) / envelope(k);
    maxFactor = Math.max(maxFactor, factor);
    if (k.kx * k.kx + k.ky * k.ky <= 1.5 ** 2) {
      maxLowFactor = Math.max(maxLowFactor, factor);
    }
    if (factor > FACTOR_LIMIT) clipped.push({ ...k, factor });
  }
  return { words, maxFactor, maxLowFactor, clipped };
}
