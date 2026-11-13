// Generated from bloom-pass.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { BLOOM_NUMBERS } from './bloom-numbers';

export const BLOOM_PASS = wgsl(
  'cube/pages/cube/ui/bloom-pass',
  /* wgsl */ `
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;

struct Varying {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Varying {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  var out: Varying;
  out.clip = vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
  out.uv = vec2f(corner.x, 1.0 - corner.y);
  return out;
}

fn at(uv: vec2f) -> vec3f {
  return textureSampleLevel(source, sourceSampler, uv, 0.0).rgb;
}

/// The source around \`uv\`, \`reach\` texels wide: its middle and four corners.
fn spread(uv: vec2f, reach: f32) -> vec3f {
  let texel = reach / vec2f(textureDimensions(source));
  return (at(uv) * 4.0
    + at(uv + texel * vec2f(-1.0, -1.0)) + at(uv + texel * vec2f(1.0, -1.0))
    + at(uv + texel * vec2f(-1.0, 1.0)) + at(uv + texel * vec2f(1.0, 1.0))) / 8.0;
}

@fragment
fn bright(in: Varying) -> @location(0) vec4f {
  let colour = spread(in.uv, 1.0);
  let level = max(colour.r, max(colour.g, colour.b));
  let kept = max(level - 1.0, 0.0) / max(level, 1e-4);
  return vec4f(colour * (kept / BLOOM_LEVELS), 1.0);
}

@fragment
fn down(in: Varying) -> @location(0) vec4f {
  return vec4f(spread(in.uv, 1.0), 1.0);
}

@fragment
fn up(in: Varying) -> @location(0) vec4f {
  return vec4f(spread(in.uv, 0.75), 1.0);
}
`,
  BLOOM_NUMBERS,
);
