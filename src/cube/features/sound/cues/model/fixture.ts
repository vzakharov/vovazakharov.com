import type { Underfoot } from '@/cube/shared/lib/acoustics';

import {
  chance,
  CYCLE,
  dying,
  filterOf,
  noiseOf,
  ringing,
  sampled,
  type Struck,
  swell,
} from '../../dsp';
import { footstep, stepSeconds } from './footstep';

/** Seconds the lever's handle creaks before it stops: its swing. */
const LEVER_SWING = 0.25;

/** The lever's stop: a steel arm against its housing. */
const CLANK: readonly Struck[] = [
  { hz: 95, dies: 0.07, force: 0.6 },
  { hz: 380, dies: 0.25, force: 0.4 },
  { hz: 915, dies: 0.2, force: 0.3 },
  { hz: 1570, dies: 0.15, force: 0.2 },
  { hz: 2440, dies: 0.1, force: 0.12 },
];

/** The lever pulled: the handle's creak down, then the clank of its stop. */
export function lever(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.05 * noise();
  const hinge = filterOf('band', rate);
  let phase = 0;
  return sampled(LEVER_SWING + 0.4, rate, (t) => {
    const x = t / LEVER_SWING;
    phase += (240 - 70 * Math.min(1, x)) / rate;
    const creak = hinge(2 * (phase % 1) - 1, 900 * tune, 3) * swell(x);
    const struck = t - LEVER_SWING;
    const clank = CLANK.reduce(
      (sum, partial) => sum + ringing(partial, struck, tune),
      0,
    );
    return 0.5 * creak + clank + 0.4 * noise() * dying(struck, 0.005);
  });
}

/** A pill's shell: small, hard and hollow. */
const CAPSULE: readonly Struck[] = [
  { hz: 2350, dies: 0.03, force: 0.5 },
  { hz: 3900, dies: 0.022, force: 0.35 },
  { hz: 6100, dies: 0.015, force: 0.2 },
];

/** Seconds from the fingers' touch to the pill leaving the shelf. */
const PILL_LIFTS = 0.07;

/**
 * A pill picked up off its shelf: the fingertips' touch, its shell ticking
 * against the board as it tips, and the tick of it coming away.
 */
export function pill(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.08 * noise();
  const lifts = PILL_LIFTS * (1 + 0.2 * noise());
  const skin = filterOf('band', rate);
  const board = filterOf('band', rate);
  const struck = (t: number, force: number): number =>
    force *
    (CAPSULE.reduce((sum, partial) => sum + ringing(partial, t, tune), 0) +
      0.5 * noise() * dying(t, 0.003));
  return sampled(lifts + 0.12, rate, (t) => {
    const touch = 0.6 * skin(noise(), 3400, 0.8) * swell(t / lifts);
    const shelf = 0.5 * board(noise() * dying(t, 0.004), 420 * tune, 5);
    return touch + shelf + struck(t, 0.6) + struck(t - lifts, 1);
  });
}

/**
 * The shrink itself, `seconds` long: two voices a tritone apart sliding up an
 * octave as the body gets smaller, shuddering faster and faster, over a low
 * weight and a hiss that climbs with them. It swells from nothing and goes
 * back to it.
 */
export function shrinking(
  seconds: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const root = 98 * (1 + 0.04 * noise());
  const hiss = filterOf('band', rate);
  const phases = [0, 0, 0];
  const turned = (voice: number, hz: number): number => {
    const phase = (phases[voice] ?? 0) + hz / rate;
    phases[voice] = phase;
    return Math.sin(CYCLE * phase);
  };
  return sampled(seconds, rate, (t) => {
    const x = t / seconds;
    const hz = root * 2 ** x;
    const shudder = 0.6 + 0.4 * turned(2, 4 + 12 * x * x);
    const voices = turned(0, hz) + 0.8 * turned(1, hz * Math.SQRT2 * 1.01);
    const climbing = hiss(noise(), 400 * 8 ** x, 4) * x;
    const weight = Math.sin(CYCLE * 41 * t);
    return (
      swell(x) ** 0.6 * (0.3 * shudder * voices + 0.9 * climbing + 0.3 * weight)
    );
  });
}

/** A phone's two bursts: seconds each rings, and from the first to the second. */
const BURST = 0.45;
const BURST_EVERY = 0.65;

/** A phone ringing twice somewhere: two tones beating under a bell's warble. */
export function ring(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const tune = 1 + 0.06 * noiseOf(seed)();
  return sampled(BURST_EVERY + BURST + 0.15, rate, (t) => {
    const within = t % BURST_EVERY;
    const sounding =
      t < BURST_EVERY + BURST
        ? Math.min(1, within / 0.005, Math.max(0, (BURST - within) / 0.02))
        : 0;
    const tones =
      Math.sin(CYCLE * 440 * tune * t) +
      Math.sin(CYCLE * 480 * tune * t) +
      0.4 * Math.sin(CYCLE * 1760 * tune * t);
    return 0.3 * sounding * (0.6 + 0.4 * Math.sin(CYCLE * 20 * t)) * tones;
  });
}

/** A knuckle on a door: the panel's two notes. */
const RAP: readonly Struck[] = [
  { hz: 190, dies: 0.06, force: 0.7 },
  { hz: 420, dies: 0.035, force: 0.35 },
];

/** Seconds from one rap to the next, before each is rolled a little off. */
const RAP_EVERY = 0.17;

/** Somebody knocking: two to four raps, not quite even. */
export function knock(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.1 * noise();
  const raps = Array.from(
    { length: 2 + Math.floor(3 * chance(noise)) },
    (_, index) => index * RAP_EVERY + 0.02 * noise() + 0.02,
  );
  return sampled(raps.length * RAP_EVERY + 0.15, rate, (t) =>
    raps.reduce(
      (sum, at) =>
        sum +
        RAP.reduce((rap, partial) => rap + ringing(partial, t - at, tune), 0) +
        0.3 * noise() * dying(t - at, 0.004),
      0,
    ),
  );
}

/** Something heavy coming down a room or two away. */
export function thud(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const hz = 52 * (1 + 0.15 * noise());
  const dull = filterOf('low', rate);
  let phase = 0;
  return sampled(0.7, rate, (t) => {
    // The pitch sags as the blow spreads into the floor.
    phase += (hz * (0.6 + 0.4 * dying(t, 0.2))) / rate;
    const boom = Math.sin(CYCLE * phase) * dying(t, 0.4);
    return 0.9 * boom + 1.5 * dull(noise(), 220, 0.7) * dying(t, 0.12);
  });
}

/** How many steps are heard going away, and the seconds between two. */
const STEPS_AWAY = 6;
const STEP_EVERY = 0.52;

/**
 * Somebody's steps on `footing` going away: each quieter and duller than the
 * one before, their rhythm a person's rather than a clock's.
 */
export function stepsAway(
  footing: Underfoot,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const steps = Array.from({ length: STEPS_AWAY }, (_, index) => ({
    at: Math.round((index * STEP_EVERY + 0.03 * noise() + 0.03) * rate),
    samples: footstep(footing, 0.6 - 0.08 * index, seed + 1 + index, rate),
  }));
  const dull = filterOf('low', rate);
  const seconds = STEPS_AWAY * STEP_EVERY + stepSeconds(footing);
  return sampled(seconds, rate, (t, i) => {
    const gone = t / seconds;
    const stepped = steps.reduce(
      (sum, { at, samples }) => sum + (samples[i - at] ?? 0),
      0,
    );
    return 2 * (1 - 0.8 * gone) * dull(stepped, 6000 * 0.12 ** gone, 0.7);
  });
}
