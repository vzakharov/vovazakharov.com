// Generated from luma.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

export const LUMA = wgsl(
  'cube/entities/theme/kit/lib/luma',
  /* wgsl */ `
fn luma(colour: vec3f) -> f32 {
  return dot(colour, vec3f(0.2126, 0.7152, 0.0722));
}
`,
);
