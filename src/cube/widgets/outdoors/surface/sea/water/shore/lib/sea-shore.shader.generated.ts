// Generated from sea-shore.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';
import {
  ISLAND_HEIGHT,
  SHORE_CUSPS,
  SWELL_COURSE,
  SWELL_TRAIN,
  WATER_LEVEL,
} from '@/cube/entities/island';

import { OUTDOOR_FRAME } from '../../../../../stage';
import { SEA_SHORE_NUMBERS } from '../../../state';

export const SEA_SHORE = wgsl(
  'cube/widgets/outdoors/surface/sea/water/shore/lib/sea-shore',
  /* wgsl */ `
/// 0 by the island, 1 out where the open sea's own swell has taken over.
fn offshore(xz: vec2f) -> f32 {
  return smoothstep(OFFSHORE_FROM, OFFSHORE_TO, length(xz));
}

/// The slow surface the wind's waves ride at \`xz\`, metres over the still sea.
fn level(xz: vec2f) -> f32 {
  let off = offshore(xz);
  if (off >= 1.0) {
    return 0.0;
  }
  return (1.0 - off) * waterLevel(xz, frame.clock.x);
}

/// How much of each cascade water \`depth\` metres deep lets through, \`off\`
/// of the way offshore.
fn calmOver(off: f32, depth: f32) -> vec4f {
  return
    vec4f(
      off,
      smoothstep(SWELL_DIES_FROM, SWELL_DIES_TO, depth),
      smoothstep(0.05, 0.5, depth),
      smoothstep(0.004, 0.05, depth),
    );
}

/// \`calmOver\` at \`xz\` by the still sea's depth there.
fn calm(xz: vec2f) -> vec4f {
  let off = offshore(xz);
  if (off >= 1.0) {
    return vec4f(1.0);
  }
  return calmOver(off, -islandHeight(xz));
}

/// The surf and the swash at one point, now.
struct Shore {
  /// The sand, and the slow surface, metres over the still sea.
  bed: f32,
  level: f32,
  /// The point's own time: the clock less how long the swell takes to reach it.
  tau: f32,
  /// What the island's lee leaves of a wave here, 0.3 to 1.
  shelter: f32,
  /// Turns since the last crest passed, 0 to 1.
  phase: f32,
  /// 0 an unbroken swell, 1 a bore.
  broken: f32,
  /// Seconds since the last wave landed and the one before it, and how deep
  /// each one's sheet lies here.
  since: vec2f,
  sheet: vec2f,
}

/// Everything about the surf and the swash at \`xz\`, now.
fn shoreAt(xz: vec2f) -> Shore {
  var shore: Shore;
  let t = frame.clock.x;
  shore.bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), shore.bed);
  let depth = shoreDepth(shore.bed);
  shore.shelter = sheltered(facing);
  let tongue = cuspAt(xz);
  shore.tau = t - dot(xz, SWELL_RUNS) * SWELL_PACE - shoreDelay(depth);
  let turns = turnsAt(shore.tau);
  let n = floor(turns);
  shore.phase = turns - n;
  shore.broken = brokenAt(shore.tau, shore.bed, shore.shelter);
  shore.since = shore.tau - vec2f(crestOf(n), crestOf(n - 1.0));
  shore.sheet =
    vec2f(
      sheetDepth(n, shore.tau, shore.bed, shore.shelter * tongue),
      sheetDepth(n - 1.0, shore.tau, shore.bed, shore.shelter * tongue),
    );
  shore.level =
    swellLevel(dot(xz, SWELL_RUNS), shore.bed, shore.shelter, tongue, t);
  return shore;
}
`,
  ISLAND_HEIGHT,
  OUTDOOR_FRAME,
  SHORE_CUSPS,
  SWELL_TRAIN,
  SWELL_COURSE,
  WATER_LEVEL,
  SEA_SHORE_NUMBERS,
);
