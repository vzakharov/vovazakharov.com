/**
 * The meadow's motion as pure functions of time in seconds, so the scene can
 * set every frame from the clock and a resize never interrupts a movement.
 */

/** A thing's own offset into an idle loop, so no two move in step. */
export type Phased = { phase: number };

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
