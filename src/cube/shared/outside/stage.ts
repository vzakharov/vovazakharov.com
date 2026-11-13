import { wgsl } from '../shader/wgsl';
import { OUTDOOR_FRAME } from './outdoor-frame';

/** Where the scene's `a` says the sky is: farther than anything drawn. */
export const SKY_METRES = 1e4;

/**
 * What every outdoor fragment writes and how a backdrop covers the screen:
 *
 * - `Scene`, the scene pass's three targets, and `lit(light, metres)`, a
 *   point showing `light` that far from the eye and mirroring nothing;
 * - `backdropVertex`, one triangle over the screen at the far plane, and
 *   `rayThrough(pixel)`, the unit direction from the eye through a pixel;
 * - `clipOf(world)`, a point of the world in clip space, and
 *   `metresTo(world)`, its distance from the eye.
 */
export const OUTDOOR_STAGE = wgsl(
  'outside/stage',
  /* wgsl */ `
struct Scene {
  /// Scene light, and metres from the eye.
  @location(0) light: vec4f,
  /// What a failed reflection shows, and the share mirrored.
  @location(1) mirror: vec4f,
  /// The plane mirrored in, and its blur per metre of reflected ray.
  @location(2) plane: vec4f,
};

fn lit(light: vec3f, metres: f32) -> Scene {
  return Scene(vec4f(light, metres), vec4f(0.0), vec4f(0.0));
}

const SKY_METRES = 1e4;

@vertex
fn backdropVertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

fn rayThrough(pixel: vec2f) -> vec3f {
  let across = pixel / frame.clock.zw;
  let ndc = vec2f(across.x * 2.0 - 1.0, 1.0 - across.y * 2.0);
  let ahead = frame.inverse * vec4f(ndc, 0.001, 1.0);
  return normalize(ahead.xyz / ahead.w - frame.eye.xyz);
}

fn clipOf(world: vec3f) -> vec4f {
  return frame.viewProjection * vec4f(world, 1.0);
}

fn metresTo(world: vec3f) -> f32 {
  return length(world - frame.eye.xyz);
}
`,
  OUTDOOR_FRAME,
);
