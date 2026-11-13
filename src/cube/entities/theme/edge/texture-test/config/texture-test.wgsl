// `texture-test.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, embossed};
import package::cube::shared::shader::hash::fbm;
import package::cube::entities::theme::edge::pattern::lib::pattern::{spectrum, ruled, chequer};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// The test map in squares `size` metres across, `deep` how strongly coloured.
fn testMap(s: Surf, size: f32, deep: f32) -> Material {
  let at = s.uv / size;
  let square = vec2i(floor(at));
  let f = fract(at) - 0.5;
  // The hue walks the diagonal, so a stretched or mirrored face shows at once.
  let hue = spectrum(f32(square.x + square.y * 3) / 16.0);
  let light = f32((square.x + square.y) & 1);
  var colour = mix(vec3f(0.06), vec3f(0.42), light);
  colour = mix(colour, hue * mix(0.5, 0.95, light), deep);
  let pixel = fwidth(at.x) + fwidth(at.y);
  let ring = 1.0 - smoothstep(0.012, 0.012 + pixel, abs(length(f) - 0.32));
  let cross = 1.0 - smoothstep(0.006, 0.006 + pixel, min(abs(f.x), abs(f.y)));
  let tick =
    step(0.44, max(abs(f.x), abs(f.y))) * step(
      abs(fract(at.x * 8.0) - 0.5),
      0.12,
    );
  let near = 1.0 - smoothstep(0.08, 0.3, pixel);
  let ink = mix(vec3f(0.9), vec3f(0.02), light);
  colour = mix(colour, ink, near * max(ring, max(0.5 * cross, 0.6 * tick)));
  let seam = ruled(s.uv, size, 0.006);
  colour = mix(colour, vec3f(0.01), seam);
  let scuff = 0.9 + 0.2 * fbm(s.uv * 3.0, s.seed, 3);
  return embossed(s, polished(colour * scuff, 0.35), -seam, 0.002);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return testMap(s, 0.5, 0.8);
    }
    case FLOOR, OWNED: {
      let m = testMap(s, 1.0, 0.55);
      return Material(m.albedo, m.emission, 0.6, m.relief);
    }
    case CEILING: {
      let m = testMap(s, 1.25, 0.12);
      return Material(m.albedo, lampGlow(s, lamps()), 0.0, m.relief);
    }
    case TRIM: {
      return polished(vec3f(0.02) + 0.5 * vec3f(chequer(s.uv, 0.05)), 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}
