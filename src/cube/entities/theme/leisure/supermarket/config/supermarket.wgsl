// `supermarket.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, glowing, embossed};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, stroke, roundBox, fading};
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Waxed vinyl tiles, a red line down every aisle and the grey of trolley
/// wheels along it.
fn waxed(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.3, 0.002, 255u);
  let speck = valueNoise(s.uv * 170.0, 256u);
  let odd = step(0.8, tile.y);
  let pale =
    mix(
      vec3f(0.52, 0.52, 0.46),
      vec3f(0.4, 0.43, 0.42),
      odd,
    ) * (0.9 + 0.12 * speck);
  let line = stroke(fract(s.uv.y / ROOM.z) * ROOM.z - 2.5, 0.1);
  let wheels =
    smoothstep(0.45, 0.75, fbm(vec2f(s.uv.x * 0.3, s.uv.y * 5.0), 257u, 3));
  let laid =
    mix(
      pale,
      vec3f(0.42, 0.03, 0.025),
      line * (0.6 + 0.4 * speck),
    ) * (1.0 - 0.3 * wheels);
  let near = fading(s, 80.0);
  let floor =
    polished(
      laid * (0.72 * mix(1.0, mix(0.6, 1.0, tile.x), near)),
      0.08 - 0.05 * wheels,
    );
  return
    embossed(s, floor, 2.0 * fbm(s.uv * 2.6, 258u, 3) + 0.3 * tile.y, 0.003);
}

/// A product's colour by its number in [0, 1): most loud, some white.
fn branded(u: f32) -> vec3f {
  let loud = 0.5 + 0.5 * cos(6.2832 * (u * 7.0 + vec3f(0.0, 0.33, 0.67)));
  return
    mix(
      loud * loud * 0.75 + 0.02,
      vec3f(0.6, 0.58, 0.5),
      step(0.8, fract(u * 13.0)),
    );
}

/// Five shelves of goods from the plinth to above head height: packets in
/// facings of one kind, gaps where something sold, a price rail under each.
fn shelved(s: Surf) -> Material {
  let h = s.p.y;
  let pitch = 0.36;
  let level = floor((h - 0.15) / pitch);
  let y = h - 0.15 - level * pitch;
  let tier = u32(max(level, 0.0)) + 1u;
  let width = 0.065 + 0.1 * unitOf(hashOf(tier, 259u));
  let slot = s.uv.x / width;
  let word = hashOf(bitcast<u32>(i32(floor(slot))), tier * 977u);
  let facing = hashOf(bitcast<u32>(i32(floor(slot / 6.0))), tier * 613u);
  let tall = 0.17 + 0.13 * unitOf(mix32(facing));
  let x = (fract(slot) - 0.5) * width;
  let sold =
    unitOf(word) < 0.1 + 0.25 * step(0.85, unitOf(mix32(facing ^ 0x3u)));
  let packet =
    inside(
      roundBox(
        vec2f(x, y - 0.03 - tall * 0.5),
        vec2f(width * 0.5 - 0.004, tall * 0.5),
        0.006,
      ),
    );
  let stocked = packet * f32(!sold);
  let colour = branded(unitOf(facing));
  let label = band(y, 0.03 + tall * 0.55, tall * 0.3);
  let mark =
    inside(length(vec2f(x, y - 0.03 - tall * 0.55)) - min(width, tall) * 0.16);
  let print =
    mix(
      mix(colour, vec3f(0.62, 0.6, 0.52), label),
      branded(unitOf(facing) + 0.37),
      mark,
    );
  let depth =
    vec3f(0.035, 0.036, 0.04) * (0.25 + 0.75 * smoothstep(pitch, 0.05, y));
  let rail = 1.0 - smoothstep(0.028, 0.03, y);
  let tag =
    inside(roundBox(vec2f(x, y - 0.014), vec2f(0.022, 0.009), 0.0)) * rail;
  let offer = step(0.9, unitOf(mix32(word)));
  let ticket =
    mix(vec3f(0.6, 0.6, 0.56), vec3f(0.65, 0.5, 0.03), offer) * (1.0 - 0.6
      * step(0.5, fract(x * 260.0))
      * step(abs(x), 0.014));
  let edge = mix(vec3f(0.45, 0.46, 0.46), ticket, tag);
  var albedo = mix(mix(depth, print, stocked), edge, rail);
  var gloss = mix(0.05, 0.4, stocked);
  var height = 3.0 * stocked + 5.0 * rail;
  if (h < 0.15) {
    albedo = vec3f(0.05, 0.05, 0.055);
    gloss = 0.3;
    height = 4.0;
  } else if (h > 1.95) {
    let red = band(h, 2.1, 0.12);
    albedo =
      mix(plaster(s, vec3f(0.55, 0.55, 0.52)), vec3f(0.45, 0.03, 0.025), red);
    gloss = 0.15;
    height = 6.0;
  }
  return embossed(s, polished(albedo, gloss), height, 0.006);
}

/// A white steel deck in ribs, the tubes hung under it in long lines.
fn decked(s: Surf) -> Material {
  let rib = smoothstep(0.25, 0.4, abs(fract(s.uv.x / 0.15) - 0.5));
  let dust = fbm(s.uv * 3.0, 260u, 3);
  let white = vec3f(0.5, 0.51, 0.5) * (0.93 + 0.06 * rib) * (0.85 + 0.2 * dust);
  return
    embossed(
      s,
      glowing(white * (1.0 - 0.3 * damp(s)), lampGlow(s, lamps())),
      rib,
      0.003,
    );
}

/// A white post, its foot in a guard of black and yellow.
fn guarded(s: Surf) -> Material {
  let guard = 1.0 - smoothstep(0.9, 0.904, s.p.y);
  let slash = step(0.5, fract((s.uv.x + s.p.y) / 0.24));
  let chipped = step(0.72, fbm(s.uv * 9.0, 261u, 3)) * guard;
  let warning = mix(vec3f(0.62, 0.45, 0.02), vec3f(0.02), slash);
  let post =
    mix(
      plaster(s, vec3f(0.5, 0.5, 0.48)),
      mix(warning, vec3f(0.3, 0.3, 0.3), chipped),
      guard,
    );
  return
    embossed(
      s,
      polished(post, 0.2 + 0.3 * guard),
      3.0 * guard - chipped,
      0.003,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return shelved(s);
    }
    case FLOOR, OWNED: {
      return waxed(s);
    }
    case CEILING: {
      return decked(s);
    }
    case TRIM: {
      return guarded(s);
    }
    default: {
      return stuff(s);
    }
  }
}
