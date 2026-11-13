// `metro-platform.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, alongWall, Material, polished, glowing, embossed, repeated, spaced};
import package::cube::shared::shader::hash::{mix32, unitOf, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, roundBox, slabs, veins, oneOf};
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Granite flags, and across every room the blistered yellow strip and the
/// white line of a platform's edge.
fn edged(s: Surf) -> Material {
  let flag = tiling(s.uv, 0.6, 0.005, 312u);
  let speck = worley(s.uv * 150.0, 313u);
  let granite =
    vec3f(0.19, 0.19, 0.2) * (0.6 + 0.9 * speck.x) * (0.88 + 0.14 * flag.y);
  let q = fract(s.uv.y / ROOM.z) * ROOM.z;
  let strip = band(q, 0.62, 0.4);
  let dome = repeated(s.uv, vec2f(0.05));
  let blister = smoothstep(0.02, 0.008, length(dome)) * strip;
  let worn = 0.55 + 0.45 * fbm(s.uv * vec2f(0.7, 3.0), 314u, 3);
  let line = band(q, 0.24, 0.08);
  let gum = smoothstep(0.02, 0.012, worley(s.uv * 2.5, 315u).x / 2.5);
  var colour =
    mix(
      granite * mix(0.45, 1.0, flag.x),
      vec3f(0.58, 0.42, 0.03) * (0.8 + 0.25 * blister),
      strip * worn,
    );
  colour = mix(colour, vec3f(0.55, 0.55, 0.52), line * worn);
  colour = mix(colour, vec3f(0.03), 0.8 * gum);
  let floor = polished(colour, 0.05 - 0.03 * strip);
  return
    embossed(
      s,
      floor,
      flag.x + 2.0 * blister + 1.5 * fbm(s.uv * 2.0, 316u, 3),
      0.002,
    );
}

/// What is left on a bill board: `at` is metres from the board's middle.
fn bills(at: vec2f, salt: u32) -> vec3f {
  let under = fbm(at * 2.4, salt, 4);
  let over = fbm(at * 3.1 + 9.0, salt ^ 0x5u, 4);
  let ink =
    oneOf(
      unitOf(mix32(salt)),
      vec3f(0.36, 0.14, 0.13),
      vec3f(0.14, 0.22, 0.33),
      vec3f(0.4, 0.33, 0.12),
      vec3f(0.15, 0.27, 0.17),
    );
  let ply =
    vec3f(0.16, 0.1, 0.05) * (0.7 + 0.5 * fbm(
      vec2f(at.x * 30.0, at.y * 2.0),
      salt ^ 0x6u,
      3,
    ));
  let lining =
    vec3f(0.5, 0.47, 0.38) * (0.85 + 0.2 * fbm(at * 14.0, salt ^ 0x7u, 3));
  // Where a sheet tore, the white of its back shows along the tear.
  let bill =
    mix(
      vec3f(0.6, 0.59, 0.55),
      ink * (0.7 + 0.6 * over),
      smoothstep(0.5, 0.53, over),
    );
  let pasted = mix(ply, lining, smoothstep(0.36, 0.38, under));
  return
    mix(
      pasted,
      bill,
      smoothstep(0.46, 0.48, over) * smoothstep(0.36, 0.38, under),
    );
}

