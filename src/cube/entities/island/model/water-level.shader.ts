// Generated from water-level.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { ISLAND_HEIGHT } from './island-height';
import { SHORE_CUSPS } from './shore-cusps.shader';
import { SWELL_SUMS } from './swell';
import { SWELL_COURSE } from './swell-course';
import { SWELL_NUMBERS } from './swell-numbers';
import { SWELL_TRAIN } from './swell-train.shader';
import { WATER_LEVEL_NUMBERS } from './water-level-numbers';

export const WATER_LEVEL = wgsl(
  'cube/entities/island/model/water-level',
  /* wgsl */ `
/// The greater of two levels, rounded where they cross.
fn shoreOver(a: f32, b: f32) -> f32 {
  return 0.5 * (a + b + sqrt((a - b) * (a - b) + SHORE_ROUND * SHORE_ROUND));
}

/// The depth a wave is timed over where the bed stands at \`bed\`.
fn shoreDepth(bed: f32) -> f32 {
  return max(-bed, 0.0) + SHORE_SHALLOWEST;
}

/// Seconds water \`depth\` deep has held a wave back since deep water.
fn shoreDelay(depth: f32) -> f32 {
  let q = sqrt(min(depth / SWELL_FEELS, 1.0));
  return SHORE_LAG * (1.0 - q) * (1.0 - q);
}

/// How fast that delay grows as the water shallows, seconds per metre.
fn shoreSlowing(depth: f32) -> f32 {
  let q = sqrt(min(depth / SWELL_FEELS, 1.0));
  return SHORE_LAG * (1.0 - q) / sqrt(depth * SWELL_FEELS);
}

/// How squarely the waves at a point still run with the open swell: 1 on the
/// beach that faces it, −1 in the island's lee.
fn shoreFacing(along: f32, steep: f32, bed: f32) -> f32 {
  let slow = shoreSlowing(shoreDepth(bed));
  let pace = SWELL_PACE;
  let ahead = pace + slow * along;
  return
    ahead / sqrt(
      pace * pace + 2.0 * pace * slow * along + slow * slow * steep * steep,
    );
}

/// What a shore facing the swell by \`facing\` keeps of a wave's height.
fn sheltered(facing: f32) -> f32 {
  return mix(SHORE_LEE, 1.0, smoothstep(-0.6, 0.7, facing));
}

/// The open swell's amplitude, metres, on a shore keeping \`shelter\` of it.
fn swellAmplitude(tau: f32, shelter: f32) -> f32 {
  return 0.5 * SWELL_HEIGHT * shelter * setsAt(tau);
}

/// A wave of amplitude \`open\` as the shallowing bed has stood it up.
fn shoaled(open: f32, bed: f32) -> f32 {
  return open * max(1.0, pow(SHOALS_FROM / shoreDepth(bed), 0.25));
}

/// How far a wave of amplitude \`open\` has gone toward breaking, 0 to 1 and past.
fn steepness(open: f32, bed: f32) -> f32 {
  return shoaled(open, bed) / max(0.5 * SURF_SHARE * -bed, 1e-4);
}

/// How broken a wave \`steep\` toward breaking is: 0 unbroken, 1 a bore.
fn breaking(steep: f32) -> f32 {
  return smoothstep(BREAKS_FROM, BREAKS_TO, steep);
}

/// How high up the sand, metres, the wave that landed at \`landed\` runs.
fn swashReach(landed: f32, shelter: f32) -> f32 {
  return RUNUP_SHARE * SWELL_HEIGHT * shelter * setsAt(landed);
}

/// How broken the waves are over a bed at \`bed\` in a point's own time \`tau\`.
fn brokenAt(tau: f32, bed: f32, shelter: f32) -> f32 {
  return breaking(steepness(swellAmplitude(tau, shelter), bed));
}

/// The waves' surface over a bed below the still sea, metres about it.
fn surfLevel(tau: f32, bed: f32, shelter: f32) -> f32 {
  let open = swellAmplitude(tau, shelter);
  let steep = steepness(open, bed);
  let limit = 0.5 * SURF_SHARE * max(-bed, 0.0);
  let tall = min(shoaled(open, bed), limit);
  let turns = turnsAt(tau);
  let phase = turns - floor(turns);
  let shape =
    mix(peaked(phase, 0.75 * min(steep, 1.0)), bore(phase), breaking(steep));
  return tall * shape;
}

/// How deep wave \`n\`'s sheet lies on sand at \`bed\`, in a point's own time
/// \`tau\`: nothing before the wave lands or past its tongue's tip.
fn sheetDepth(n: f32, tau: f32, bed: f32, shelter: f32) -> f32 {
  let landed = crestOf(n);
  let since = tau - landed;
  let launch = sqrt(2.0 * SEA_GRAVITY * swashReach(landed, shelter));
  let up = max(bed, 0.0) / BEACH_SLOPE;
  let thin =
    launch - 0.5 * SEA_GRAVITY * BEACH_SLOPE * since - up / max(since, 1e-3);
  if (since <= 0.0 || thin <= 0.0) {
    return 0.0;
  }
  return
    SHEET_THICK
      / (9.0 * SEA_GRAVITY)
      * thin
      * thin
      * smoothstep(0.0, SHEET_GATHERS, since)
      * exp(min(bed, 0.0) / 0.25);
}

/// The sea's slow surface where the bed stands at \`bed\`, a point's \`run\`
/// metres along the swell's heading, keeping \`shelter\` of a wave and \`tongue\`
/// of that again in its swash, at \`seconds\`.
fn swellLevel(
  run: f32,
  bed: f32,
  shelter: f32,
  tongue: f32,
  seconds: f32,
) -> f32 {
  let tau = seconds - run * SWELL_PACE - shoreDelay(shoreDepth(bed));
  let thrown = shelter * tongue;
  let n = floor(turnsAt(tau));
  let sheet =
    max(sheetDepth(n, tau, bed, thrown), sheetDepth(n - 1.0, tau, bed, thrown));
  var low = bed - DRY_UNDER * smoothstep(0.0, 0.05, bed);
  if (bed < 0.0) {
    low = surfLevel(tau, bed, shelter);
  }
  if (sheet <= 0.0) {
    return low;
  }
  var top = max(bed, 0.0) + sheet;
  if (bed < 0.0) {
    top -= SHEET_SINKS * (1.0 - smoothstep(0.0, SHEET_SINKS_UNDER, sheet));
  }
  return mix(low, shoreOver(low, top), smoothstep(-SHEET_REACHES, -0.1, bed));
}

/// The bed's rise per metre at \`xz\`, along x and z.
fn shoreRise(xz: vec2f) -> vec2f {
  let reach = SHORE_FACING_REACH;
  return
    vec2f(
      islandHeight(xz + vec2f(reach, 0.0)) - islandHeight(
        xz - vec2f(reach, 0.0),
      ),
      islandHeight(xz + vec2f(0.0, reach)) - islandHeight(
        xz - vec2f(0.0, reach),
      ),
    ) / (2.0 * reach);
}

/// The sea's slow surface at \`xz\` at time \`t\`: metres over the still sea,
/// with the swell, its surf and the swash and no wind wave.
fn waterLevel(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  return swellLevel(dot(xz, SWELL_RUNS), bed, sheltered(facing), cuspAt(xz), t);
}
`,
  ISLAND_HEIGHT,
  SHORE_CUSPS,
  SWELL_SUMS,
  SWELL_TRAIN,
  SWELL_COURSE,
  SWELL_NUMBERS,
  WATER_LEVEL_NUMBERS,
);
