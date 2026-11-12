import { rise } from './ease';

/** Seconds a swallowed pill's shrink takes. */
export const SHRINK_TIME = 2;

/** A shrunk body's scale: a person of the floor below. */
export const SMALL = 0.5;

/** The body's scale `t` seconds into the shrink, easing from 1 to `SMALL`. */
export const scaleAt = (t: number): number => 2 ** -rise(t, 0, SHRINK_TIME);
