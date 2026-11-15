// Generated from water-level.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/scene/shared/shader';

import { SHORE_LEVEL, SHORE_LEVEL_NUMBERS } from '@/nature/shared/shore';
import { SWELL_COURSE } from '@/nature/shared/swell';

import { ISLAND_HEIGHT } from '../../../land';
import { SHORE_CUSPS } from '../../../sea';

export const WATER_LEVEL = wgsl(
  'cube/entities/island/shore/level/model/water-level',
  /* wgsl */ `
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
  SHORE_LEVEL,
  SWELL_COURSE,
  SHORE_LEVEL_NUMBERS,
);
