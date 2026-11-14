// `cinema-corridor.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, alongWall, Material, matte, polished, glowing, embossed, repeated};
import package::cube::shared::shader::hash::{valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, tiling, carpet};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, stroke, roundBox};
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Deep red pile woven with gold rings that overlap, a gold lozenge in the
/// middle of each.
fn ringed(s: Surf) -> Material {
  let pitch = vec2f(0.3);
  let a = repeated(s.uv, pitch);
  let b = repeated(s.uv + 0.15, pitch);
  let rings =
    max(stroke(length(a) - 0.142, 0.01), stroke(length(b) - 0.142, 0.01));
  let lozenge = inside(abs(b.x) + abs(b.y) - 0.035);
  let pile = valueNoise(s.uv * 240.0, 11u);
  let red = carpet(s, vec3f(0.1, 0.008, 0.012));
  let gold =
    vec3f(0.22, 0.12, 0.02)
      * (0.6 + 0.5 * pile)
      * (0.8 + 0.3 * fbm(s.uv * 0.45, 5u, 3));
  let woven = mix(red, gold, max(rings, lozenge));
  return embossed(s, matte(woven), pile + 0.6 * max(rings, lozenge), 0.002);
}

/// The wash a wall light at `at` throws up and down the wall, 0 to 1.
fn sconceWash(at: vec2f) -> f32 {
  let spread = 0.06 + 0.3 * abs(at.y);
  return exp(-at.x * at.x / (spread * spread)) * exp(-abs(at.y) * 1.7);
}

/// Pleated velvet over a walnut dado with a brass rail, a wall light either
/// end of the wall and a strip of light where it meets the carpet.
fn draped(s: Surf) -> Material {
  let h = s.p.y;
  let fold = 0.5 + 0.5 * sin(s.uv.x * 57.0 + 1.4 * sin(h * 1.3 + s.uv.x * 3.0));
  let nap = valueNoise(vec2f(s.uv.x * 300.0, h * 40.0), 253u);
  let velvet =
    vec3f(0.09, 0.007, 0.016) * (0.3 + 0.8 * fold) * (0.8 + 0.35 * nap);
  let grain = fbm(vec2f(s.uv.x * 3.0, h * 60.0), 254u, 3);
  let walnut = vec3f(0.09, 0.04, 0.018) * (0.6 + 0.7 * grain);
  let dado = 1.0 - smoothstep(0.85, 0.854, h);
  let rail = band(h, 0.87, 0.035);
  let brass = vec3f(0.55, 0.36, 0.08);
  let strip = band(h, 0.045, 0.014);
  let warm = vec3f(1.0, 0.55, 0.2);
  let run = alongWall(s);
  let near = vec2f(min(abs(run - 0.75), abs(run - 4.25)), h - 1.7);
  let shade = inside(roundBox(near, vec2f(0.06, 0.09), 0.02));
  var albedo = mix(mix(velvet, walnut, dado), brass, max(rail, shade));
  let wash = sconceWash(near) * 3.0 + exp(-max(h - 0.045, 0.0) * 9.0) * 1.2;
  let glow = warm * (5.0 * strip + 2.5 * shade) + albedo * warm * wash;
  let wall =
    Material(albedo, glow, mix(mix(0.02, 0.45, dado), 0.8, rail), vec3f(0.0));
  return
    embossed(
      s,
      wall,
      mix(fold * 4.0, 1.0 + grain * 0.2, dado) + 3.0 * rail + 12.0 * shade,
      0.004,
    );
}

/// Black acoustic tiles, a small downlight let into each third of the room.
fn blacked(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.012, 4u);
  let felt = valueNoise(s.uv * 90.0, 255u);
  let black =
    vec3f(0.022, 0.018, 0.017) * (0.7 + 0.5 * felt) * (0.9 + 0.1 * tile.y);
  return
    embossed(
      s,
      glowing(mix(vec3f(0.008), black, tile.x), lampGlow(s, lamps())),
      tile.x + 0.3 * felt,
      0.004,
    );
}

fn fluted(s: Surf) -> Material {
  let flute = 0.5 + 0.5 * cos(s.uv.x * 157.0);
  let cap = band(s.p.y, 0.1, 0.2) + band(s.p.y, ROOM.y - 0.1, 0.2);
  let brass = vec3f(0.3, 0.17, 0.035) * (0.4 + 0.7 * flute);
  return
    embossed(s, polished(brass, 0.75), flute * (1.0 - cap) + 2.0 * cap, 0.004);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return draped(s);
    }
    case FLOOR, OWNED: {
      return ringed(s);
    }
    case CEILING: {
      return blacked(s);
    }
    case TRIM: {
      return fluted(s);
    }
    default: {
      return stuff(s);
    }
  }
}
