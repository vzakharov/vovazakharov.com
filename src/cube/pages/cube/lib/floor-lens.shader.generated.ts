// Generated from floor-lens.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { LENS_STAGE } from './lens-stage.shader.generated';

export const FLOOR_LENS = wgsl(
  'cube/pages/cube/lib/floor-lens',
  /* wgsl */ `
@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  return vec4f(themeLens(lensOf(at)), 1.0);
}
`,
  LENS_STAGE,
);
