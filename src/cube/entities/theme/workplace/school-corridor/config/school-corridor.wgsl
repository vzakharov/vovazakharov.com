// `school-corridor.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, Surf, Material, polished, glowing, embossed};
import package::cube::shared::shader::hash::{valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

fn lino(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.3, 0.003, 41u);
  let at = vec2i(floor(s.uv / 0.3));
  let cream = vec3f(0.36, 0.32, 0.23);
  let red = vec3f(0.2, 0.035, 0.025);
  let marble = 0.8 + 0.3 * fbm(s.uv * 14.0 + tile.y * 40.0, 42u, 3);
  let scuff = 1.0 - 0.35 * smoothstep(0.5, 0.8, fbm(s.uv * 1.3, 43u, 3));
  let colour = mix(cream, red, f32((at.x + at.y) & 1)) * marble * scuff;
  let floor = polished(colour * mix(0.5, 1.0, tile.x), 0.8 * scuff);
  return embossed(s, floor, tile.x + 2.0 * fbm(s.uv * 1.8, 48u, 3), 0.0025);
}

fn twoTone(s: Surf) -> Material {
  let h = s.p.y;
  let roller = fbm(s.uv * 26.0, 44u, 3);
  let upper = plaster(s, vec3f(0.44, 0.42, 0.31));
  let teal = vec3f(0.025, 0.14, 0.14) * (0.92 + 0.12 * roller);
  let chipped =
    step(
      0.9,
      fbm(s.uv * 5.0, s.seed ^ 0x45u, 3) + 0.25 * valueNoise(s.uv * 60.0, 46u),
    );
  let low = 1.0 - smoothstep(1.35, 1.354, h);
  let lower = mix(teal, vec3f(0.36, 0.34, 0.29), chipped);
  let painted = mix(upper, lower, low);
  let albedo = mix(painted, vec3f(0.012, 0.04, 0.04), band(h, 1.35, 0.03));
  let stained = mix(albedo, albedo * vec3f(0.55, 0.5, 0.35), damp(s));
  let wall = polished(stained, 0.05 + 0.55 * low * (1.0 - chipped));
  return embossed(s, wall, 0.4 * roller - chipped * low, 0.003);
}

fn peeling(s: Surf) -> Material {
  let crack = worley(s.uv * 2.2, s.seed ^ 0x47u);
  let peel = smoothstep(0.03, 0.0, abs(crack.x - 0.42)) * step(0.6, crack.y);
  let white =
    plaster(s, vec3f(0.44, 0.44, 0.4))
      * (1.0 - 0.5 * peel)
      * (1.0 - 0.6 * damp(s));
  return embossed(s, glowing(white, lampGlow(s, lamps())), -peel, 0.01);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return twoTone(s);
    }
    case FLOOR, OWNED: {
      return lino(s);
    }
    case CEILING: {
      return peeling(s);
    }
    default: {
      return stuff(s);
    }
  }
}
