import type { Underfoot } from '@/cube/shared/lib/acoustics';
import { clamp01 } from '@/cube/shared/lib/ease';

import {
  CYCLE,
  dying,
  filterOf,
  noiseOf,
  ringing,
  sampled,
  swell,
} from '../../dsp';
import { footstep, stepSeconds } from './footstep';

/**
 * One breath, in and then out, as noise through the mouth's band. `effort`
 * runs from 0 (at rest: slow, barely there) to 1 (winded: quick, loud, the
 * mouth open).
 */
export function breath(
  effort: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const hard = clamp01(effort);
  const noise = noiseOf(seed);
  const seconds = (2.6 - 1.4 * hard) * (1 + 0.08 * noise());
  const level = 0.12 + 0.5 * hard;
  const mouth = filterOf('band', rate);
  return sampled(seconds, rate, (t) => {
    const x = t / seconds;
    // In over the first 42%, a held moment, out over the rest.
    const drawn = swell(x / 0.42);
    const released = swell((x - 0.48) / 0.52);
    const hz = drawn > 0 ? 2300 - 500 * hard : 1400 - 400 * hard;
    return level * (0.7 * drawn + released) * 3 * mouth(noise(), hz, 1.1);
  });
}

/** The throat's two resonances for an "uh". */
const THROAT = [620, 1080] as const;

/** A grunt of effort: a short voiced push, falling, with breath on it. */
export function grunt(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const pitch = 105 * (1 + 0.12 * noise());
  const seconds = 0.26 * (1 + 0.15 * noise());
  const formants = THROAT.map(() => filterOf('band', rate));
  let phase = 0;
  return sampled(seconds, rate, (t) => {
    const x = t / seconds;
    phase += (pitch * (1 - 0.3 * x)) / rate;
    // A glottal pulse: a sawtooth with breath through it.
    const source = 2 * (phase % 1) - 1 + 0.3 * noise();
    const voiced = formants.reduce(
      (sum, formant, index) => sum + formant(source, THROAT[index] ?? 0, 5),
      0,
    );
    return 1.6 * swell(0.08 + 0.92 * x) ** 0.6 * voiced;
  });
}

/**
 * A swallow, heard from inside the head: the tongue's click against the
 * palate, the gulp — a closed throat's pitch dropping as it opens and
 * climbing as it shuts — and the breath let go after it.
 */
export function swallow(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.1 * noise();
  const gulpAt = 0.09 + 0.02 * noise();
  const gulpFor = 0.17;
  const palate = filterOf('band', rate);
  const throat = filterOf('band', rate);
  const mouth = filterOf('band', rate);
  let phase = 0;
  return sampled(0.62, rate, (t) => {
    const click = 1.5 * palate(noise(), 2100 * tune, 4) * dying(t, 0.012);
    const x = (t - gulpAt) / gulpFor;
    // Down as the throat opens, up as it closes: the "g-lk".
    const hz = tune * (230 + 520 * (2 * x - 1) ** 2 + 260 * x);
    phase += hz / rate;
    const gulp =
      swell(x) ** 0.7 *
      (0.9 * Math.sin(CYCLE * phase) + throat(noise(), hz * 2.2, 6));
    const after = 0.5 * mouth(noise(), 1500, 1) * swell((t - 0.34) / 0.28);
    return click + gulp + after;
  });
}

/** A jump leaving the floor: a quick push of breath and the clothes' swish. */
export function jump(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const seconds = 0.22;
  const mouth = filterOf('band', rate);
  const cloth = filterOf('band', rate);
  return sampled(seconds, rate, (t) => {
    const x = t / seconds;
    const puff = mouth(noise(), 1700 - 800 * x, 1.4) * swell(x / 0.6);
    const swish = cloth(noise(), 500 + 900 * x, 0.8) * swell(x);
    return 1.2 * puff + 0.8 * swish;
  });
}

/** Seconds between a landing's two feet. */
const FEET_APART = 0.028;

/** A landing speed, in room sides a second, that is as hard as a step gets. */
const HARD_LANDING = 1;

/** The body's own weight arriving. */
const WEIGHT = { hz: 48, dies: 0.18, force: 0.9 };

/**
 * Landing on `footing` at `speed` room sides a second: both feet a moment
 * apart, the body's weight under them, and the breath knocked out by a hard
 * one.
 */
export function landing(
  speed: number,
  footing: Underfoot,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const strength = clamp01(speed / HARD_LANDING);
  const feet = [
    footstep(footing, strength, seed, rate),
    footstep(footing, 0.85 * strength, seed + 1, rate),
  ];
  const noise = noiseOf(seed + 2);
  const mouth = filterOf('band', rate);
  const apart = Math.round(FEET_APART * rate);
  const seconds = Math.max(stepSeconds(footing) + FEET_APART, 0.3);
  return sampled(seconds, rate, (t, i) => {
    const stepped = feet.reduce(
      (sum, foot, index) => sum + (foot[i - index * apart] ?? 0),
      0,
    );
    const puff =
      strength * strength * mouth(noise(), 1200, 1) * swell((t - 0.03) / 0.22);
    return stepped + strength * ringing(WEIGHT, t) + puff;
  });
}
