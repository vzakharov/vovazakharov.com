import { ramp } from './ease';

/** Seconds a pulled lever's shrink takes. */
export const SHRINK_TIME = 2;

/** A shrunk body's scale: a person of the floor below. */
export const SMALL = 0.5;

/** The body's scale `t` seconds after the pull, easing from 1 to `SMALL`. */
export const scaleAt = (t: number): number => 2 ** -ramp(t, 0, SHRINK_TIME);

/**
 * How far from the body's middle the lever can be pulled, in room sides: 2.4
 * m on floor 1, so a body standing anywhere about the hole reaches its lever.
 */
export const LEVER_REACH = 0.48;

/** Seconds the lever's handle takes to swing down once pulled. */
export const PULL_SWING = 0.25;

/** How far the handle has swung `t` seconds after the pull, from 0 to 1. */
export const swungAt = (t: number): number => ramp(t, 0, PULL_SWING);
