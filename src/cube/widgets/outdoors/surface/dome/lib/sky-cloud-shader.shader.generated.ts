// Generated from sky-cloud-shader.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import {
  CLOUD_NOISE_NUMBERS,
  CLOUDS_WGSL,
  OUTDOOR_FRAME,
  OUTDOOR_STAGE,
} from '../../../stage';

export const SKY_CLOUD_SHADER = wgsl(
  'cube/widgets/outdoors/surface/dome/lib/sky-cloud-shader',
  /* wgsl */ `
struct Across {
  @builtin(position) position: vec4f,
  /// The screen, 0 to 1 from its top left corner.
  @location(0) screen: vec2f,
}

@vertex
fn cloudVertex(@builtin(vertex_index) index: u32) -> Across {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return
    Across(
      vec4f(corner * 2.0 - 1.0, 0.0, 1.0),
      vec2f(corner.x, 1.0 - corner.y),
    );
}

@fragment
fn cloudFragment(across: Across) -> @location(0) vec4f {
  let jitter = unitOf(cellHash(vec2i(across.position.xy), CLOUD_SALT + 10u));
  return skyAlong(rayThrough(across.screen * frame.clock.zw), jitter);
}
`,
  OUTDOOR_FRAME,
  OUTDOOR_STAGE,
  HASH,
  CLOUD_NOISE_NUMBERS,
  CLOUDS_WGSL,
);
