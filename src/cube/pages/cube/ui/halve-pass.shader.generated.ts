// Generated from halve-pass.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

export const HALVE_PASS = wgsl(
  'cube/pages/cube/ui/halve-pass',
  /* wgsl */ `
@group(0) @binding(0) var above: texture_2d<f32>;
@group(0) @binding(1) var aboveSampler: sampler;

@fragment
fn halveMain(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let uv = pixel.xy * 2.0 / vec2f(textureDimensions(above));
  return textureSampleLevel(above, aboveSampler, uv, 0.0);
}
`,
);
