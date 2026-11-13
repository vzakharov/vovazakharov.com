// Generated from shore-cusps.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader/wgsl';
import { SHORE_CUSPED } from './shore-cusped';
import { SWELL_COURSE } from './swell-course';

export const SHORE_CUSPS = wgsl(
  'cube/shared/outside/shore-cusps',
  /* wgsl */ `
/// \`cusped\` at \`xz\` in the world frame.
fn cuspAt(xz: vec2f) -> f32 {
  return cusped(xz.x * SWELL_RUNS_Z - xz.y * SWELL_RUNS_X);
}
`,
  SHORE_CUSPED,
  SWELL_COURSE,
);
