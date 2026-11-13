// `static.ts` adds this floor's lamps and light: `lamps()` and
// `themeLight`.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, polished, glowing, Lens};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash};
import package::cube::entities::theme::edge::pattern::lib::pattern::luma;
import package::cube::entities::theme::edge::screen::lib::screen::scanned;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;
import package::cube::entities::theme::kit::lib::grade::{tonemap, vignette};

/// Snow at a point, 0 to 1, in grains `grain` to the metre each way.
fn snow(s: Surf, grain: vec2f, salt: u32) -> f32 {
  let frame = u32(s.time * 24.0) + s.hour * 86400u;
  return unitOf(hashOf(cellHash(vec2i(floor(s.uv * grain)), salt), frame));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      // A band of the wall loses the picture a moment at a time.
      let frame = u32(s.time * 6.0);
      let row = u32(s.p.y * 9.0);
      let lost = step(0.82, unitOf(hashOf(hashOf(row, s.seed), frame)));
      let combed = snow(s, vec2f(22.0, 130.0), 91u);
      let coarse = snow(s, vec2f(5.0, 130.0), 92u);
      return polished(vec3f(0.05 + 0.6 * mix(combed, coarse, lost)), 0.25);
    }
    case FLOOR, OWNED: {
      return
        polished(
          vec3f(
            0.03 + 0.5 * snow(s, vec2f(110.0), 93u) * snow(s, vec2f(9.0), 94u),
          ),
          0.6,
        );
    }
    case CEILING: {
      return
        glowing(
          vec3f(0.04 + 0.4 * snow(s, vec2f(28.0), 95u)),
          lampGlow(s, lamps()),
        );
    }
    case TRIM: {
      return matte(vec3f(0.02 + 0.1 * snow(s, vec2f(200.0), 96u)));
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLens(l: Lens) -> vec3f {
  let frame = u32(l.time * 24.0);
  // A few rows in a hundred are pulled sideways, new ones every eighth of a second.
  let row = u32(l.uv.y * 90.0);
  let pull = hashOf(row, frame / 3u);
  let torn =
    select(0.0, (unitOf(mix32(pull)) - 0.5) * 0.09, unitOf(pull) < 0.05);
  let at = l.uv + vec2f(torn, 0.0);
  let picture = luma(tonemap(sceneAt(at).rgb * 1.2 + glowAt(at) * 0.3));
  let ghost = luma(tonemap(sceneAt(at - vec2f(0.035, 0.0)).rgb));
  let speck =
    unitOf(hashOf(hashOf(u32(l.pixel.x * 0.5), u32(l.pixel.y * 0.5)), frame));
  // The dark bar of a set that cannot hold the picture still climbs the screen.
  let bar =
    1.0 - 0.35 * smoothstep(
      0.82,
      1.0,
      abs(fract(l.uv.y + l.time * 0.07) - 0.5) * 2.0,
    );
  let grey =
    mix(picture + 0.28 * ghost, speck, 0.3)
      * bar
      * scanned(l, l.size.y / 3.0, 0.3);
  return vec3f(0.92, 1.0, 1.06) * grey * vignette(l, 0.5);
}
