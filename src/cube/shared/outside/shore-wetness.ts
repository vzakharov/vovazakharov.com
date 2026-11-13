import { smoothstep } from '../lib/ease';
import { DRIES, FILM, NEVER_WET, WAVES_BACK } from './shore-wetness-numbers';
import { crestOf, SEA_GRAVITY, turnsAt } from './swell';
import { SLOPE, swashReach } from './water-level';

/**
 * How long the sand has been out of the water: the swash's sheets are closed
 * forms of the clock, so when the last one left a point is solved for, and no
 * frame has to remember that it was wet. Scalar closed forms, each written
 * twice; `shore-wetness.test.ts` runs the WGSL against the TypeScript.
 */

/**
 * Seconds since a swash sheet last lay on sand `bed` metres over the still
 * sea, at a point whose own time is `tau` and whose shore keeps `shelter` of
 * a wave: 0 while one lies there, `NEVER_WET` where none of the last waves
 * reached.
 */
export function drySince(tau: number, bed: number, shelter: number): number {
  if (bed <= 0) return 0;
  const n = Math.floor(turnsAt(tau));
  let dry = NEVER_WET;
  for (let back = 0; back < WAVES_BACK; back += 1) {
    const landed = crestOf(n - back);
    const since = tau - landed;
    const reach = swashReach(landed, shelter);
    // The sheet's tip passes the point going up and again coming down.
    const span = 2 * SEA_GRAVITY * (reach - bed);
    if (span > 0) {
      const launch = Math.sqrt(2 * SEA_GRAVITY * reach);
      const comes = (launch - Math.sqrt(span)) / (SEA_GRAVITY * SLOPE);
      const leaves = (launch + Math.sqrt(span)) / (SEA_GRAVITY * SLOPE);
      if (since >= comes) dry = Math.min(dry, Math.max(since - leaves, 0));
    }
  }
  return dry;
}

/** How damp sand is `dry` seconds after the water left it, 1 soaked. */
export const dampAfter = (dry: number): number => Math.exp(-dry / DRIES);

/** How much of a film of water still stands on it, 1 a mirror. */
export const filmAfter = (dry: number): number =>
  1 - smoothstep(FILM[0], FILM[1], dry);
