// The sky of this frame without the sun's disc, drawn over the whole of a
// target smaller than the screen: `cloudVertex` and `cloudFragment`, which
// writes `skyAlong`. Group 0 is the `OutdoorFrame` block alone.

import package::cube::shared::outside::outdoor_frame::frame;
import package::cube::shared::outside::outdoor_stage::rayThrough;
import package::cube::shared::shader::hash::{unitOf, cellHash};
import super::cloud_noise_numbers::CLOUD_SALT;
import super::clouds_wgsl::skyAlong;

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
