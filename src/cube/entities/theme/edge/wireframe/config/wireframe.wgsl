import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, glowing, Lens};
import package::cube::entities::theme::edge::pattern::lib::pattern::{luma, ruled, slashed};
import package::cube::entities::theme::edge::screen::lib::screen::{shown, scanned};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampMask;
import package::cube::entities::theme::kit::lib::grade::{through, grain, vignette};

const PHOSPHOR = vec3f(0.08, 1.0, 0.38);
const HOT = vec3f(1.0, 0.72, 0.2);

/// A face as the triangles it is made of, `pitch` metres to a square.
fn meshed(uv: vec2f, pitch: f32) -> f32 {
  return max(ruled(uv, pitch, 0.007), 0.55 * slashed(uv, pitch, 0.005));
}

/// 1 along the line `x` metres from 0, drawn like the mesh's.
fn edged(x: f32) -> f32 {
  let pixel = fwidth(x);
  return 1.0 - smoothstep(0.012 + pixel * 0.6, 0.012 + pixel * 1.6, abs(x));
}

fn drawn(lines: f32, colour: vec3f) -> Material {
  return glowing(vec3f(0.0), colour * lines * 1.5);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let edges = max(edged(s.p.y), edged(ROOM.y - s.p.y));
      return drawn(max(meshed(s.uv, ROOM.y / 4.0), edges), PHOSPHOR);
    }
    case FLOOR, OWNED: {
      return drawn(meshed(s.uv, 0.625), PHOSPHOR);
    }
    case CEILING: {
      let panel =
        lampMask(s.p.xz, 2, vec2f(1.0, 0.5)) - lampMask(
          s.p.xz,
          2,
          vec2f(0.94, 0.44),
        );
      let mesh = drawn(0.5 * meshed(s.uv, 1.25), PHOSPHOR);
      return
        glowing(
          vec3f(0.0),
          mesh.emission + HOT * (2.5 * clamp(panel, 0.0, 1.0)),
        );
    }
    case TRIM: {
      return drawn(ruled(s.uv, 0.2, 0.006), PHOSPHOR);
    }
    default: {
      let thing = stuff(s);
      return glowing(thing.albedo, thing.emission * 0.3);
    }
  }
}

/// Lines give off their own light and nothing else gives any: a thing that
/// is not a line shows as a faint glow of its own brightness.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let ghost = PHOSPHOR * (0.3 * luma(m.albedo));
  return (m.emission + ghost) * exp(-s.far / 30.0);
}

fn themeLens(l: Lens) -> vec3f {
  let beam = through(l, 0.9, 0.005);
  return
    shown(1.0 - exp(-beam * 1.4))
      * scanned(l, l.size.y * 0.5, 0.12)
      * vignette(l, 0.35) + grain(l) * 0.008;
}
