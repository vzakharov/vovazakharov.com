// Generated from shore-cusps.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { SWELL_COURSE } from '../../swell';
import { SHORE_CUSPED } from './shore-cusped';

export const SHORE_CUSPS = wgsl(
  'cube/entities/island/sea/cusp/model/shore-cusps',
  /* wgsl */ `
/// \`cusped\` at \`xz\` in the world frame.
fn cuspAt(xz: vec2f) -> f32 {
  return cusped(xz.x * SWELL_RUNS_Z - xz.y * SWELL_RUNS_X);
}
`,
  SHORE_CUSPED,
  SWELL_COURSE,
);
