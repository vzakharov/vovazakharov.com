import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { RADIANS_A_TURN, SEA_WORLD } from '@/cube/entities/island';

import { K_CEILING, type Sea, spectrumOf, turnsPerHour } from './spectrum';

/**
 * One band of the sea's waves, synthesised as a square tile that repeats
 * every `side` metres. Tiles of very different sides laid over one another
 * give waves from the swell down to ripples without one enormous transform.
 */
export type Cascade = {
  /** Metres the tile spans before it repeats. */
  tileSide: number;
  /** The band's wavenumbers, rad/m: `kFrom` inclusive, `kTo` exclusive. */
  kFrom: number;
  kTo: number;
};

/** The world the island's sea is rolled in. */

/** How far a wave's crest leans forward of a pure sine: Tessendorf's chop. */
export const CHOP = 0.92;

/** Texels along a tile's side; a power of two, for the transform. */
export const TILE = 256;

/**
 * The bands, longest first. Each hands over to the next where its own texels
 * stop resolving a wave, a little under its Nyquist wavenumber.
 */
export const CASCADES: readonly Cascade[] = [
  { tileSide: 3200, kFrom: 0, kTo: 0.157 },
  { tileSide: 200, kFrom: 0.157, kTo: 2.5 },
  { tileSide: 25, kFrom: 2.5, kTo: 20 },
  { tileSide: 3.2, kFrom: 20, kTo: 160 },
];

/** The finest wave any cascade carries; shorter ones are only roughness. */
export const FINEST = CASCADES.at(-1)?.kTo ?? K_CEILING;

/** What the wave field's first pass reads, one entry per texel of the tile. */
export type Amplitudes = {
  /**
   * Four floats a texel: the complex amplitude of the wave travelling toward
   * the texel's wavevector, then the conjugate of the one travelling the
   * opposite way — the pair a real surface needs at every moment.
   */
  waves: Float32Array<ArrayBuffer>;
  /** Whole turns per hour of the texel's wave. */
  turns: Uint32Array<ArrayBuffer>;
};

const hash = pathHash(SEA_WORLD);

/**
 * Every wave's draw: the two parts of its complex height, each a unit normal,
 * under `island/sea/waves/<cascade>/<p>/<q>` — a path of the wave's own
 * indices, so every viewer draws the same sea.
 */
const draws = rollWith(
  roll.over(
    roll.key({ cascade: roll.int, p: roll.int, q: roll.int }),
    roll.struct({ re: roll.normal(), im: roll.normal() }),
  ),
  (path) => hash(`island/sea/waves/${path}`),
);

/** The signed frequency index of texel `i` along a side, FFT order. */
export const bin = (i: number): number => (i < TILE / 2 ? i : i - TILE);

/**
 * The amplitudes of cascade `index` of `seas`: every wave of the band with a
 * rolled phase and a height rolled about what the spectrum says.
 */
export function amplitudesOf(seas: readonly Sea[], index: number): Amplitudes {
  const cascade = CASCADES[index];
  if (cascade === undefined) throw new Error(`No cascade ${String(index)}`);
  const spectrum = spectrumOf(seas);
  const step = RADIANS_A_TURN / cascade.tileSide;
  /** The complex amplitude of the wave at bins (`p`, `q`), or zero outside the band. */
  const wave = (p: number, q: number): [number, number] => {
    const kx = p * step;
    const kz = q * step;
    const k = Math.hypot(kx, kz);
    if (k < cascade.kFrom || k >= cascade.kTo || k === 0) return [0, 0];
    const height = Math.sqrt((spectrum.at(kx, kz) * step * step) / 2);
    const { re, im } = draws.at({ cascade: index, p, q });
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