/// Cream tiles over a maroon dado, soot down from the head of the wall, a
/// red enamel frieze of blank name plates, and a bill board either end.
fn enamelled(s: Surf) -> Material {
  let h = s.p.y;
  let tile = slabs(s.uv, vec2f(0.2, 0.1), 0.004, 317u, 0.5);
  let craze = 1.0 - 0.25 * smoothstep(0.05, 0.0, veins(s.uv * 40.0, 318u));
  let dado = 1.0 - smoothstep(0.9, 0.904, h);
  let nosing = band(h, 0.925, 0.05);
  let glaze =
    mix(vec3f(0.5, 0.47, 0.35), vec3f(0.13, 0.028, 0.025), dado)
      * (0.85 + 0.2 * tile.y)
      * craze;
  let soot =
    smoothstep(
      0.3,
      0.8,
      fbm(vec2f(s.uv.x * 2.5, h * 0.4), s.seed ^ 0x19u, 4),
    ) * smoothstep(0.9, 2.3, h);
  var colour =
    mix(
      vec3f(0.12, 0.115, 0.1),
      mix(glaze, vec3f(0.01), nosing),
      tile.x,
    ) * (1.0 - 0.65 * soot);
  var gloss = 0.7 * tile.x * (1.0 - 0.7 * soot);
  var height = tile.x;
  let frieze = smoothstep(2.06, 2.064, h);
  let plate =
    inside(
      roundBox(vec2f(spaced(s.uv.x, 2.5), h - 2.18), vec2f(0.7, 0.075), 0.075),
    );
  if (frieze > 0.5) {
    colour =
      mix(
        vec3f(0.42, 0.02, 0.025),
        vec3f(0.6, 0.59, 0.54),
        plate,
      ) * (1.0 - 0.5 * soot);
    gloss = 0.75;
    height = 3.0 + plate;
  }
  let run = alongWall(s);
  let board = vec2f(min(abs(run - 0.85), abs(run - 4.15)), h - 1.45);
  let rim = roundBox(board, vec2f(0.55, 0.5), 0.0);
  if (rim < 0.0) {
    let side = select(0u, 1u, run > 2.5);
    colour =
      mix(
        bills(vec2f(run, h), s.seed ^ side),
        vec3f(0.02),
        1.0 - inside(rim + 0.03),
      ) * (1.0 - 0.4 * soot);
    gloss = 0.08;
    height = 4.0 - 2.0 * inside(rim + 0.03);
  }
  return embossed(s, polished(colour, gloss), height, 0.004);
}

/// A black soffit carrying its cables along the platform, tubes between.
fn cabled(s: Surf) -> Material {
  let q = fract(s.uv.y / 1.25) * 1.25;
  let cable =
    max(max(band(q, 0.2, 0.05), band(q, 0.29, 0.035)), band(q, 0.36, 0.05));
  let tray = band(q, 0.28, 0.3);
  let dust = fbm(s.uv * 5.0, 319u, 3);
  let soffit = vec3f(0.11, 0.105, 0.09) * (0.6 + 0.6 * dust);
  let run = mix(mix(soffit, vec3f(0.2, 0.2, 0.2), tray), vec3f(0.02), cable);
  return
    embossed(
      s,
      glowing(run * (1.0 - 0.4 * damp(s)), lampGlow(s, lamps())),
      -tray - 2.0 * cable + 0.2 * dust,
      0.02,
    );
}

/// A cast-iron column in dark green, riveted, with a cream head.
fn riveted(s: Surf) -> Material {
  let head = smoothstep(1.8, 1.804, s.p.y);
  let dot = repeated(vec2f(s.uv.x, s.p.y), vec2f(0.08, 0.3));
  let rivet = smoothstep(0.016, 0.01, length(dot));
  let chip = step(0.8, fbm(s.uv * 8.0, 320u, 3));
  let paint = mix(vec3f(0.02, 0.085, 0.05), vec3f(0.48, 0.45, 0.34), head);
  let iron = mix(paint, vec3f(0.07, 0.035, 0.02), chip * (1.0 - head));
  return
    embossed(
      s,
      polished(iron, 0.5 * (1.0 - chip)),
      rivet + band(s.p.y, 1.8, 0.06) - 0.3 * chip,
      0.006,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return enamelled(s);
    }
    case FLOOR, OWNED: {
      return edged(s);
    }
    case CEILING: {
      return cabled(s);
    }
    case TRIM: {
      return riveted(s);
    }
    default: {
      return stuff(s);
    }
  }
}
