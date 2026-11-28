// Generated from shore-wetness.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { SHORE_LEVEL, WETNESS } from '@/nature/shared/shore';
import { SWELL_COURSE } from '@/nature/shared/swell';

import { ISLAND_HEIGHT } from '../../../land';
import { SHORE_CUSPS } from '../../../sea';
import { WATER_LEVEL } from '../../level';

export const SHORE_WETNESS = wgsl(
  'cube/entities/island/shore/wetness/model/shore-wetness',
  /* wgsl */ `
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
  WETNESS,
  SWELL_COURSE,
  SHORE_LEVEL,
  WATER_LEVEL,
);
