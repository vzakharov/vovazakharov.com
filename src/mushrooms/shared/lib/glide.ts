/**
 * A fling: what a finger's lift leaves moving, along whichever axis it moved
 * — the crop's px or the eye's ground. The finger's velocity is blended from
 * its latest samples; a finger that rested before its lift flings nothing.
 * The glide sets off at that velocity and decays exponentially, carrying on
 * by it times `GLIDE_TAU` in all, and rests after `GLIDE_OVER`.
 */

/** A glide's time constant, in seconds, and how many of them it lasts. */
export const GLIDE_TAU = 0.325;
const GLIDE_SPANS = 6;
/** How long a glide lasts, in seconds; nine tenths of its way are behind it by 0.4 of that. */
export const GLIDE_OVER = GLIDE_TAU * GLIDE_SPANS;

/**
 * How long a finger's velocity is averaged over, in seconds, and how long it
 * may rest before its release, which then glides no farther.
 */
const VELOCITY_WINDOW = 0.05;
const STILL_AFTER = 0.1;

/** When a finger was last sampled, on the scene's clock, in seconds. */
export type Sampled = { sampledAt: number };

/** A finger's blended velocity as of its latest sample, in its axis's units a second; none before the first. */
export type Flinging = { velocity: number | undefined };

const WHOLE = 1 - Math.exp(-GLIDE_SPANS);

function clampShare(u: number): number {
  return Math.min(1, Math.max(0, u));
}

/** How far along its way a glide is `u` of its time in, from 0 to 1. */
export function glided(u: number): number {
  return (1 - Math.exp(-GLIDE_SPANS * clampShare(u))) / WHOLE;
}

/** How fast a glide `u` of its time in moves, as a share of its whole way a second: none once over. */
export function glidePace(u: number): number {
  if (u >= 1) return 0;
  return (
    (GLIDE_SPANS * Math.exp(-GLIDE_SPANS * clampShare(u))) / WHOLE / GLIDE_OVER
  );
}

/**
 * A finger's velocity, as it `was`, with a step of `across` units over `span`
 * seconds: the first step sets it, and each later one blends in by its share
 * of `VELOCITY_WINDOW`.
 */
export function blended(
  was: number | undefined,
  across: number,
  span: number,
): number | undefined {
  if (span <= 0) return was;
  const now = across / span;
  if (was === undefined) return now;
  return was + (now - was) * Math.min(1, span / VELOCITY_WINDOW);
}

/**
 * The velocity a finger lifted at `time` flings with: its blended `velocity`
 * as of its latest sample at `sampledAt`, or none when it rested since.
 */
export function flung(
  velocity: number | undefined,
  sampledAt: number,
  time: number,
): number {
  return time - sampledAt > STILL_AFTER ? 0 : (velocity ?? 0);
}
