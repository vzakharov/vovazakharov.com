import { filterOf } from '../../dsp';
import { hum, under } from './hum';
import { heardAt, type Loop } from './loop';
import { type Layer, OPEN_AIR, type OutsideMix, SOUND_LAYERS } from './mix';
import { fizz, hiss, roar, wash } from './surf';
import { buffet, wind } from './wind';

/**
 * Every layer's loop for each ear, left then right. The sea's and the wind's
 * are two takes of one sound, so the outside has width; the hum's are one
 * loop twice, so it has a place.
 */
export type Beds = Record<Layer, readonly [leftEar: Loop, rightEar: Loop]>;

/**
 * The rate each layer is made at: as low as what is in it allows, since the
 * rate is most of what a loop costs to make and to hold.
 */
const RATES: Record<Layer, number> = {
  roar: 16_000,
  hiss: 32_000,
  fizz: 32_000,
  wash: 24_000,
  wind: 24_000,
  buffet: 8000,
  hum: 8000,
  under: 8000,
};

const NOISES = { roar, hiss, fizz, wash, wind, buffet } as const;

const twice = (loop: Loop) => [loop, loop] as const;

/** The outside's loops, unrendered, their noise drawn from `word`'s seeds. */
export function bedsOf(word: (name: string) => number): Beds {
  const pair = (layer: keyof typeof NOISES) =>
    [
      NOISES[layer](word(`${layer}/left`), RATES[layer]),
      NOISES[layer](word(`${layer}/right`), RATES[layer]),
    ] as const;
  return {
    roar: pair('roar'),
    hiss: pair('hiss'),
    fizz: pair('fizz'),
    wash: pair('wash'),
    wind: pair('wind'),
    buffet: pair('buffet'),
    hum: twice(hum(RATES.hum)),
    under: twice(under(RATES.under)),
  };
}

/** The layers a wall dulls; the hum's two go through anything. */
export const MUFFLED: ReadonlySet<Layer> = new Set([
  'roar',
  'hiss',
  'fizz',
  'wash',
  'wind',
  'buffet',
]);

/** Seconds a layer's level takes to close most of the way to a new one. */
export const EASE = 0.06;

/** Times a second the mix is asked for. */
const ASKED = 60;

/**
 * `seconds` of the outside from `from` into the hour, at `rate`, as the left
 * and the right ear hear it: every loop of `beds` (rendered whole) at the
 * level `mixAt` gives it moment by moment, eased as the mixer eases it, the
 * sea and the wind cut off above the mix's `muffle`. The same sum the browser
 * makes, for a script to measure.
 */
export function rendered(
  beds: Beds,
  mixAt: (seconds: number) => OutsideMix,
  from: number,
  seconds: number,
  rate: number,
): [leftEar: Float32Array<ArrayBuffer>, rightEar: Float32Array<ArrayBuffer>] {
  const length = Math.round(seconds * rate);
  const every = Math.max(1, Math.round(rate / ASKED));
  const closing = 1 - Math.exp(-1 / (EASE * rate));
  const ears = [0, 1] as const;
  const out = ears.map(() => new Float32Array(length));
  const dull = ears.map(() => filterOf('low', rate));
  let mix = mixAt(from);
  const sides = ['leftEar', 'rightEar'] as const;
  const levels = ears.map((ear) =>
    SOUND_LAYERS.map((layer) => mix.layers[layer][sides[ear]]),
  );
  let muffle = mix.muffle;
  for (let i = 0; i < length; i += 1) {
    const t = from + i / rate;
    if (i % every === 0) mix = mixAt(t);
    muffle += closing * (mix.muffle - muffle);
    for (const ear of ears) {
      const level = levels[ear] ?? [];
      let open = 0;
      let walled = 0;
      for (const [index, layer] of SOUND_LAYERS.entries()) {
        const now = level[index] ?? 0;
        const next = now + closing * (mix.layers[layer][sides[ear]] - now);
        level[index] = next;
        const sample = next * heardAt(beds[layer][ear], t);
        if (MUFFLED.has(layer)) walled += sample;
        else open += sample;
      }
      const through =
        muffle >= OPEN_AIR ? walled : (dull[ear]?.(walled, muffle, 0.7) ?? 0);
      const samples = out[ear];
      if (samples !== undefined) samples[i] = open + through;
    }
  }
  return [out[0] ?? new Float32Array(0), out[1] ?? new Float32Array(0)];
}
