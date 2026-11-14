// `tunnelling-scan.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::shared::shader::hash::{hashOf, unitOf, fbm};
import package::cube::entities::theme::laboratory::small_world::lib::small_world::{combHash, dome};
import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, embossed};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::honeycomb::honeycomb;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// The instrument's colour for a height, 0 the lowest: black, rust, orange,
/// straw, white.
fn scanColour(height: f32) -> vec3f {
  let t = clamp(height, 0.0, 1.0);
  let low =
    mix(
      vec3f(0.01, 0.003, 0.0),
      vec3f(0.45, 0.13, 0.01),
      smoothstep(0.0, 0.4, t),
    );
  let high =
    mix(vec3f(0.85, 0.5, 0.08), vec3f(0.95, 0.9, 0.7), smoothstep(0.7, 1.0, t));
  return mix(low, high, smoothstep(0.35, 0.75, t));
}

/// Atoms `pitch` metres apart: x an atom's height at the point; y is 1
/// where one is missing and 2 where a stray one sits on top.
fn lattice(uv: vec2f, pitch: f32, salt: u32) -> vec2f {
  let comb = honeycomb(uv / pitch);
  let own = unitOf(combHash(comb.zw, salt));
  let odd = select(select(0.0, 1.0, own > 0.985), 2.0, own < 0.006);
  return vec2f(dome(comb.xy, 0.58), odd);
}

/// Terraces: the level the surface stands at, in flat steps from -0.5 to
/// about 1.3.
fn terraces(uv: vec2f, salt: u32) -> f32 {
  return floor(fbm(uv * 0.22, salt, 3) * 9.0) / 9.0 * 2.0 - 0.5;
}

/// What the atom at a point adds to the height: `swell` for one in its
/// place, nothing for a missing one, more for a stray on top.
fn atomHeight(atom: vec2f, swell: f32) -> f32 {
  let vacancy = step(0.5, atom.y) * step(atom.y, 1.5);
  return swell * atom.x * (1.0 - vacancy) + 0.3 * step(1.5, atom.y) * atom.x;
}

fn scanned(s: Surf, height: f32, depth: f32) -> Material {
  return embossed(s, polished(scanColour(height), 0.45), height, depth);
}

fn corral(s: Surf) -> Material {
  let atom = lattice(s.uv, 0.13, 511u);
  let level = terraces(s.uv, 512u);
  // A ring of forty-eight atoms set down one at a time, in half the rooms.
  let off = s.p.xz - ROOM.xz * 0.5;
  let r = length(off);
  let fenced = step(0.5, unitOf(hashOf(s.seed, 0x51u)));
  let post = fract(atan2(off.y, off.x) * 48.0 / 6.2832) - 0.5;
  let fence =
    fenced * (1.0 - smoothstep(
      0.03,
      0.09,
      length(vec2f(post * 0.2, r - 1.55)),
    ));
  let ripple =
    fenced * step(r, 1.5) * 0.16 * cos(r * 21.0) * (0.4 + 0.6 * exp(-r));
  let height =
    0.28
      + 0.4 * level * (1.0 - fenced * step(r, 1.75))
      + atomHeight(atom, 0.14)
      + ripple
      + 0.55 * fence;
  return scanned(s, height, 0.06);
}

fn stepEdges(s: Surf) -> Material {
  let atom = lattice(s.uv, 0.11, 513u);
  let level = terraces(s.uv * vec2f(1.0, 2.2), 514u);
  // Each scan line is read a little high or low of the last.
  let row = bitcast<u32>(i32(floor(s.p.y / 0.018)));
  let line = (unitOf(hashOf(row, 0x52u)) - 0.5) * 0.05;
  let streak = step(0.97, unitOf(hashOf(row, s.seed))) * 0.25;
  let height = 0.3 + 0.45 * level + atomHeight(atom, 0.16) + line + streak;
  return scanned(s, height, 0.05);
}

fn tip(s: Surf) -> Material {
  let cell = s.uv / 0.19;
  let atom = dome(fract(cell) - 0.5, 0.56);
  let m = scanned(s, 0.12 + 0.22 * atom, 0.05);
  // The tip itself: one atom, right above the middle of the room.
  let off = s.p.xz - ROOM.xz * 0.5;
  let point = 1.0 - smoothstep(0.11, 0.17, length(off));
  return Material(m.albedo, lampGlow(s, lamps()) * point, m.gloss, m.relief);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return stepEdges(s);
    }
    case FLOOR, OWNED: {
      return corral(s);
    }
    case CEILING: {
      return tip(s);
    }
    case TRIM: {
      let atom = lattice(s.uv, 0.09, 515u);
      return scanned(s, 0.55 + 0.3 * atom.x, 0.04);
    }
    default: {
      return stuff(s);
    }
  }
}
