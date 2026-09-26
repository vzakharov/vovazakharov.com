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

/**
 * When a thing was last selected and let go of, on the scene's clock:
 * `unlitAt` is `Infinity` while it stays selected, and both are `-Infinity`
 * for a thing never selected.
 */
export type Lit = { litAt: number; unlitAt: number };

/** A selected mushroom's stretch at its tallest, and how long one swell takes. */
export const BECKON_DEPTH = 0.06;
const BECKON_PERIOD = 1.3;
/** How long the beckon takes to come on at a selection, and to die at a release. */
export const BECKON_EASE = 0.3;

const eased = (elapsed: number) =>
  Math.min(1, Math.max(0, elapsed / BECKON_EASE));

/**
 * The stretch a selected mushroom beckons with at `time`, over its breath: a
 * slow swell taller and back that starts from rest at the selection, eases in
 * over `BECKON_EASE`, and eases out over as long at the release, so neither
 * end is a jump.
 */
export function beckon(time: number, { litAt, unlitAt }: Lit): number {
  const reach = Math.min(eased(time - litAt), 1 - eased(time - unlitAt));
  if (reach <= 0) return 0;
  return (
    BECKON_DEPTH *
    reach *
    Math.sin(((Math.PI * 2) / BECKON_PERIOD) * (time - litAt))
  );
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
 * stood to 1 where its mushroom grows, slow while it pops and quick as it goes.
 */
export function launch(elapsed: number): { scale: number; travel: number } {
  if (elapsed < 0) return { scale: 1, travel: 0 };
  if (elapsed >= LAUNCH_DURATION) return { scale: 0, travel: 1 };
  const t = elapsed / LAUNCH_DURATION;
  return { scale: (1 - t) * (1 + LAUNCH_POP * t), travel: t * t };
}

/** Smoothstep: 0 to 1 over `t` from 0 to 1, starting and ending at rest. */
const smooth = (t: number) => {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
};

/** How long a mouse takes to come out of its door, and to duck back in. */
const PEEK_RISE = 0.35;
const PEEK_DUCK = 0.3;
/** How long a mouse looks about on its own, and when a tap has called it out. */
const PEEK_HOLD = 1.6;
const TAP_PEEK_HOLD = 1.4;
/** A tap brings the mouse out quicker than it comes on its own. */
const TAP_PEEK_RISE = 0.18;
/** The shortest and longest wait from one peek to the next, one per mushroom. */
export const PEEK_PERIOD = [6, 12] as const;
export const TAP_PEEK_DURATION = TAP_PEEK_RISE + TAP_PEEK_HOLD + PEEK_DUCK;
const LOOK_PERIOD = 1.7;

/**
 * Out and back once, `elapsed` into it: 0 before, up over `rise`, 1 for
 * `hold`, down over `duck`, and 0 after.
 */
function outAndBack(
  elapsed: number,
  rise: number,
  hold: number,
  duck: number,
): number {
  return smooth(elapsed / rise) * (1 - smooth((elapsed - rise - hold) / duck));
}

/**
 * How far a mouse is out of its door at `time`, from 0 (the door shut) to 1
 * (the door open, its head out): now and then on its own, every period from
 * `PEEK_PERIOD` as `phase` picks it, looking about for a while and ducking
 * back, and 0 the rest of the time.
 */
export function peek(time: number, phase: number): number {
  const turn = phase / (Math.PI * 2);
  const period = PEEK_PERIOD[0] + (PEEK_PERIOD[1] - PEEK_PERIOD[0]) * turn;
  const into = (((time + turn * period) % period) + period) % period;
  return outAndBack(into, PEEK_RISE, PEEK_HOLD, PEEK_DUCK);
}

/**
 * The mouse called out by a tap on its door `elapsed` seconds before: out at
 * once, a look about, and back in — 0 outside `TAP_PEEK_DURATION`.
 */
export function peekAfterTap(elapsed: number): number {
  if (elapsed < 0 || elapsed >= TAP_PEEK_DURATION) return 0;
  return outAndBack(elapsed, TAP_PEEK_RISE, TAP_PEEK_HOLD, PEEK_DUCK);
}

/**
 * How far out a door's mouse is at `time`, on its own or called out by the
 * last tap on its door, whichever has it farther out — so a tap during a peek
 * never pulls it back.
 */
export function mouseOut(time: number, { phase, tappedAt }: Tapped): number {
  return Math.max(peek(time, phase), peekAfterTap(time - tappedAt));
}

/** The mouse's head turn as it looks about, from -1 (left) to 1 (right). */
export function lookAbout(time: number, phase: number): number {
  return Math.sin(((Math.PI * 2) / LOOK_PERIOD) * time + phase * 3);
}

/** How often a mouse blinks, and how long its eyes stay shut. */
const BLINK_PERIOD = 2.8;
export const BLINK_SHUT = 0.14;

/** Whether a mouse's eyes are shut at `time`: briefly, once a period, `phase` setting when. */
export function blink(time: number, phase: number): boolean {
  const offset = (phase / (Math.PI * 2)) * BLINK_PERIOD;
  const into =
    (((time + offset) % BLINK_PERIOD) + BLINK_PERIOD) % BLINK_PERIOD;
  return into < BLINK_SHUT;
}
