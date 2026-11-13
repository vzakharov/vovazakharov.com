// `underpass.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, glowing, embossed};
import package::cube::shared::shader::hash::{mix32, unitOf, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::leisure::shape::lib::shape::{slabs, oneOf};
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Concrete flags, and the water lying wherever they have sunk.
fn puddled(s: Surf) -> Material {
  let flag = slabs(s.uv, vec2f(0.9, 0.6), 0.014, 270u, 0.5);
  let grit = valueNoise(s.uv * 130.0, 271u);
  let stain = fbm(s.uv * 0.9, 272u, 4);
  let concrete =
    vec3f(0.2, 0.19, 0.17)
      * (0.7 + 0.25 * flag.y + 0.2 * grit)
      * (0.65 + 0.6 * stain);
  let sunk = fbm(s.uv * 0.5, 273u, 4);
  let pool = smoothstep(0.5, 0.58, sunk + 0.06 * flag.y);
  let soaked = smoothstep(0.38, 0.5, sunk);
  let laid = concrete * mix(0.35, 1.0, flag.x) * (1.0 - 0.45 * soaked);
  let floor =
    polished(
      mix(laid, laid * 0.35, pool),
      mix(0.1 + 0.25 * soaked, 0.96, pool),
    );
  let ripple = fbm(s.uv * 3.0 + s.time * 0.05, 274u, 2);
  return
    embossed(
      s,
      floor,
      mix(1.5 * flag.x + 0.5 * grit + 3.0 * stain, 0.25 * ripple, pool),
      0.004,
    );
}

/// Sprayed lines, 0 to 1: the paths a can took over the wall.
fn sprayed(at: vec2f, salt: u32) -> f32 {
  let path = fbm(at, salt, 3) - 0.5;
  return 1.0 - smoothstep(0.008, 0.028, abs(path));
}

/// Glazed tiles in courses, a green band at the waist and the foot, grime
/// down from the ceiling, tiles gone here and there, and a tag to a wall.
fn grimed(s: Surf) -> Material {
  let h = s.p.y;
  let tile = slabs(s.uv, vec2f(0.15, 0.075), 0.005, 275u, 0.5);
  let green =
    clamp(band(h, 1.2, 0.15) + (1.0 - smoothstep(0.3, 0.304, h)), 0.0, 1.0);
  let glaze =
    mix(
      vec3f(0.47, 0.42, 0.28),
      vec3f(0.03, 0.12, 0.07),
      green,
    ) * (0.85 + 0.2 * tile.y);
  let run = fbm(vec2f(s.uv.x * 3.0, h * 0.35), s.seed ^ 0x76u, 4);
  let grime =
    clamp(
      smoothstep(0.35, 0.8, run) * smoothstep(0.4, 2.3, h) + 0.5 * exp(
        -h / 0.25,
      ),
      0.0,
      1.0,
    );
  let gone =
    step(0.86, tile.y) * smoothstep(
      0.5,
      0.6,
      fbm(s.uv * 0.8, s.seed ^ 0x77u, 3),
    );
  let sand = valueNoise(s.uv * 90.0, 276u);
  let mortar = vec3f(0.17, 0.16, 0.14) * (0.7 + 0.5 * sand);
  let spot = vec2f(s.uv.x, h);
  let area =
    smoothstep(0.5, 0.62, fbm(spot * 0.45, s.seed ^ 0x78u, 2)) * band(
      h,
      1.2,
      1.3,
    );
  let tag =
    max(
      sprayed(spot * 1.5, s.seed ^ 0x79u),
      sprayed(spot * 3.4 + 9.0, s.seed ^ 0x7au),
    ) * area;
  let can =
    oneOf(
      unitOf(mix32(s.seed ^ 0x7bu)),
      vec3f(0.015),
      vec3f(0.4, 0.02, 0.02),
      vec3f(0.5, 0.5, 0.52),
      vec3f(0.03, 0.1, 0.4),
    );
  let dirty = mix(glaze, glaze * vec3f(0.3, 0.22, 0.12), grime);
  let faced = mix(mix(mortar, dirty, tile.x), mortar, gone);
  let wall =
    polished(
      mix(faced, can, 0.85 * tag),
      0.75 * tile.x * (1.0 - gone) * (1.0 - 0.8 * grime) * (1.0 - tag),
    );
  return embossed(s, wall, tile.x * (1.0 - gone) + 0.2 * sand * gone, 0.004);
}

/// Concrete that still shows the boards it was poured against, rust under
/// the lamp and lime where the joints leak.
fn boardMarked(s: Surf) -> Material {
  let plank = slabs(s.uv, vec2f(2.4, 0.14), 0.006, 277u, 0.5);
  let grain = fbm(vec2f(s.uv.x * 1.5, s.uv.y * 55.0) + plank.y * 9.0, 278u, 3);
  let lime =
    smoothstep(
      0.6,
      0.85,
      fbm(vec2f(s.uv.x * 0.6, s.uv.y * 5.0), 279u, 4),
    ) * (1.0 - plank.x * 0.6);
  let grey =
    vec3f(0.15, 0.15, 0.15) * (0.85 + 0.15 * plank.y) * (0.88 + 0.16 * grain);
  let poured =
    mix(
      grey * mix(0.5, 1.0, plank.x),
      vec3f(0.4, 0.38, 0.32),
      0.6 * lime,
    ) * (1.0 - 0.6 * damp(s));
  return
    embossed(
      s,
      glowing(poured, lampGlow(s, lamps())),
      plank.x + 0.6 * grain + lime,
      0.006,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return grimed(s);
    }
    case FLOOR, OWNED: {
      return puddled(s);
    }
    case CEILING: {
      return boardMarked(s);
    }
    case TRIM: {
      let rust =
        smoothstep(0.5, 0.75, fbm(vec2f(s.uv.x * 8.0, s.p.y * 1.2), 280u, 4));
      let foot = 1.0 - smoothstep(0.3, 0.304, s.p.y);
      let post = mix(vec3f(0.19, 0.18, 0.16), vec3f(0.03, 0.1, 0.06), foot);
      return
        embossed(
          s,
          polished(mix(post, vec3f(0.2, 0.07, 0.02), 0.7 * rust), 0.15),
          rust,
          0.003,
        );
    }
    default: {
      return stuff(s);
    }
  }
}
