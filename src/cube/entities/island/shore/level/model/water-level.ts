import type { Vec2 } from '@/scene/shared/lib/vec2';

import {
  sheltered,
  SHORE_FACING_REACH,
  shoreDelay,
  shoreDepth,
  shoreFacing,
  swellLevel,
} from '@/nature/shared/shore';
import { DEEP_SPEED, SWELL_RUNS } from '@/nature/shared/swell';

import { islandHeight } from '../../../land';
import { cuspAt } from '../../../sea';

/**
 * The island's shore: nature's shore level, read where the island's own bed
 * and the way its shore faces put it.
 */

/** The bed's rise per metre at `xz`, along x and z, read `FACING_REACH` either side. */
const bedRise = ([x, z]: Vec2): Vec2 => [
  (islandHeight([x + SHORE_FACING_REACH, z]) -
    islandHeight([x - SHORE_FACING_REACH, z])) /
    (2 * SHORE_FACING_REACH),
  (islandHeight([x, z + SHORE_FACING_REACH]) -
    islandHeight([x, z - SHORE_FACING_REACH])) /
    (2 * SHORE_FACING_REACH),
];

/** The swell as one point of the shore meets it. */
export type ShoreClock = {
  /** The sand there, metres over the still sea. */
  bed: number;
  /**
   * The point's own time: the clock less how long the swell takes to reach
   * it. `turnsAt(tau)` counts the crests that have passed the point, and
   * `crestOf(n)` is the `tau` at which crest `n` does.
   */
  tau: number;
  /** How squarely its shore faces the swell, −1 to 1, and what that keeps of a wave. */
  towardSwell: number;
  shelter: number;
  /** What its place along the crest keeps of a wave's swash, about 1. */
  tongue: number;
};

/** The swell's timing at `xz` in the world frame, `seconds` into the hour. */
export function shoreClock(xz: Vec2, seconds: number): ShoreClock {
  const bed = islandHeight(xz);
  const [dx, dz] = bedRise(xz);
  const facing = shoreFacing(
    dx * SWELL_RUNS[0] + dz * SWELL_RUNS[1],
    Math.hypot(dx, dz),
    bed,
  );
  const run = xz[0] * SWELL_RUNS[0] + xz[1] * SWELL_RUNS[1];
  return {
    bed,
    tau: seconds - run / DEEP_SPEED - shoreDelay(shoreDepth(bed)),
    towardSwell: facing,
    shelter: sheltered(facing),
    tongue: cuspAt(xz),
  };
}

/**
 * The sea's slow surface at `xz` in the world frame, `seconds` into the hour:
 * metres over the still sea, with the swell, its surf and the swash and no
 * wind wave. Where it is over `islandHeight` the sand is under water at that
 * instant.
 */
export const waterLevel = (xz: Vec2, seconds: number): number =>
  waterLevelAt(xz)(seconds);

/**
 * `waterLevel` at one point, as a function of the moment alone: what the
 * point's bed settles is read once, so a caller that follows a fixed point
 * through time pays for the island's height only on the first call.
 */
export function waterLevelAt(xz: Vec2): (seconds: number) => number {
  const { bed, shelter, tongue } = shoreClock(xz, 0);
  const run = xz[0] * SWELL_RUNS[0] + xz[1] * SWELL_RUNS[1];
  return (seconds) => swellLevel(run, bed, shelter, tongue, seconds);
}
