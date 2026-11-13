// Generated from outdoor-stage.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader';
import { OUTDOOR_FRAME } from './outdoor-frame';

export const OUTDOOR_STAGE = wgsl(
  'cube/shared/outside/outdoor-stage',
  /* wgsl */ `
/// The scene pass's three targets.
struct Scene {
  /// Scene light, and metres from the eye.
  @location(0) light: vec4f,
  /// What a failed reflection shows, and the share mirrored.
  @location(1) mirror: vec4f,
  /// The plane mirrored in, and its blur per metre of reflected ray.
  @location(2) plane: vec4f,
}

/// A point showing \`light\` \`metres\` from the eye and mirroring nothing.
fn lit(light: vec3f, metres: f32) -> Scene {
  return Scene(vec4f(light, metres), vec4f(0.0), vec4f(0.0));
}

/// One triangle over the screen at the far plane.
@vertex
fn backdropVertex(
  @builtin(vertex_index) index: u32,
) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

/// The unit direction from the eye through a pixel.
fn rayThrough(pixel: vec2f) -> vec3f {
  let across = pixel / frame.clock.zw;
  let ndc = vec2f(across.x * 2.0 - 1.0, 1.0 - across.y * 2.0);
  let ahead = frame.inverse * vec4f(ndc, 0.001, 1.0);
  return normalize(ahead.xyz / ahead.w - frame.eye.xyz);
}

/// A point of the world in clip space.
fn clipOf(world: vec3f) -> vec4f {
  return frame.viewProjection * vec4f(world, 1.0);
}

/// A point of the world's distance from the eye.
fn metresTo(world: vec3f) -> f32 {
  return length(world - frame.eye.xyz);
}
`,
  OUTDOOR_FRAME,
);
