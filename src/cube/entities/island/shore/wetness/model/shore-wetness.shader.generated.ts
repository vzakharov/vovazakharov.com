// Generated from shore-wetness.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { ISLAND_HEIGHT } from '../../../land';
import {
  SHORE_CUSPS,
  SWELL_COURSE,
  SWELL_NUMBERS,
  SWELL_TRAIN,
} from '../../../sea';
import { WATER_LEVEL, WATER_LEVEL_NUMBERS } from '../../level';
import { SHORE_WETNESS_NUMBERS } from './shore-wetness-numbers';

export const SHORE_WETNESS = wgsl(
  'cube/entities/island/shore/wetness/model/shore-wetness',
  /* wgsl */ `
/// Seconds since a swash sheet last lay on sand \`bed\` metres over the still
/// sea, at a point whose own time is \`tau\` and whose shore keeps \`shelter\` of
/// a wave: 0 while one lies there, \`NEVER_WET\` where none of the last waves
/// reached.
fn drySince(tau: f32, bed: f32, shelter: f32) -> f32 {
  if (bed <= 0.0) {
    return 0.0;
  }
  let n = floor(turnsAt(tau));
  var dry = NEVER_WET;
  for (var back = 0.0; back < WAVES_BACK; back += 1.0) {
    let landed = crestOf(n - back);
    let since = tau - landed;
    let reach = swashReach(landed, shelter);
    // The sheet's tip passes the point going up and again coming down.
    let span = 2.0 * SEA_GRAVITY * (reach - bed);
    if (span > 0.0) {
      let launch = sqrt(2.0 * SEA_GRAVITY * reach);
      let comes = (launch - sqrt(span)) / (SEA_GRAVITY * BEACH_SLOPE);
      let leaves = (launch + sqrt(span)) / (SEA_GRAVITY * BEACH_SLOPE);
      if (since >= comes) {
        dry = min(dry, max(since - leaves, 0.0));
      }
    }
  }
  return dry;
}

/// How damp sand is \`dry\` seconds after the water left it, 1 soaked.
fn dampAfter(dry: f32) -> f32 {
  return exp(-dry / DRY_SECONDS);
}

/// How much of a film of water still stands on it, 1 a mirror.
fn filmAfter(dry: f32) -> f32 {
  return 1.0 - smoothstep(FILM_FROM, FILM_TO, dry);
}

/// Seconds since the swash last lay on the sand at \`xz\` at time \`t\`.
fn shoreDrySince(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  let tau = t - dot(xz, SWELL_RUNS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
  return drySince(tau, bed, sheltered(facing) * cuspAt(xz));
}

/// The sand at \`xz\` at time \`t\`: x how damp it is (1 soaked), y how much of
/// a film of water stands on it (1 a mirror).
fn shoreWetness(xz: vec2f, t: f32) -> vec2f {
  let dry = shoreDrySince(xz, t);
  return vec2f(dampAfter(dry), filmAfter(dry));
}
`,
  ISLAND_HEIGHT,
  SHORE_CUSPS,
  SHORE_WETNESS_NUMBERS,
  SWELL_TRAIN,
  SWELL_COURSE,
  SWELL_NUMBERS,
  WATER_LEVEL,
  WATER_LEVEL_NUMBERS,
);
