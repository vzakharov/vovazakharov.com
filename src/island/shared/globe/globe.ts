/**
 * The planet's frame. Metres throughout, in float64: the world origin is the
 * planet's centre, `+Y` its axis.
 */

/** Metres above a level its declarer names. */
export type Elevated = { readonly height: number };

/** The planet's mean radius. */
export const R = 6_371_000;
