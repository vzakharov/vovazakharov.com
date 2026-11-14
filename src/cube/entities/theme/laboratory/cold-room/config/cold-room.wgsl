// `cold-room.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, glowing, embossed};
import package::cube::shared::shader::hash::{valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::tiling;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Hoar frost, 0 to 1: needles thick where `much` is high.
fn frost(uv: vec2f, much: f32, salt: u32) -> f32 {
  let needles = worley(uv * 26.0, salt);
  let fern = fbm(uv * 7.0, salt + 1u, 4);
  return smoothstep(0.75, 0.35, needles.x + 1.1 * (1.0 - much) - 0.5 * fern);
}

fn treadPlate(s: Surf) -> Material {
  // Raised bars in a herringbone, one every eight centimetres.
  let cell = s.uv / 0.08;
  let at = fract(cell) - 0.5;
  let turned = f32((i32(floor(cell.x)) + i32(floor(cell.y))) & 1);
  let bar =
    mix(
      vec2f(at.x + at.y, at.x - at.y),
      vec2f(at.x - at.y, at.x + at.y),
      turned,
    );
  let raised =
    (1.0 - smoothstep(0.08, 0.14, abs(bar.x))) * (1.0 - smoothstep(
      0.4,
      0.5,
      abs(bar.y),
    ));
  let near = 1.0 / (1.0 + s.far * s.far / 50.0);
  let ice = smoothstep(0.42, 0.6, fbm(s.uv * 0.8, s.seed ^ 0x81u, 4));
  let rime = frost(s.uv, 0.25 + 0.6 * ice, 381u);
  let steel =
    vec3f(0.3, 0.33, 0.36) * (0.8 + 0.3 * valueNoise(s.uv * 120.0, 382u));
  let albedo =
    mix(
      mix(steel, vec3f(0.36, 0.46, 0.52), 0.6 * ice),
      vec3f(0.7, 0.76, 0.8),
      rime,
    );
  let plate = polished(albedo, mix(0.6, 0.92, ice) * (1.0 - 0.9 * rime));
  return
    embossed(s, plate, raised * near * (1.0 - 0.7 * ice) + 0.4 * rime, 0.004);
}

fn coldPanel(s: Surf) -> Material {
  let h = s.p.y;
  let across = fract(s.uv.x / 1.0);
  let rib = abs(fract(s.uv.x / 0.125) - 0.5);
  let ribbed = smoothstep(0.3, 0.42, rib);
  let joint = 1.0 - smoothstep(0.006, 0.012, min(across, 1.0 - across));
  let creep =
    1.0
      - h / ROOM.y
      + 0.5 * fbm(vec2f(s.uv.x * 0.7, 0.0), s.seed ^ 0x82u, 3)
      - 0.35;
  let rime = frost(s.uv, clamp(creep + 0.5 * joint, 0.0, 1.0), 383u);
  let icicle =
    smoothstep(
      0.5,
      0.9,
      fbm(vec2f(s.uv.x * 14.0, s.uv.y * 0.6), s.seed ^ 0x83u, 3),
    ) * smoothstep(1.2, ROOM.y, h);
  let enamel =
    vec3f(0.5, 0.55, 0.58) * (0.9 + 0.1 * ribbed) * (1.0 - 0.8 * joint);
  let albedo = mix(enamel, vec3f(0.72, 0.79, 0.84), max(rime, 0.7 * icicle));
  let sparkle = step(0.985, valueNoise(s.uv * 300.0, 384u)) * rime;
  let wall =
    Material(
      albedo,
      vec3f(0.0),
      mix(0.5, 0.1, rime) + 0.9 * sparkle + 0.4 * icicle,
      vec3f(0.0),
    );
  return
    embossed(s, wall, 0.6 * ribbed + 0.5 * rime + icicle - 2.0 * joint, 0.006);
}

fn rimedCeiling(s: Surf) -> Material {
  let tile = tiling(s.uv, 1.25, 0.012, 385u);
  let rime = frost(s.uv, 0.3 + 0.5 * fbm(s.uv * 0.6, s.seed ^ 0x84u, 3), 386u);
  let albedo =
    mix(vec3f(0.44, 0.49, 0.52) * tile.x, vec3f(0.7, 0.77, 0.82), rime);
  return
    embossed(
      s,
      glowing(albedo, lampGlow(s, lamps())),
      0.5 * rime + tile.x,
      0.004,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return coldPanel(s);
    }
    case FLOOR, OWNED: {
      return treadPlate(s);
    }
    case CEILING: {
      return rimedCeiling(s);
    }
    case TRIM: {
      let rime = frost(s.uv, 0.9 - s.p.y / ROOM.y, 387u);
      return
        polished(
          mix(vec3f(0.36, 0.39, 0.42), vec3f(0.72, 0.79, 0.84), rime),
          0.6 * (1.0 - rime),
        );
    }
    default: {
      return stuff(s);
    }
  }
}
