import { lerp as mix, smoothstep } from '../lib/ease';
import type { Vec2 } from '../lib/vec';
import { f32, vecf, wgsl } from '../shader/wgsl';
import { ISLAND_HEIGHT, islandHeight } from './island-height';
import { cuspAt, SHORE_CUSPS } from './shore-cusps';
import {
  bore,
  crestOf,
  DEEP_SPEED,
  peaked,
  SEA_GRAVITY,
  setsAt,
  SWELL_HEIGHT,
  SWELL_RUNS,
  SWELL_TRAIN,
  turnsAt,
} from './swell';

/**
 * The shore: what the swell's train of waves does where the water shallows.
 * A wave reaches a point late by how long shallow water held it up, so its
 * crest bends to the beach; it steepens, breaks where it stands taller than
 * the depth allows, runs in as a bore, and is thrown up the sand as a thin
 * sheet that slows, stops and drains (Shen & Meyer 1963). Scalar closed
 * forms, each written twice; `swell.test.ts` runs the WGSL against the
 * TypeScript.
 */

/** The depth, metres, at which the swell begins to feel the bottom. */
const FEELS = 30;
/** The beach's slope the shore's timing is worked out for. */
export const SLOPE = 1 / 12;
/** The least depth a wave is timed over, so it reaches the sand in the end. */
const SHALLOWEST = 0.3;
/** Seconds a wave loses between deep water and the sand. */
const LAG = Math.sqrt(FEELS / SEA_GRAVITY) / SLOPE;
/** How far either side the bed is read for which way the shore faces. */
const FACING_REACH = 4;
/** What the island's lee keeps of a wave's height. */
const LEE = 0.3;
/** Green's law, anchored where linear theory puts a shoaling swell. */
const SHOALS_FROM = 4.55;
/** A broken wave's height as a share of the depth it runs in. */
const SURF = 0.62;
/** How far toward breaking a wave is between unbroken and a bore. */
const BREAKS = [0.8, 1.15] as const;
/** How high a wave is thrown up the sand, as a share of its height. */
const RUNUP = 0.55;
/** The sheet's depth over Shen and Meyer's, whose lens is thinner than seen. */
const THICK = 1.5;
/** Seconds a sheet takes to gather at the still shoreline. */
const GATHERS = 0.5;
/** The depth of still water, metres, past which no sheet lifts the surface. */
const SHEET_REACHES = 0.6;
/**
 * How far under the still sea a spent sheet's top is said to lie, and the
 * sheet depth under which it sinks there: a sheet draining off the sand
 * hands the surface back to the surf without a step.
 */
const SINKS = 0.1;
const SINKS_UNDER = 0.01;
/** How far under dry sand the level is said to lie. */
const DRY = 0.03;
/** The width, metres, the level's joins are rounded over. */
const ROUND = 0.012;

/** The greater of two levels, rounded where they cross. */
const over = (a: number, b: number): number =>
  0.5 * (a + b + Math.sqrt((a - b) * (a - b) + ROUND * ROUND));

/** The depth a wave is timed over where the bed stands at `bed`. */
export const shoreDepth = (bed: number): number =>
  Math.max(-bed, 0) + SHALLOWEST;

/** Seconds water `depth` deep has held a wave back since deep water. */
export function shoreDelay(depth: number): number {
  const q = Math.sqrt(Math.min(depth / FEELS, 1));
  return LAG * (1 - q) * (1 - q);
}

