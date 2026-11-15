import { lerp as mix, smoothstep } from '@/cube/shared/lib/ease';
import type { Vec2 } from '@/cube/shared/lib/vec';

import { islandHeight } from '../../../land';
import {
  bore,
  crestOf,
  cuspAt,
  DEEP_SPEED,
  peaked,
  SEA_GRAVITY,
  setsAt,
  SWELL_HEIGHT,
  SWELL_RUNS,
  turnsAt,
} from '../../../sea';
import {
  BEACH_SLOPE,
  BREAKS,
  DRY_UNDER,
  RUNUP_SHARE,
  SHEET_GATHERS,
  SHEET_REACHES,
  SHEET_SINKS,
  SHEET_SINKS_UNDER,
  SHEET_THICK,
  SHOALS_FROM,
  SHORE_FACING_REACH,
  SHORE_LAG,
  SHORE_LEE,
  SHORE_ROUND,
  SHORE_SHALLOWEST,
  SURF_SHARE,
  SWELL_FEELS,
} from './water-level-numbers';

/**
 * The shore: what the swell's train of waves does where the water shallows.
 * A wave reaches a point late by how long shallow water held it up, so its
 * crest bends to the beach; it steepens, breaks where it stands taller than
 * the depth allows, runs in as a bore, and is thrown up the sand as a thin
 * sheet that slows, stops and drains (Shen & Meyer 1963). Scalar closed
 * forms, each written twice; `swell.test.ts` runs water-level.wgsl against
 * the TypeScript.
 */

/** The greater of two levels, rounded where they cross. */
const over = (a: number, b: number): number =>
  0.5 * (a + b + Math.sqrt((a - b) * (a - b) + SHORE_ROUND * SHORE_ROUND));

/** The depth a wave is timed over where the bed stands at `bed`. */
export const shoreDepth = (bed: number): number =>
  Math.max(-bed, 0) + SHORE_SHALLOWEST;

/** Seconds water `depth` deep has held a wave back since deep water. */
export function shoreDelay(depth: number): number {
  const q = Math.sqrt(Math.min(depth / SWELL_FEELS, 1));
  return SHORE_LAG * (1 - q) * (1 - q);
}

/** How fast that delay grows as the water shallows, seconds per metre. */
export function shoreSlowing(depth: number): number {
  const q = Math.sqrt(Math.min(depth / SWELL_FEELS, 1));
  return (SHORE_LAG * (1 - q)) / Math.sqrt(depth * SWELL_FEELS);
}

/**
 * How squarely the waves at a point still run with the open swell: 1 on the
 * beach that faces it, −1 in the island's lee. `along` is the bed's rise per
 * metre along the swell's heading, `steep` its rise per metre uphill.
 */
export function shoreFacing(along: number, steep: number, bed: number): number {
  const slow = shoreSlowing(shoreDepth(bed));
  const pace = 1 / DEEP_SPEED;
  const ahead = pace + slow * along;
  return (
    ahead /
    Math.sqrt(
      pace * pace + 2 * pace * slow * along + slow * slow * steep * steep,
    )
  );
}

/** What a shore facing the swell by `facing` keeps of a wave's height. */
export const sheltered = (facing: number): number =>
  mix(SHORE_LEE, 1, smoothstep(-0.6, 0.7, facing));

/** The open swell's amplitude, metres, on a shore keeping `shelter` of it. */
const swellAmplitude = (tau: number, shelter: number): number =>
  0.5 * SWELL_HEIGHT * shelter * setsAt(tau);

/** A wave of amplitude `open` as the shallowing bed has stood it up. */
const shoaled = (open: number, bed: number): number =>
  open * Math.max(1, (SHOALS_FROM / shoreDepth(bed)) ** 0.25);

/** How far a wave of amplitude `open` has gone toward breaking, 0 to 1 and past. */
const steepness = (open: number, bed: number): number =>
  shoaled(open, bed) / Math.max(0.5 * SURF_SHARE * -bed, 1e-4);

/** How broken a wave `steep` toward breaking is: 0 unbroken, 1 a bore. */
const breaking = (steep: number): number =>
  smoothstep(BREAKS[0], BREAKS[1], steep);

/** How high up the sand, metres, the wave that landed at `landed` runs. */
export const swashReach = (landed: number, shelter: number): number =>
  RUNUP_SHARE * SWELL_HEIGHT * shelter * setsAt(landed);

/**
 * How broken the waves are over a bed at `bed` in a point's own time `tau`:
 * 0 an unbroken swell, 1 a bore.
 */
export const brokenAt = (tau: number, bed: number, shelter: number): number =>
  breaking(steepness(swellAmplitude(tau, shelter), bed));

/** The waves' surface over a bed below the still sea, metres about it. */
export function surfLevel(tau: number, bed: number, shelter: number): number {
  const open = swellAmplitude(tau, shelter);
  const steep = steepness(open, bed);
  const limit = 0.5 * SURF_SHARE * Math.max(-bed, 0);
  const tall = Math.min(shoaled(open, bed), limit);
  const turns = turnsAt(tau);
  const phase = turns - Math.floor(turns);
  const shape = mix(
    peaked(phase, 0.75 * Math.min(steep, 1)),
    bore(phase),
    breaking(steep),
  );
  return tall * shape;
}

/**
 * How deep wave `n`'s sheet lies on sand at `bed`, in a point's own time
 * `tau`: nothing before the wave lands or past its tongue's tip.
 */
export function sheetDepth(
  n: number,
  tau: number,
  bed: number,
  shelter: number,
): number {
  const landed = crestOf(n);
  const since = tau - landed;
  const launch = Math.sqrt(2 * SEA_GRAVITY * swashReach(landed, shelter));
  const up = Math.max(bed, 0) / BEACH_SLOPE;
  const thin =
    launch -
    0.5 * SEA_GRAVITY * BEACH_SLOPE * since -
    up / Math.max(since, 1e-3);
  if (since <= 0 || thin <= 0) return 0;
  return (
    ((SHEET_THICK * thin * thin) / (9 * SEA_GRAVITY)) *
    smoothstep(0, SHEET_GATHERS, since) *
    Math.exp(Math.min(bed, 0) / 0.25)
  );
}

/**
 * The sea's slow surface where the bed stands at `bed`, a point's `run`
 * metres along the swell's heading, keeping `shelter` of a wave and `tongue`
 * of that again in its swash, at `seconds`.
 */
export function swellLevel(
  run: number,
  bed: number,
  shelter: number,
  tongue: number,
  seconds: number,
): number {
  const tau = seconds - run / DEEP_SPEED - shoreDelay(shoreDepth(bed));
  const thrown = shelter * tongue;
  const n = Math.floor(turnsAt(tau));
  const sheet = Math.max(
    sheetDepth(n, tau, bed, thrown),
    sheetDepth(n - 1, tau, bed, thrown),
  );
  const floor =
    bed < 0
      ? surfLevel(tau, bed, shelter)
      : bed - DRY_UNDER * smoothstep(0, 0.05, bed);
  if (sheet <= 0) return floor;
  const top =
    Math.max(bed, 0) +
    sheet -
    (bed < 0 ? SHEET_SINKS * (1 - smoothstep(0, SHEET_SINKS_UNDER, sheet)) : 0);
  return mix(floor, over(floor, top), smoothstep(-SHEET_REACHES, -0.1, bed));
}

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
