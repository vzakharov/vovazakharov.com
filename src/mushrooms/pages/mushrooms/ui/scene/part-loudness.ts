/**
 * How loud a voice's parts sound, computed from the parts themselves rather
 * than rendered: each oscillator's harmonics and each hiss's noise band,
 * through their filters as Web Audio defines them, under their envelopes.
 * The measure is an offline render's: the loudest 50 ms, Hann-windowed, of
 * what lies above a frequency. It leaves out the master gain and compressor,
 * which scale every voice alike until a voice is loud enough to be squeezed.
 */

import type { Band, Part, TonePart } from './instrument-voices';
import type { Envelope } from './synth';

/** The sample rate the filters are computed at: a phone's, and most browsers'. */
const RATE = 48_000;
const STEP = 0.001;
const WINDOW = 0.05;
/** How finely a hiss's band is summed, in Hz. */
const BAND_STEP = 10;
/** White noise uniform on [−1, 1] carries this much power. */
const NOISE_POWER = 1 / 3;

/**
 * A triangle's harmonics as Web Audio's normalized wave has them: the odd
 * ones, falling as 1/n², their signs alternating, in phase with a sine at
 * the fundamental.
 */
const TRIANGLE = Array.from({ length: 16 }, (_, index) => {
  const n = 2 * index + 1;
  return { n, amplitude: (-1) ** index * (8 / (Math.PI ** 2 * n ** 2)) };
});
const SINE = [{ n: 1, amplitude: 1 }];

/** A biquad's power gain at `f`, from the Audio EQ Cookbook as Web Audio uses it (a lowpass's Q in dB). */
function biquadPower(
  type: 'lowpass' | 'bandpass',
  { frequency, q }: Band,
  f: number,
): number {
  const w0 = (2 * Math.PI * frequency) / RATE;
  const cos = Math.cos(w0);
  const alpha =
    type === 'lowpass'
      ? Math.sin(w0) / (2 * 10 ** (q / 20))
      : Math.sin(w0) / (2 * q);
  const b =
    type === 'lowpass'
      ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
      : [alpha, 0, -alpha];
  const a = [1 + alpha, -2 * cos, 1 - alpha];
  const w = (2 * Math.PI * f) / RATE;
  const at = ([c0 = 0, c1 = 0, c2 = 0]: readonly number[]) => {
    const re = c0 + c1 * Math.cos(w) + c2 * Math.cos(2 * w);
    const im = -c1 * Math.sin(w) - c2 * Math.sin(2 * w);
    return re ** 2 + im ** 2;
  };
  return at(b) / at(a);
}

/** An envelope's gain `t` seconds in: `envelopeAt`'s ramps, silent once the part stops. */
function gainAt({ peak, attack, lasts }: Envelope, t: number): number {
  if (t < 0 || t > lasts) return 0;
  if (t < attack) return (peak * t) / attack;
  return peak * (0.0001 / peak) ** ((t - attack) / (lasts - attack));
}

/** Where `swell`'s glide through `pitches` stands `t` seconds in. */
function pitchAt({ pitches, lasts }: TonePart, t: number): number {
  const [first = 0] = pitches;
  let from = first;
  for (const [index, to] of pitches.slice(1).entries()) {
    const start = (lasts * index) / pitches.length;
    const end = (lasts * (index + 1)) / pitches.length;
    if (t < end) {
      const along = Math.max(0, (t - start) / (end - start));
      return from * (to / from) ** along;
    }
    from = to;
  }
  return from;
}

/**
 * Adds `part`'s harmonics `t` seconds in above `above` Hz to `into`, by
 * frequency, as signed amplitudes: two tones at one pitch start in phase, so
 * their amplitudes add rather than their powers.
 */
function addTone(
  into: Map<number, number>,
  part: TonePart,
  t: number,
  above: number,
): void {
  const gain = gainAt(part, t);
  if (gain === 0) return;
  const pitch = pitchAt(part, t);
  for (const { n, amplitude } of part.shape === 'triangle' ? TRIANGLE : SINE) {
    const f = n * pitch;
    if (f <= above || f >= RATE / 2) continue;
    const filtered = part.lowpass
      ? Math.sqrt(biquadPower('lowpass', part.lowpass, f))
      : 1;
    into.set(f, (into.get(f) ?? 0) + gain * amplitude * filtered);
  }
}

/** The power of `parts` together `t` seconds in, above `above` Hz, each hiss's band share given by index. */
function powerAt(
  parts: readonly Part[],
  shares: readonly number[],
  t: number,
  above: number,
): number {
  const tones = new Map<number, number>();
  let power = 0;
  for (const [index, part] of parts.entries()) {
    if (part.kind === 'tone') addTone(tones, part, t, above);
    else power += gainAt(part, t) ** 2 * (shares[index] ?? 0);
  }
  for (const amplitude of tones.values()) power += amplitude ** 2 / 2;
  return power;
}

/** The share of white noise's power a bandpass on `band` lets through above `above`. */
function bandShare(band: Band, above: number): number {
  let sum = 0;
  for (let f = above + BAND_STEP / 2; f < RATE / 2; f += BAND_STEP) {
    sum += biquadPower('bandpass', band, f);
  }
  return (sum * BAND_STEP) / (RATE / 2);
}

/**
 * The loudest 50 ms of `parts` played together, in dB of power, counting only
 * what lies above `above` Hz (0 for all of it).
 */
export function loudest(parts: readonly Part[], above = 0): number {
  const shares = parts.map((part) =>
    part.kind === 'hiss' ? NOISE_POWER * bandShare(part, above) : 0,
  );
  const span = Math.max(...parts.map(({ lasts }) => lasts)) + WINDOW;
  const power = Array.from({ length: Math.ceil(span / STEP) }, (_, step) =>
    powerAt(parts, shares, step * STEP, above),
  );
  const width = Math.round(WINDOW / STEP);
  const weights = Array.from(
    { length: width },
    (_, i) => (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (width - 1))) ** 2,
  );
  let total = 0;
  for (const w of weights) total += w;
  let best = 0;
  for (let start = 0; start + width <= power.length; start++) {
    let sum = 0;
    for (const [i, w] of weights.entries()) sum += w * (power[start + i] ?? 0);
    best = Math.max(best, sum / total);
  }
  return 10 * Math.log10(best);
}
