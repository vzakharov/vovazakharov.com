// `kitchen.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, glowing, embossed, repeated};
import package::cube::shared::shader::hash::{valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::dwelling::household::lib::household::{within, fromLamp, burning};

const TILE = 0.15;

fn splashback(s: Surf) -> Material {
  let y = s.p.y;
  let at = vec2f(s.uv.x, y);
  let tile = tiling(at, TILE, 0.007, 0xb0u);
  let q = repeated(at, vec2f(TILE));
  let row = floor(y / TILE);
  let tiled = within(y - 9.0 * TILE, 0.002);

  let fruit = within(length(q + vec2f(0.0, 0.008)) - 0.036, 0.003);
  let dimple = within(length(q - vec2f(0.012, 0.004)) - 0.004, 0.003);
  let leaf =
    within(
      length((q - vec2f(0.02, 0.04)) * mat2x2f(0.7, 0.7, -1.6, 1.6)) - 0.022,
      0.003,
    );
  let picture = step(0.9, tile.y) * step(row, 7.5);
  let glaze =
    mix(vec3f(0.5, 0.45, 0.33), vec3f(0.46, 0.4, 0.27), fract(tile.y * 7.0));
  var face = glaze;
  face = mix(face, vec3f(0.5, 0.19, 0.02), fruit * picture);
  face = mix(face, vec3f(0.3, 0.09, 0.01), dimple * picture);
  face = mix(face, vec3f(0.08, 0.2, 0.04), leaf * picture);
  face = mix(face, vec3f(0.22, 0.09, 0.025), step(7.5, row));
  let grime = fbm(at * vec2f(9.0, 1.2), s.seed ^ 0xb1u, 3);
  let grout = vec3f(0.13, 0.11, 0.08) * (0.5 + 0.8 * grime);
  let tiles = mix(grout, face * (0.92 + 0.1 * grime), tile.x);
  let pillow = tile.x * (1.0 - 22.0 * dot(q, q) / TILE);

  let chip = worley(s.uv * 55.0, 0xb2u);
  let bump = within(chip.x - 0.22, 0.2) * step(0.45, chip.y);
  let grease =
    smoothstep(1.5, ROOM.y, y) * fbm(
      vec2f(s.uv.x * 2.5, y * 0.8),
      s.seed ^ 0xb3u,
      4,
    );
  let run =
    smoothstep(
      0.62,
      0.7,
      fbm(vec2f(s.uv.x * 14.0, y * 0.7), s.seed ^ 0xb4u, 3),
    ) * grease;
  let mustard =
    plaster(s, vec3f(0.44, 0.29, 0.055))
      * (1.0 - 0.45 * grease)
      * (1.0 - 0.3 * run);

  let wall =
    Material(
      mix(mustard, tiles, tiled),
      vec3f(0.0),
      mix(0.12 + 0.5 * grease, 0.8 * tile.x, tiled),
      vec3f(0.0),
    );
  return
    embossed(s, wall, mix(0.25 * bump + 0.1 * run, 0.5 + pillow, tiled), 0.004);
}

fn vinyl(s: Surf) -> Material {
  let size = 0.3;
  let q = repeated(s.uv, vec2f(size));
  let r = length(q);
  let roundel = within(r - 0.105, 0.003);
  let ring = band(r, 0.085, 0.014);
  let core = within(r - 0.04, 0.003);
  let corner = abs(abs(q.x) - 0.15) + abs(abs(q.y) - 0.15);
  let lozenge = within(corner - 0.05, 0.003);
  var sheet = vec3f(0.1, 0.042, 0.016);
  sheet = mix(sheet, vec3f(0.3, 0.1, 0.016), roundel);
  sheet = mix(sheet, vec3f(0.36, 0.28, 0.13), ring);
  sheet = mix(sheet, vec3f(0.1, 0.042, 0.016), core);
  sheet = mix(sheet, vec3f(0.1, 0.1, 0.03), lozenge);
  let trodden = smoothstep(0.35, 0.75, fbm(s.uv * 0.55, 0xb5u, 3));
  let scratch =
    fbm(vec2f(s.uv.x * 3.0 + s.uv.y * 2.0, s.uv.y * 60.0), 0xb6u, 2);
  let worn = mix(sheet, vec3f(0.3, 0.22, 0.13), 0.45 * trodden * scratch);
  let floor =
    polished(
      worn * (0.85 + 0.2 * valueNoise(s.uv * 170.0, 0xb7u)),
      0.6 - 0.35 * trodden,
    );
  let stipple = valueNoise(s.uv * 320.0, 0xb8u);
  return
    embossed(
      s,
      floor,
      0.03 * stipple + 0.2 * (roundel - ring) + 2.0 * fbm(s.uv * 1.4, 0xb9u, 2),
      0.0008,
    );
}

fn foamTiles(s: Surf) -> Material {
  let size = 0.3;
  let q = repeated(s.uv, vec2f(size));
  let edge = 0.15 - max(abs(q.x), abs(q.y));
  let bevel = smoothstep(0.0, 0.02, edge);
  let star = 0.5 + 0.5 * cos(atan2(q.y, q.x) * 8.0);
  let pressed =
    within(length(q) - 0.06 - 0.03 * star, 0.006) + band(
      max(abs(q.x), abs(q.y)),
      0.115,
      0.008,
    );
  let beads = worley(s.uv * 190.0, 0xbau).x;
  let nicotine = 0.7 + 0.3 * fbm(s.uv * 1.1, s.seed ^ 0xbbu, 3);
  let foam =
    vec3f(0.5, 0.47 * nicotine, 0.36 * nicotine * nicotine)
      * (0.9 + 0.12 * beads)
      * (1.0 - 0.5 * damp(s));

  let off = fromLamp(s, 2);
  let r = length(off);
  let tube = band(r, 0.15, 0.03);
  let fitting = within(r - 0.06, 0.004);
  let on = burning(s, lamps());
  let ends = 0.75 + 0.25 * smoothstep(0.0, 0.5, abs(atan2(off.y, off.x)));
  let glow =
    lamps().colour * (7.0 * tube * ends * on) + vec3f(0.5, 0.12, 0.1)
      * tube
      * (1.0 - ends)
      * 4.0
      * on;
  var albedo =
    mix(foam * mix(0.5, 1.0, bevel), vec3f(0.5, 0.48, 0.42), fitting);
  albedo = mix(albedo, vec3f(0.55), tube);
  return
    embossed(
      s,
      glowing(albedo, glow),
      bevel + 0.3 * pressed + 0.1 * beads + 2.0 * fitting + 1.5 * tube,
      0.006,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return splashback(s);
    }
    case FLOOR, OWNED: {
      return vinyl(s);
    }
    case CEILING: {
      return foamTiles(s);
    }
    case TRIM: {
      return polished(plaster(s, vec3f(0.44, 0.29, 0.055)), 0.45);
    }
    default: {
      return stuff(s);
    }
  }
}
