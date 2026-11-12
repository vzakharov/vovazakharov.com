import type { Seeded } from '@/kernel/shared/typings';

import { K_CEILING, type Sea, spectrumOf, turnsPerHour } from './spectrum';

/**
 * One band of the sea's waves, synthesised as a square tile that repeats
 * every `side` metres. Tiles of very different sides laid over one another
 * give waves from the swell down to ripples without one enormous transform.
 */
export type Cascade = {
  /** Metres the tile spans before it repeats. */
  side: number;
  /** The band's wavenumbers, rad/m: `from` inclusive, `to` exclusive. */
  from: number;
  to: number;
};

/** Texels along a tile's side; a power of two, for the transform. */
export const TILE = 256;

/**
 * The bands, longest first. Each hands over to the next where its own texels
 * stop resolving a wave, a little under its Nyquist wavenumber.
 */
export const CASCADES: readonly Cascade[] = [
  { side: 3200, from: 0, to: 0.157 },
  { side: 200, from: 0.157, to: 2.5 },
  { side: 25, from: 2.5, to: 20 },
  { side: 3.2, from: 20, to: 160 },
];

/** The finest wave any cascade carries; shorter ones are only roughness. */
export const FINEST = CASCADES.at(-1)?.to ?? K_CEILING;

/** What the wave field's first pass reads, one entry per texel of the tile. */
export type Amplitudes = {
  /**
   * Four floats a texel: the complex amplitude of the wave travelling toward
   * the texel's wavevector, then the conjugate of the one travelling the
   * opposite way — the pair a real surface needs at every moment.
   */
  waves: Float32Array;
  /** Whole turns per hour of the texel's wave. */
  turns: Uint32Array;
};

const mix32 = (x: number): number => {
  let h = x >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7f_eb_35_2d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x84_6c_a6_8b);
  h ^= h >>> 16;
  return h >>> 0;
};

const hashOf = (a: number, b: number): number =>
  mix32(a ^ mix32((b + 0x9e_37_79_b9) >>> 0));

/** A word as a number in (0, 1]. */
const unitOf = (word: number): number => ((word >>> 8) + 1) / 16_777_216;

/** Two independent unit normals from one word (Box–Muller). */
function normals(word: number): [number, number] {
  const radius = Math.sqrt(-2 * Math.log(unitOf(word)));
  const angle = 2 * Math.PI * unitOf(mix32(word ^ 0xa5_a5_a5_a5));
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

/** The signed frequency index of texel `i` along a side, FFT order. */
export const bin = (i: number): number => (i < TILE / 2 ? i : i - TILE);

/**
 * The seeded amplitudes of cascade `index` of `seas`: every wave of the band
 * with a random phase and a height drawn about what the spectrum says, the
 * same for every viewer because the draw is a hash of the wave's own indices.
 */
export function amplitudesOf(
  seas: readonly Sea[],
  index: number,
  { seed }: Seeded,
): Amplitudes {
  const cascade = CASCADES[index];
  if (cascade === undefined) throw new Error(`No cascade ${String(index)}`);
  const spectrum = spectrumOf(seas);
  const step = (2 * Math.PI) / cascade.side;
  const salt = hashOf(seed, index);
  /** The complex amplitude of the wave at bins (`p`, `q`), or zero outside the band. */
  const wave = (p: number, q: number): [number, number] => {
    const kx = p * step;
    const kz = q * step;
    const k = Math.hypot(kx, kz);
    if (k < cascade.from || k >= cascade.to || k === 0) return [0, 0];
    const height = Math.sqrt((spectrum.at(kx, kz) * step * step) / 2);
    const [re, im] = normals(hashOf(hashOf(p >>> 0, q >>> 0), salt));
    return [(height * re) / Math.SQRT2, (height * im) / Math.SQRT2];
  };
  const waves = new Float32Array(TILE * TILE * 4);
  const turns = new Uint32Array(TILE * TILE);
  for (let j = 0; j < TILE; j += 1) {
    for (let i = 0; i < TILE; i += 1) {
      const p = bin(i);
      const q = bin(j);
      const [re, im] = wave(p, q);
      const [backRe, backIm] = wave(-p, -q);
      const at = j * TILE + i;
      waves.set([re, im, backRe, -backIm], at * 4);
      turns[at] = turnsPerHour(Math.hypot(p, q) * step);
    }
  }
  return { waves, turns };
}
