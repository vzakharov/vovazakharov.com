// The outside the drowsy eye resolved, laid under the rooms of a frame that
// draws them whole: its light and metres, no mirror, and the depth of what it
// shows, so the rooms and it hide one another as one scene pass would have.

import super::reflection_numbers::SIGHT;
import super::sight_line::sightThrough;

struct Underlay {
  viewProjection: mat4x4f,
  /// From clip space back to the frame the mesh is in.
  inverse: mat4x4f,
  /// The eye, and how many metres one unit of the frame is.
  eye: vec4f,
  /// The frame in pixels.
  size: vec4f,
}

@group(0) @binding(0) var<uniform> underlay: Underlay;
@group(0) @binding(1) var outside: texture_2d<f32>;

struct Laid {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
  @builtin(frag_depth) depth: f32,
}

@fragment
fn underlayMain(@builtin(position) at: vec4f) -> Laid {
  let seen = textureLoad(outside, vec2i(at.xy), 0);
  let uv = at.xy / underlay.size.xy;
  let sight = sightThrough(underlay.inverse, underlay.eye.xyz, uv);
  let shown = underlay.eye.xyz + sight * (seen.a / underlay.eye.w);
  let clip = underlay.viewProjection * vec4f(shown, 1.0);
  // Where sight ends is the far plane: 0, the clip depth being reversed.
  let near = seen.a < SIGHT && clip.w > 0.0;
  let depth = select(0.0, clamp(clip.z / clip.w, 0.0, 1.0), near);
  return Laid(seen, vec4f(0.0), vec4f(0.0), depth);
}