/** How fast that delay grows as the water shallows, seconds per metre. */
export function shoreSlowing(depth: number): number {
  const q = Math.sqrt(Math.min(depth / FEELS, 1));
  return (LAG * (1 - q)) / Math.sqrt(depth * FEELS);
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
  mix(LEE, 1, smoothstep(-0.6, 0.7, facing));

/** The open swell's amplitude, metres, on a shore keeping `shelter` of it. */
const swellAmplitude = (tau: number, shelter: number): number =>
  0.5 * SWELL_HEIGHT * shelter * setsAt(tau);

/** A wave of amplitude `open` as the shallowing bed has stood it up. */
const shoaled = (open: number, bed: number): number =>
  open * Math.max(1, (SHOALS_FROM / shoreDepth(bed)) ** 0.25);

/** How far a wave of amplitude `open` has gone toward breaking, 0 to 1 and past. */
const steepness = (open: number, bed: number): number =>
  shoaled(open, bed) / Math.max(0.5 * SURF * -bed, 1e-4);

/** How broken a wave `steep` toward breaking is: 0 unbroken, 1 a bore. */
const breaking = (steep: number): number =>
  smoothstep(BREAKS[0], BREAKS[1], steep);

/** How high up the sand, metres, the wave that landed at `landed` runs. */
export const swashReach = (landed: number, shelter: number): number =>
  RUNUP * SWELL_HEIGHT * shelter * setsAt(landed);

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
  const limit = 0.5 * SURF * Math.max(-bed, 0);
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
  const up = Math.max(bed, 0) / SLOPE;
  const thin =
    launch - 0.5 * SEA_GRAVITY * SLOPE * since - up / Math.max(since, 1e-3);
  if (since <= 0 || thin <= 0) return 0;
  return (
    ((THICK * thin * thin) / (9 * SEA_GRAVITY)) *
    smoothstep(0, GATHERS, since) *
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
      : bed - DRY * smoothstep(0, 0.05, bed);
  if (sheet <= 0) return floor;
  const top =
    Math.max(bed, 0) +
    sheet -
    (bed < 0 ? SINKS * (1 - smoothstep(0, SINKS_UNDER, sheet)) : 0);
  return mix(floor, over(floor, top), smoothstep(-SHEET_REACHES, -0.1, bed));
}

/** The bed's rise per metre at `xz`, along x and z, read `FACING_REACH` either side. */
const bedRise = ([x, z]: Vec2): Vec2 => [
  (islandHeight([x + FACING_REACH, z]) - islandHeight([x - FACING_REACH, z])) /
    (2 * FACING_REACH),
  (islandHeight([x, z + FACING_REACH]) - islandHeight([x, z - FACING_REACH])) /
    (2 * FACING_REACH),
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

/**
 * `waterLevel(xz: vec2f, t: f32) -> f32`, the twin of the function above, and
 * with it the twins of the scalar pieces it is made of, for the sea's own
 * shader to read a wave's phase and a sheet's depth from.
 */
export const WATER_LEVEL = wgsl(
  'outside/water-level',
  /* wgsl */ `
const SWELL_RUNS = ${vecf(SWELL_RUNS)};
/// Seconds the open swell takes over a metre.
const SWELL_PACE = ${f32(1 / DEEP_SPEED)};

fn shoreOver(a: f32, b: f32) -> f32 {
  return 0.5 * (a + b + sqrt((a - b) * (a - b) + ${f32(ROUND * ROUND)}));
}

fn shoreDepth(bed: f32) -> f32 {
  return max(-bed, 0.0) + ${f32(SHALLOWEST)};
}

fn shoreDelay(depth: f32) -> f32 {
  let q = sqrt(min(depth / ${f32(FEELS)}, 1.0));
  return ${f32(LAG)} * (1.0 - q) * (1.0 - q);
}

fn shoreSlowing(depth: f32) -> f32 {
  let q = sqrt(min(depth / ${f32(FEELS)}, 1.0));
  return ${f32(LAG)} * (1.0 - q) / sqrt(depth * ${f32(FEELS)});
}

fn shoreFacing(along: f32, steep: f32, bed: f32) -> f32 {
  let slow = shoreSlowing(shoreDepth(bed));
  let pace = SWELL_PACE;
  let ahead = pace + slow * along;
  return ahead / sqrt(pace * pace + 2.0 * pace * slow * along + slow * slow * steep * steep);
}

fn sheltered(facing: f32) -> f32 {
  return mix(${f32(LEE)}, 1.0, smoothstep(-0.6, 0.7, facing));
}

fn swellAmplitude(tau: f32, shelter: f32) -> f32 {
  return ${f32(0.5 * SWELL_HEIGHT)} * shelter * setsAt(tau);
}

fn shoaled(open: f32, bed: f32) -> f32 {
  return open * max(1.0, pow(${f32(SHOALS_FROM)} / shoreDepth(bed), 0.25));
}

fn steepness(open: f32, bed: f32) -> f32 {
  return shoaled(open, bed) / max(${f32(0.5 * SURF)} * -bed, 1e-4);
}

fn breaking(steep: f32) -> f32 {
  return smoothstep(${f32(BREAKS[0])}, ${f32(BREAKS[1])}, steep);
}

fn swashReach(landed: f32, shelter: f32) -> f32 {
  return ${f32(RUNUP * SWELL_HEIGHT)} * shelter * setsAt(landed);
}

fn brokenAt(tau: f32, bed: f32, shelter: f32) -> f32 {
  return breaking(steepness(swellAmplitude(tau, shelter), bed));
}

fn surfLevel(tau: f32, bed: f32, shelter: f32) -> f32 {
  let open = swellAmplitude(tau, shelter);
  let steep = steepness(open, bed);
  let limit = ${f32(0.5 * SURF)} * max(-bed, 0.0);
  let tall = min(shoaled(open, bed), limit);
  let turns = turnsAt(tau);
  let phase = turns - floor(turns);
  let shape = mix(peaked(phase, 0.75 * min(steep, 1.0)), bore(phase), breaking(steep));
  return tall * shape;
}

fn sheetDepth(n: f32, tau: f32, bed: f32, shelter: f32) -> f32 {
  let landed = crestOf(n);
  let since = tau - landed;
  let launch = sqrt(${f32(2 * SEA_GRAVITY)} * swashReach(landed, shelter));
  let up = max(bed, 0.0) / ${f32(SLOPE)};
  let thin = launch - ${f32(0.5 * SEA_GRAVITY * SLOPE)} * since - up / max(since, 1e-3);
  if (since <= 0.0 || thin <= 0.0) {
    return 0.0;
  }
  return ${f32(THICK / (9 * SEA_GRAVITY))} * thin * thin
    * smoothstep(0.0, ${f32(GATHERS)}, since)
    * exp(min(bed, 0.0) / 0.25);
}

fn swellLevel(run: f32, bed: f32, shelter: f32, tongue: f32, seconds: f32) -> f32 {
  let tau = seconds - run * SWELL_PACE - shoreDelay(shoreDepth(bed));
  let thrown = shelter * tongue;
  let n = floor(turnsAt(tau));
  let sheet = max(sheetDepth(n, tau, bed, thrown), sheetDepth(n - 1.0, tau, bed, thrown));
  var low = bed - ${f32(DRY)} * smoothstep(0.0, 0.05, bed);
  if (bed < 0.0) {
    low = surfLevel(tau, bed, shelter);
  }
  if (sheet <= 0.0) {
    return low;
  }
  var top = max(bed, 0.0) + sheet;
  if (bed < 0.0) {
    top -= ${f32(SINKS)} * (1.0 - smoothstep(0.0, ${f32(SINKS_UNDER)}, sheet));
  }
  return mix(low, shoreOver(low, top), smoothstep(${f32(-SHEET_REACHES)}, -0.1, bed));
}

/// The bed's rise per metre at \`xz\`, along x and z.
fn shoreRise(xz: vec2f) -> vec2f {
  let reach = ${f32(FACING_REACH)};
  return vec2f(
    islandHeight(xz + vec2f(reach, 0.0)) - islandHeight(xz - vec2f(reach, 0.0)),
    islandHeight(xz + vec2f(0.0, reach)) - islandHeight(xz - vec2f(0.0, reach)),
  ) / (2.0 * reach);
}

fn waterLevel(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  return swellLevel(dot(xz, SWELL_RUNS), bed, sheltered(facing), cuspAt(xz), t);
}
`,
  ISLAND_HEIGHT,
  SWELL_TRAIN,
  SHORE_CUSPS,
);
