// `darkroom.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, glowing, embossed, repeated};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, tiling};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

fn wetConcrete(s: Surf) -> Material {
  let grit = fbm(s.uv * 12.0, 391u, 4);
  let dip = fbm(s.uv * 0.7, s.seed ^ 0x91u, 4);
  let pool = smoothstep(0.44, 0.52, dip);
  let duck = tiling(s.uv, 0.5, 0.03, 392u).x;
  let albedo = vec3f(0.1, 0.1, 0.1) * (0.7 + 0.6 * grit) * (1.0 - 0.6 * pool);
  let slab = polished(albedo, mix(0.45, 0.98, pool));
  return embossed(s, slab, (1.0 - pool) * (grit + 0.6 * duck), 0.003);
}

/// A print on the line: paper with a picture half arrived — a horizon, and
/// something standing on it.
fn print(at: vec2f, word: u32) -> f32 {
  let horizon = 0.35 + 0.3 * unitOf(word);
  let figure =
    (1.0 - smoothstep(0.03, 0.05, abs(at.x - 0.3 - 0.4 * unitOf(mix32(word)))))
      * step(horizon, at.y)
      * step(at.y, horizon + 0.3);
  let ground = step(at.y, horizon) * (0.3 + 0.3 * fbm(at * 9.0, word, 3));
  let sky = step(horizon, at.y) * (0.75 + 0.2 * fbm(at * 4.0, word + 7u, 3));
  let developed = fbm(at * 2.0, word + 3u, 2);
  return
    mix(
      0.85,
      (ground + sky) * (1.0 - 0.8 * figure),
      smoothstep(0.2, 0.7, developed),
    );
}

fn blackout(s: Surf) -> Material {
  let h = s.p.y;
  // Heavy cloth in folds, deeper toward the hem.
  let sway = 0.5 * valueNoise(vec2f(s.uv.x * 1.3, h * 0.6), s.seed ^ 0x92u);
  let fold = sin((s.uv.x + 0.07 * sway * (1.2 - h / ROOM.y)) * 26.0);
  let nap = valueNoise(s.uv * vec2f(500.0, 160.0), 393u);
  let velvet =
    vec3f(0.035, 0.03, 0.03) * (0.6 + 0.5 * nap) * (0.75 + 0.25 * fold);
  let rail = band(h, ROOM.y - 0.08, 0.03);
  // Prints hang from a line at eye height, one every forty centimetres.
  let slot = floor(s.uv.x / 0.4);
  let word = hashOf(bitcast<u32>(i32(slot)), s.seed ^ 0x93u);
  let hung = step(0.45, unitOf(word));
  let at = vec2f((fract(s.uv.x / 0.4) - 0.15) / 0.7, (h - 1.22) / 0.36);
  let inside =
    hung
      * step(0.0, at.x)
      * step(at.x, 1.0)
      * step(0.0, at.y)
      * step(at.y, 1.0);
  let sag = 1.62 - 0.02 * sin(fract(s.uv.x / 0.4) * 3.14159);
  let line = band(h, sag, 0.004);
  let peg = hung * band(fract(s.uv.x / 0.4), 0.5, 0.05) * band(h, 1.59, 0.05);
  var albedo = mix(velvet, vec3f(0.3, 0.3, 0.3), rail);
  albedo = mix(albedo, vec3f(0.5, 0.48, 0.42) * print(at, word), inside);
  albedo = mix(albedo, vec3f(0.4, 0.3, 0.15), max(line, peg));
  let wall = polished(albedo, 0.5 * rail + 0.35 * inside);
  return
    embossed(
      s,
      wall,
      (fold + 0.1 * nap) * (1.0 - inside) + 3.0 * peg,
      0.02 * (1.0 - inside) + 0.002,
    );
}

fn blackCeiling(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.01, 394u);
  let board =
    vec3f(0.035, 0.032, 0.03)
      * (0.7 + 0.5 * fbm(s.uv * 30.0, 395u, 3))
      * tile.x;
  // A safelight is a small glass box: bright at its bulb, dull at its rim.
  let off = repeated(s.p.xz, ROOM.xz / 2.0);
  let bulb = exp(-dot(off, off) * 90.0);
  return
    embossed(
      s,
      glowing(board, lampGlow(s, lamps()) * (0.35 + 2.0 * bulb)),
      tile.x,
      0.004,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return blackout(s);
    }
    case FLOOR, OWNED: {
      return wetConcrete(s);
    }
    case CEILING: {
      return blackCeiling(s);
    }
    case TRIM: {
      return polished(vec3f(0.03, 0.03, 0.03), 0.5);
    }
    default: {
      return stuff(s);
    }
  }
}
