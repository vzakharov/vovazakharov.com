// `bubble-chamber.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, embossed, repeated};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::tiling;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Straight trails: three families of lines, each at its own slant, one
/// every ninety centimetres or none.
fn rays(uv: vec2f, salt: u32) -> f32 {
  var sum = 0.0;
  for (var family = 0u; family < 3u; family++) {
    let slant = 0.35 + 1.1 * f32(family) + 0.3 * unitOf(mix32(salt + family));
    let across = dot(uv, vec2f(-sin(slant), cos(slant))) / 0.9;
    let word = hashOf(bitcast<u32>(i32(floor(across))), salt + family);
    let at = abs(fract(across) - 0.1 - 0.8 * unitOf(word)) * 0.9;
    sum +=
      step(0.45, unitOf(mix32(word))) * (1.0 - smoothstep(0.003, 0.011, at));
  }
  return sum;
}

/// Curled trails: something light losing its way inward, one to a cell at
/// most, turning left or right.
fn curls(uv: vec2f, salt: u32) -> f32 {
  let scaled = uv / 1.4;
  let cell = vec2i(floor(scaled));
  var sum = 0.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      if (unitOf(mix32(word ^ 0x52u)) < 0.45) {
        continue;
      }
      let off =
        (scaled
          - vec2f(other)
          - vec2f(unitOf(word), unitOf(mix32(word)))) * 1.4;
      let r = length(off);
      let reach = 0.25 + 0.4 * unitOf(mix32(word ^ 0x99u));
      let handed = select(-1.0, 1.0, (word & 1u) == 1u);
      let pitch = 0.05 + 0.05 * r / reach;
      let turn = r / pitch - handed * atan2(off.y, off.x) / 6.2832;
      let line = 1.0 - smoothstep(0.03, 0.09, abs(fract(turn) - 0.5));
      sum += line * step(r, reach) * smoothstep(0.02, 0.06, r);
    }
  }
  return sum;
}

/// A side of the tank: the trails as strings of bubbles, the crosses the
/// cameras measure from, and the dark liquid behind.
fn tank(s: Surf, salt: u32) -> Material {
  let beaded = 0.45 + 0.55 * step(0.35, valueNoise(s.uv * 170.0, salt + 20u));
  let trail =
    clamp(rays(s.uv, salt) + curls(s.uv, salt + 7u), 0.0, 1.0) * beaded;
  let at = repeated(s.uv, vec2f(1.25));
  let fiducial =
    step(min(abs(at.x), abs(at.y)), 0.004) * step(
      max(abs(at.x), abs(at.y)),
      0.05,
    );
  let depth = fbm(s.uv * 0.7 + vec2f(0.0, s.time * 0.01), salt + 30u, 4);
  let liquid = vec3f(0.004, 0.03, 0.04) * (0.4 + 1.2 * depth);
  let stray = step(0.9965, valueNoise(s.uv * 90.0, salt + 40u));
  let glow =
    vec3f(0.75, 0.95, 1.0) * (1.5 * trail + 0.8 * stray) + vec3f(
      0.01,
      0.05,
      0.06,
    ) * depth;
  let m =
    Material(
      mix(liquid, vec3f(0.5), fiducial),
      glow * (1.0 - fiducial),
      0.75,
      vec3f(0.0),
    );
  return embossed(s, m, 0.3 * depth + trail, 0.003);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return tank(s, 521u);
    }
    case FLOOR, OWNED: {
      return tank(s, 522u);
    }
    case CEILING: {
      let m = tank(s, 523u);
      return
        Material(
          m.albedo,
          m.emission + lampGlow(s, lamps()),
          m.gloss,
          m.relief,
        );
    }
    case TRIM: {
      let bolt = tiling(s.uv, 0.12, 0.05, 524u);
      return embossed(s, polished(vec3f(0.08, 0.09, 0.1), 0.6), bolt.x, 0.004);
    }
    default: {
      return stuff(s);
    }
  }
}
