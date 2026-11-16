import { lerp as mix, smoothstep } from '@/scene/shared/lib/ease';

import {
  bore,
  crestOf,
  DEEP_SPEED,
  peaked,
  SEA_GRAVITY,
  setsAt,
  SWELL_HEIGHT,
  turnsAt,
} from '../swell/swell';
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
  SHORE_LAG,
  SHORE_LEE,
  SHORE_ROUND,
  SHORE_SHALLOWEST,
  SURF_SHARE,
  SWELL_FEELS,
} from './shore-level-numbers';

/**
 * The shore: what the swell's train of waves does where the water shallows.
 * A wave reaches a point late by how long shallow water held it up, so its
 * crest bends to the beach; it steepens, breaks where it stands taller than
 * the depth allows, runs in as a bore, and is thrown up the sand as a thin
 * sheet that slows, stops and drains (Shen & Meyer 1963). Scalar closed
 * forms, each written twice; `shore.test.ts` runs shore-level.wgsl against
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
