// What a lens on the edge does to the frame in place of glass: thresholds,
// outlines read off the scene's depth, and a display's own gamma.

import package::cube::entities::theme::kit::lib::core::Lens;
import package::cube::entities::theme::kit::lib::scene::sceneAt;

/// Linear light, 0 to 1, as the display's own numbers.
fn shown(colour: vec3f) -> vec3f {
  return pow(clamp(colour, vec3f(0.0), vec3f(1.0)), vec3f(1.0 / 2.2));
}

fn bayerPair(at: vec2u) -> u32 {
  let x = at.x & 1u;
  let y = at.y & 1u;
  return ((x ^ y) << 1u) | y;
}

/// The 8×8 ordered-dither threshold of screen cell `at`, in (0, 1).
fn bayer(at: vec2f) -> f32 {
  let cell = vec2u(at);
  let rank =
    (bayerPair(cell) << 4u)
      | (bayerPair(cell >> vec2u(1u)) << 2u)
      | bayerPair(cell >> vec2u(2u));
  return (f32(rank) + 0.5) / 64.0;
}

/// How sharply the scene's depth bends at a pixel, across `reach` pixels:
/// 0 on a flat face, 1 along a crease or a silhouette.
fn creaseAt(l: Lens, reach: f32) -> f32 {
  let apart = reach / l.size;
  let here = 1.0 / sceneAt(l.uv).a;
  let east = 1.0 / sceneAt(l.uv + vec2f(apart.x, 0.0)).a;
  let west = 1.0 / sceneAt(l.uv - vec2f(apart.x, 0.0)).a;
  let south = 1.0 / sceneAt(l.uv + vec2f(0.0, apart.y)).a;
  let north = 1.0 / sceneAt(l.uv - vec2f(0.0, apart.y)).a;
  let bend = abs(east + west - 2.0 * here) + abs(south + north - 2.0 * here);
  return smoothstep(0.004, 0.012, bend / max(here, 1e-6));
}

/// A picture tube's lines down the screen, `count` of them: 1 on a line's
/// middle, `1 - depth` between two.
fn scanned(l: Lens, count: f32, depth: f32) -> f32 {
  let wave = 0.5 + 0.5 * cos(l.uv.y * count * 6.2832);
  return 1.0 - depth * (1.0 - wave);
}
