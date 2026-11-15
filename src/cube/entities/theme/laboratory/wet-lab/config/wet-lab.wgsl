// `wet-lab.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, glowing, embossed};
import package::cube::shared::shader::hash::{hashOf, unitOf, valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

fn sealedVinyl(s: Surf) -> Material {
  let fleck = worley(s.uv * 55.0, 371u);
  let chip = 1.0 - smoothstep(0.2, 0.3, fleck.x);
  let base = vec3f(0.07, 0.2, 0.17) * (0.9 + 0.2 * fbm(s.uv * 3.0, 372u, 3));
  let flecked =
    mix(
      base,
      mix(vec3f(0.3, 0.36, 0.3), vec3f(0.02, 0.06, 0.07), step(0.5, fleck.y)),
      0.7 * chip,
    );
  // Welded seams every two metres, and water standing wherever the floor dips.
  let seam = band(fract(s.uv.x / 2.0) * 2.0, 1.0, 0.012);
  let dip = fbm(s.uv * 0.55, s.seed ^ 0x71u, 4);
  let pool = smoothstep(0.52, 0.6, dip);
  let albedo =
    mix(flecked, vec3f(0.03, 0.09, 0.08), seam) * (1.0 - 0.55 * pool);
  let ripple = valueNoise(s.uv * 9.0 + vec2f(s.time * 0.2, 0.0), 373u);
  let vinyl = polished(albedo, mix(0.35, 0.97, pool));
  return
    embossed(
      s,
      vinyl,
      (1.0 - pool) * (0.5 * chip + 6.0 * dip) + 0.012 * pool * ripple,
      0.0015,
    );
}

fn glazedWall(s: Surf) -> Material {
  let h = s.p.y;
  let tile = tiling(s.uv, 0.15, 0.005, 374u);
  let course = floor(h / 0.15);
  let tiled = 1.0 - smoothstep(1.8, 1.803, h);
  let green = step(8.5, course) * step(course, 9.5);
  let cracked = step(0.94, tile.y);
  let crack =
    cracked * (1.0 - smoothstep(
      0.0,
      0.004,
      abs(fbm(s.uv * 9.0, 375u, 3) - 0.5),
    ));
  let glaze =
    mix(
      vec3f(0.56, 0.57, 0.52),
      vec3f(0.06, 0.26, 0.17),
      green,
    ) * (0.92 + 0.1 * tile.y);
  let grout = vec3f(0.13, 0.14, 0.12);
  let above = plaster(s, vec3f(0.4, 0.43, 0.36));
  // What ran down the wall and dried: iodine, permanganate, something green.
  let run = fbm(vec2f(s.uv.x * 2.2, s.uv.y * 0.18), s.seed ^ 0x72u, 3);
  let drip =
    smoothstep(0.6, 0.72, run) * smoothstep(
      0.1,
      0.9,
      h / ROOM.y + 0.3 * valueNoise(vec2f(s.uv.x * 7.0, 0.0), 376u),
    );
  let dye =
    unitOf(hashOf(bitcast<u32>(i32(floor(s.uv.x * 0.7))), s.seed ^ 0x73u));
  let stain =
    mix(
      mix(vec3f(0.6, 0.38, 0.08), vec3f(0.4, 0.1, 0.4), step(0.4, dye)),
      vec3f(0.2, 0.45, 0.2),
      step(0.75, dye),
    );
  var albedo = mix(above, mix(grout, glaze, tile.x), tiled);
  albedo =
    mix(albedo, albedo * stain, 0.8 * drip)
      * (1.0 - 0.7 * crack)
      * (1.0 - 0.45 * damp(s));
  let wall = polished(albedo, tiled * tile.x * (0.85 - 0.5 * drip) + 0.05);
  return embossed(s, wall, tiled * (tile.x + 0.3 * tile.y) - crack, 0.003);
}

fn stainedCeiling(s: Surf) -> Material {
  let rough = fbm(s.uv * 18.0, 377u, 3);
  let ring = damp(s);
  let white = plaster(s, vec3f(0.42, 0.45, 0.4)) * (1.0 - 0.55 * ring);
  let rust =
    mix(white, white * vec3f(0.8, 0.55, 0.3), smoothstep(0.2, 0.6, ring));
  return embossed(s, glowing(rust, lampGlow(s, lamps())), rough - ring, 0.004);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return glazedWall(s);
    }
    case FLOOR, OWNED: {
      return sealedVinyl(s);
    }
    case CEILING: {
      return stainedCeiling(s);
    }
    case TRIM: {
      let tile = tiling(s.uv, 0.15, 0.005, 378u);
      return
        polished(
          mix(vec3f(0.13, 0.14, 0.12), vec3f(0.07, 0.26, 0.18), tile.x),
          0.8 * tile.x,
        );
    }
    default: {
      return stuff(s);
    }
  }
}
