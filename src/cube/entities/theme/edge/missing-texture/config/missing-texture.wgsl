// `missing-texture.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material};
import package::cube::entities::theme::edge::pattern::lib::pattern::chequer;
import package::cube::entities::theme::kit::lib::finish::{plaster, tiling};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

const MAGENTA = vec3f(1.0, 0.0, 0.86);

/// The placeholder in squares `size` metres across, giving off `glow` of
/// its own colour.
fn missing(s: Surf, size: f32, glow: f32) -> Material {
  let pink = chequer(s.uv, size);
  let colour = mix(vec3f(0.004), MAGENTA, pink);
  return Material(colour * 0.8, colour * glow, 0.5 * (1.0 - pink), vec3f(0.0));
}

/// 1 on the panels of this wall that found their texture.
fn loaded(s: Surf) -> f32 {
  let panel = tiling(s.uv, 1.25, 0.0, s.seed ^ 0x55u);
  return step(0.86, panel.y);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let wall = missing(s, 0.3125, 0.22);
      let low = 1.0 - smoothstep(1.1, 1.104, s.p.y);
      let meant =
        mix(plaster(s, vec3f(0.5, 0.46, 0.36)), vec3f(0.07, 0.11, 0.05), low);
      let found = loaded(s);
      return
        Material(
          mix(wall.albedo, meant, found),
          wall.emission * (1.0 - found),
          mix(wall.gloss, 0.1 + 0.3 * low, found),
          vec3f(0.0),
        );
    }
    case FLOOR, OWNED: {
      let m = missing(s, 0.625, 0.1);
      return Material(m.albedo, m.emission, 0.75, vec3f(0.0));
    }
    case CEILING: {
      let m = missing(s, 0.625, 0.06);
      return
        Material(m.albedo, m.emission + lampGlow(s, lamps()), 0.0, vec3f(0.0));
    }
    case TRIM: {
      return missing(s, 0.078125, 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}
