// Generated from lens-stage.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';
import { CORE } from '@/cube/entities/theme';

export const LENS_STAGE = wgsl(
  'cube/pages/cube/lib/lens-stage',
  /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4f,
  /// The eye, in its own frame.
  eye: vec4f,
  /// Seconds into the shared clock's hour, which hour, and the screen's size.
  clock: vec4f,
  /// What the outside's lens is set to: its exposure, how far the eyelids
  /// are open, 0 shut to 1, and how far indoors the eye is, 0 to 1.
  lens: vec4f,
  /// How far the drowsy eye darkens the frame's corners, 0 not at all.
  drowsy: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

/// One triangle that covers the screen.
@vertex
fn lensVertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

/// \`colour\` at \`uv\`, darkened towards the corners as far as the drowsy eye
/// says: what hides the blur a turn brings in at the frame's edge.
fn vignetted(colour: vec3f, uv: vec2f) -> vec3f {
  let out = length(uv - 0.5) * 1.25;
  return colour * (1.0 - uniforms.drowsy.x * smoothstep(0.35, 1.0, out));
}

fn lensOf(at: vec4f) -> Lens {
  var l: Lens;
  l.pixel = at.xy;
  l.size = uniforms.clock.zw;
  l.uv = at.xy / l.size;
  l.time = uniforms.clock.x;
  l.hour = u32(uniforms.clock.y);
  return l;
}
`,
  CORE,
);
