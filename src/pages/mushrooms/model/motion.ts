/**
 * The meadow's motion as pure functions of time in seconds, so the scene can
 * set every frame from the clock and a resize never interrupts a movement.
 */

import type { Seeded } from './random';

/** A thing's own offset into an idle loop, so no two move in step. */
export type Phased = { phase: number };
/** A thing a tap sets moving, and when that tap came, on the scene's clock. */
export type Tapped = Phased & { tappedAt: number };

/** A `Phased` phase read off the seed, so it holds across repaints. */
export function phaseOf({ seed }: Seeded): number {
  return (seed / 2 ** 32) * Math.PI * 2;
}

/** How far a mushroom's height swells and settles as it breathes. */
const BREATH_DEPTH = 0.018;
const BREATH_PERIOD = 3.4;
/**
 * A tap's squash at its deepest, and how fast the bounce dies away: slow
 * enough for two or three bounces a child can see, over about a second.
 */
export const WOBBLE_DEPTH = 0.2;
const WOBBLE_DAMPING = 2.4;
const WOBBLE_FREQUENCY = 1.8;
/** The share of `WOBBLE_DEPTH` below which a bounce is too small to see. */
export const WOBBLE_REST = 0.01;
/** When the bounce has died under `WOBBLE_REST`. */
export const WOBBLE_DURATION = Math.log(1 / WOBBLE_REST) / WOBBLE_DAMPING;
const SWAY_PERIOD = 4.6;
/** A flower's opening past its rest, at the peak of a tap's bloom. */
const BLOOM_DEPTH = 0.45;
export const BLOOM_DURATION = 1.6;
/** How long a mushroom takes to grow out of the ground, and to sink back. */
export const EMERGE_DURATION = 0.75;
export const SINK_DURATION = 0.45;
/** `Back.Out`'s overshoot: how far past its size a growing mushroom reaches. */
const EMERGE_OVERSHOOT = 1.9;

/** The height's stretch (above 0) or squash (below) as a mushroom breathes. */
export function breath(time: number, phase: number): number {
  return (
    BREATH_DEPTH * Math.sin(((Math.PI * 2) / BREATH_PERIOD) * time + phase)
  );
}

/**
 * A tap's squash and stretch `elapsed` seconds after it: a squash first, then
 * a damped bounce back through rest, and 0 once `WOBBLE_DURATION` has passed.
 */
export function wobble(elapsed: number): number {
  if (elapsed < 0 || elapsed >= WOBBLE_DURATION) return 0;
  return (
    -WOBBLE_DEPTH *
    Math.exp(-WOBBLE_DAMPING * elapsed) *
    Math.cos(Math.PI * 2 * WOBBLE_FREQUENCY * elapsed)
  );
}

/** The squash and stretch keep the volume: a taller shape is narrower. */
export function widthFor(stretch: number): number {
  return 1 / Math.sqrt(1 + stretch);
}

/**
 * A lean from -1 to 1 as the breeze comes and goes, two waves summed so no
 * two blades — or flowers — move in step.
 */
export function sway(time: number, phase: number): number {
  const w = (Math.PI * 2) / SWAY_PERIOD;
  return (
    0.7 * Math.sin(w * time + phase) +
    0.3 * Math.sin(w * 2.7 * time + phase * 1.9)
  );
}

/**
 * How much wider than at rest a flower stands open `elapsed` seconds after a
 * tap: out quickly with a little overshoot, back slowly, 0 once
 * `BLOOM_DURATION` has passed.
 */
export function bloom(elapsed: number): number {
  if (elapsed < 0 || elapsed >= BLOOM_DURATION) return 0;
  const t = elapsed / BLOOM_DURATION;
  return BLOOM_DEPTH * Math.sin(Math.PI * t ** 0.45) * (1 - t) ** 0.5 * 1.25;
}

/** Where a drifting thing is after `time`, wrapping round a band `span` wide. */
export function drift(
  start: number,
  speed: number,
  time: number,
  span: number,
): number {
  return (((start + speed * time) % span) + span) % span;
}

/**
 * A growing mushroom's scale `elapsed` seconds after it was planted: from
 * nothing, past its full size, and back to it — 1 once `EMERGE_DURATION` has
 * passed, and before it too, so a mushroom never planted stands still.
 */
export function emerge(elapsed: number): number {
  if (elapsed < 0 || elapsed >= EMERGE_DURATION) return 1;
  const t = elapsed / EMERGE_DURATION - 1;
  return 1 + t * t * ((EMERGE_OVERSHOOT + 1) * t + EMERGE_OVERSHOOT);
}

/**
 * A removed mushroom's scale `elapsed` seconds after its removal: a little
 * lift first, as if pulled, then down into the ground, and 0 from
 * `SINK_DURATION` on.
 */
export function sink(elapsed: number): number {
  if (elapsed < 0) return 1;
  if (elapsed >= SINK_DURATION) return 0;
  const t = elapsed / SINK_DURATION;
  return (1 - t) * (1 + 1.5 * t);
}

/** How long a control that cannot act shakes its head, and how many times. */
export const SHAKE_DURATION = 0.5;
const SHAKE_SWINGS = 2;

/**
 * A head shake `elapsed` seconds after a tap on a control that cannot act,
 * from -1 to 1: side to side `SHAKE_SWINGS` times, each smaller than the
 * last, and 0 outside its span.
 */
export function shake(elapsed: number): number {
  if (elapsed < 0 || elapsed >= SHAKE_DURATION) return 0;
  const t = elapsed / SHAKE_DURATION;
  return Math.sin(Math.PI * 2 * SHAKE_SWINGS * t) * (1 - t);
}

/** How long a picked cap takes to pop and fly down to where its mushroom grows. */
export const LAUNCH_DURATION = 0.55;
/** How far a picked cap swells as it pops, before it shrinks away. */
const LAUNCH_POP = 2.5;

/**
 * A picked cap `elapsed` seconds after the pick: its `scale`, swelling past
 * its size and then shrinking to nothing, and its `travel` from 0 where it
 * stood to 1 where its mushroom grows, slow while it pops and quick as it
 * goes — at rest before the pick, and arrived and gone from
 * `LAUNCH_DURATION` on.
 */
export function launch(elapsed: number): { scale: number; travel: number } {
  if (elapsed < 0) return { scale: 1, travel: 0 };
  if (elapsed >= LAUNCH_DURATION) return { scale: 0, travel: 1 };
  const t = elapsed / LAUNCH_DURATION;
  return { scale: (1 - t) * (1 + LAUNCH_POP * t), travel: t * t };
}
