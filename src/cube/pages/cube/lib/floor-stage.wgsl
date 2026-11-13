// The scene pass every floor shares. The vertex stage places a vertex and
// hands the rest on, and the fragment stages make the `Surf` a theme reads and
// ask the theme for the point's material and its light — a room's face from
// what it is made of, a board's from the texture drawn on it — writing scene
// light, how far off the point is, and the mirror the light left, which the
// frame fills before the lens.

import super::lens_stage::uniforms;
import super::vertex::Varying;
import package::cube::entities::theme::kit::lib::core::{OWNED, ROOM, Surf, matte, mirroring};
import package::cube::entities::theme::kit::lib::stuff::ownedMark;

@group(1) @binding(0) var board: texture_2d<f32>;
@group(1) @binding(1) var boardSampler: sampler;

fn surfOf(in: Varying) -> Surf {
  var s: Surf;
  s.kind = in.kind;
  s.normal = normalize(in.normal);
  s.p = in.local * ROOM.x;
  s.cell = vec2u(in.cell, in.cell >> 8u) & vec2u(63u);
  let wide = vec2f(s.cell) * ROOM.xz + s.p.xz;
  if (abs(s.normal.y) > 0.5) {
    s.uv = wide;
  } else if (abs(s.normal.x) > abs(s.normal.z)) {
    s.uv = vec2f(wide.y, s.p.y);
  } else {
    s.uv = vec2f(wide.x, s.p.y);
  }
  s.seed = in.seed;
  s.flags = in.flags;
  let paint =
    vec3f(
      vec3u(in.paint >> 16u, in.paint >> 8u, in.paint) & vec3u(255u),
    ) / 255.0;
  s.paint = pow(paint, vec3f(2.2));
  let to = in.position - uniforms.eye.xyz;
  s.far = length(to) * ROOM.x;
  s.view = normalize(to);
  s.pixel = in.clip.xy;
  s.screen = in.clip.xy / uniforms.clock.zw;
  s.time = uniforms.clock.x;
  s.hour = u32(uniforms.clock.y);
  return s;
}

/// A point as the scene pass writes it: its light and how far off it is,
/// and its mirror, the share it shows and what the lamps would put there,
/// then the plane it reflects off and how fast the reflection blurs.
struct Scene {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
}

/// `light`, the theme's for `s`, with the mirror it left.
fn sceneOf(s: Surf, light: vec3f) -> Scene {
  return
    Scene(
      vec4f(light, s.far),
      vec4f(mirroring.fallback, mirroring.strength),
      vec4f(mirroring.normal, mirroring.blur),
    );
}

@fragment
fn fragmentMain(in: Varying) -> Scene {
  let s = surfOf(in);
  var m = themeMaterial(s);
  if (s.kind == OWNED) {
    m = ownedMark(s, m);
  }
  return sceneOf(s, themeLight(s, m));
}

@fragment
fn boardFragment(in: Varying) -> Scene {
  let drawn = textureSample(board, boardSampler, in.tex).rgb;
  let s = surfOf(in);
  let m = matte(pow(drawn, vec3f(2.2)));
  return sceneOf(s, themeLight(s, m));
}
