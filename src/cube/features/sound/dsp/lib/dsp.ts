import type { Timed } from '@/kernel/shared/typings';

import { hashOf, unitOf } from '@/cube/shared/lib/hash32';

export const CYCLE = 2 * Math.PI;

/** A draw in `[-1, 1)`; the same seed gives the same run of them. */
type Noise = () => number;

/**
 * White noise from `seed`, a word rolled from a named path: sample `n` is the
 * kit's integer hash of `(seed, n)`, the sound's counterpart of a pixel's
 * grain, so no generator of its own sits behind it.
 */
export function noiseOf(seed: number): Noise {
  let n = 0;
  return () => {
    n += 1;
    return 2 * unitOf(hashOf(seed, n)) - 1;
  };
}

/** The next draw of `noise`, moved to `[0, 1)`. */
export const chance = (noise: Noise): number => (noise() + 1) / 2;

/** One sample through the filter, tuned to `hz` with resonance `q`. */
type Filter = (sample: number, hz: number, q: number) => number;

/**
 * A two-pole filter at `rate` (a state-variable one, stable while its tuning
 * moves every sample); a band's force is 1 whatever its `q`.
 */
export function filterOf(pass: 'low' | 'band' | 'high', rate: number): Filter {
  let ic1 = 0;
  let ic2 = 0;
  let tuned = -1;
  let g = 0;
  return (sample, hz, q) => {
    if (hz !== tuned) {
      tuned = hz;
      g = Math.tan((Math.PI * Math.min(hz, rate * 0.45)) / rate);
    }
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const v3 = sample - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + g * a2 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    if (pass === 'low') return v2;
    return pass === 'band' ? k * v1 : sample - k * v1 - v2;
  };
}

/** A level dying from 1 at `t = 0` to a thousandth (−60 dB) at `t = dies`. */
export const dying = (t: number, dies: number): number =>
  t < 0 ? 0 : Math.exp((-6.9 * t) / dies);

/** A rise and fall, 0 outside `x` in `[0, 1]` and 1 at the middle. */
export const swell = (x: number): number =>
  x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2;

/** How many samples `seconds` are at `rate`, at least one. */
export const samplesIn = (seconds: number, rate: number): number =>
  Math.max(1, Math.round(seconds * rate));

/** Seconds a sound takes to fade at its end. */
const FADE = 0.004;

/**
 * `seconds` of sound at `rate`: sample `i` is `at(i / rate, i)`, asked in
 * order so `at` may keep state, squeezed to stay inside ±1 and faded over its
 * last few milliseconds, so it ends at nothing and never clicks.
 */
export function sampled(
  seconds: number,
  rate: number,
  at: (t: number, i: number) => number,
): Float32Array<ArrayBuffer> {
  const length = samplesIn(seconds, rate);
  const fade = Math.max(1, Math.min(length, Math.round(FADE * rate)));
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    samples[i] =
      Math.tanh(at(i / rate, i)) * Math.min(1, (length - 1 - i) / fade);
  }
  return samples;
}

/** One partial of something struck: its pitch, how long it rings, how loud. */
export type Struck = { hz: number; dies: number; force: number };

/** Something that rings when struck, in each of its `modes`. */
export type Resonant = { modes: readonly Struck[] };

/** A blow's whole answer: what rings, and for how long it is heard. */
export type Sounding = Timed & Resonant;

/** A struck partial `t` seconds after the blow, `tune` times its pitch. */
export const ringing = ({ hz, dies, force }: Struck, t: number, tune = 1) =>
  t < 0 ? 0 : force * Math.sin(CYCLE * hz * tune * t) * dying(t, dies);
