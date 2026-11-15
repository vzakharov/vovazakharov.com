import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, glowing, embossed, Lens};
import package::cube::shared::shader::hash::fbm;
import package::cube::entities::theme::edge::pattern::lib::pattern::{luma, bonded};
import package::cube::entities::theme::edge::screen::lib::screen::shown;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, cornerShade, lampGlow};
import package::cube::entities::theme::kit::lib::grade::{haze, through, vignette};

fn lamps() -> Lamps {
  return Lamps(vec3f(0.12), vec3f(0.0), 2, vec2f(0.8, 0.8), 0.0);
}

/// How high a brick course stands at a wall point: 1 on a brick's face, 0
/// in the mortar, the faces rough.
fn coursed(s: Surf) -> f32 {
  let brick = bonded(s.uv, vec2f(0.42, 0.15), 61u);
  return
    smoothstep(0.004, 0.02, brick.y) * (0.8 + 0.4 * brick.x) + 0.5 * fbm(
      s.uv * 9.0,
      62u,
      3,
    );
}

/// Paving stones, each a shallow pillow.
fn paved(s: Surf) -> f32 {
  let f = fract(s.uv / 0.625) - 0.5;
  let pillow = 1.0 - pow(max(abs(f.x), abs(f.y)) * 2.0, 6.0);
  return pillow + 0.35 * fbm(s.uv * 5.0, 63u, 4);
}

/// A coffered ceiling: square sinkings, stepped twice.
fn coffered(s: Surf) -> f32 {
  let f = abs(fract(s.uv / 1.25) - 0.5) * 2.0;
  let rim = max(f.x, f.y);
  return smoothstep(0.62, 0.7, rim) + smoothstep(0.84, 0.9, rim);
}

fn themeMaterial(s: Surf) -> Material {
  let blank = matte(vec3f(0.5));
  switch s.kind {
    case WALL: {
      return embossed(s, blank, coursed(s), 0.02);
    }
    case FLOOR, OWNED: {
      return embossed(s, blank, paved(s), 0.035);
    }
    case CEILING: {
      return
        embossed(
          s,
          glowing(vec3f(0.5), lampGlow(s, lamps())),
          coffered(s),
          0.06,
        );
    }
    case TRIM: {
      return embossed(s, blank, cos(s.uv.x * 160.0), 0.004);
    }
    default: {
      return stuff(s);
    }
  }
}

/// The direction the point faces as a colour, darker where something is
/// drawn on it and toward a corner, so a room still reads as a room.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let facing = normalize(s.normal + m.relief) * 0.5 + 0.5;
  let drawn = 0.3 + 1.4 * luma(m.albedo);
  let shade = mix(1.0, cornerShade(s), 0.6);
  let colour = pow(facing, vec3f(2.2)) * min(drawn, 1.15) * shade + m.emission;
  return haze(colour, s, AIR, 70.0);
}

fn themeLens(l: Lens) -> vec3f {
  return shown(through(l, 0.12, 0.002)) * vignette(l, 0.25);
}
