import { smoothstep } from '../lib/ease';
import { f32, wgsl } from '../shader/wgsl';
import { crestOf, SEA_GRAVITY, turnsAt } from './swell';
import { SLOPE, swashReach, WATER_LEVEL } from './water-level';

/**
 * How long the sand has been out of the water: the swash's sheets are closed
 * forms of the clock, so when the last one left a point is solved for, and no
 * frame has to remember that it was wet. Scalar closed forms, each written
 * twice; `shore-wetness.test.ts` runs the WGSL against the TypeScript.
 */

/** Waves back that are asked whether they wetted a point. */
const WAVES_BACK = 6;
/** What a point no asked wave reached answers, seconds. */
export const NEVER_WET = 1e3;
/** Seconds over which sand the water has left goes from soaked to dry. */
const DRIES = 28;
/** Seconds between which the film of water left on the sand sinks away. */
const FILM = [0.4, 5] as const;

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

/**
 * `shoreDrySince(xz: vec2f, t: f32) -> f32` and
 * `shoreWetness(xz: vec2f, t: f32) -> vec2f` — x how damp the sand is (1
 * soaked), y how much of a film of water stands on it (1 a mirror) — with the
 * twins of the scalar pieces above.
 */
export const SHORE_WETNESS = wgsl(
  'outside/shore-wetness',
  /* wgsl */ `
fn drySince(tau: f32, bed: f32, shelter: f32) -> f32 {
  if (bed <= 0.0) {
    return 0.0;
  }
  let n = floor(turnsAt(tau));
  var dry = ${f32(NEVER_WET)};
  for (var back = 0.0; back < ${f32(WAVES_BACK)}; back += 1.0) {
    let landed = crestOf(n - back);
    let since = tau - landed;
    let reach = swashReach(landed, shelter);
    let span = ${f32(2 * SEA_GRAVITY)} * (reach - bed);
    if (span > 0.0) {
      let launch = sqrt(${f32(2 * SEA_GRAVITY)} * reach);
      let comes = (launch - sqrt(span)) / ${f32(SEA_GRAVITY * SLOPE)};
      let leaves = (launch + sqrt(span)) / ${f32(SEA_GRAVITY * SLOPE)};
      if (since >= comes) {
        dry = min(dry, max(since - leaves, 0.0));
      }
    }
  }
  return dry;
}

fn dampAfter(dry: f32) -> f32 {
  return exp(-dry / ${f32(DRIES)});
}

fn filmAfter(dry: f32) -> f32 {
  return 1.0 - smoothstep(${f32(FILM[0])}, ${f32(FILM[1])}, dry);
}

fn shoreDrySince(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  let tau = t - dot(xz, SWELL_RUNS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
  return drySince(tau, bed, sheltered(facing) * cuspAt(xz));
}

fn shoreWetness(xz: vec2f, t: f32) -> vec2f {
  let dry = shoreDrySince(xz, t);
  return vec2f(dampAfter(dry), filmAfter(dry));
}
`,
  WATER_LEVEL,
);
