// Generated from portal-pass.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

export const PORTAL_PASS = wgsl(
  'cube/pages/cube/ui/portal-pass',
  /* wgsl */ `
struct Doorway {
  viewProjection: mat4x4f,
}

@group(0) @binding(0) var<uniform> doorway: Doorway;
@group(0) @binding(1) var beyond: texture_2d<f32>;

@vertex
fn doorwayVertex(@location(0) corner: vec3f) -> @builtin(position) vec4f {
  return doorway.viewProjection * vec4f(corner, 1.0);
}

struct Laid {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
}

@fragment
fn doorwayMain(@builtin(position) at: vec4f) -> Laid {
  return Laid(textureLoad(beyond, vec2i(at.xy), 0), vec4f(0.0), vec4f(0.0));
}
`,
);
