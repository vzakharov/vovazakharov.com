// `agar.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, embossed};
import package::cube::shared::shader::hash::{valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

const GEL = vec3f(0.62, 0.3, 0.035);

/// What has grown at a point of the plate, given its `colony` cell: x how
/// thick it stands, 0 to 1, y how far into the colony the point is.
fn growth(uv: vec2f, colony: vec2f) -> vec2f {
  let reach = 0.1 + 0.34 * colony.y * colony.y;
  let lobed = colony.x + 0.07 * fbm(uv * 11.0, 402u, 3);
  let big = 1.0 - smoothstep(reach - 0.035, reach, lobed);
  let dot = worley(uv * 8.0, 403u);
  // Pinpoint colonies along the streaks the loop drew.
  let streak = smoothstep(0.55, 0.7, fbm(uv * vec2f(0.5, 2.6), 404u, 2));
  let small = streak * (1.0 - smoothstep(0.16, 0.24, dot.x)) * step(0.3, dot.y);
  return vec2f(max(big, 0.8 * small), clamp(1.0 - lobed / reach, 0.0, 1.0));
}

fn plate(s: Surf) -> Material {
  // x the distance to the colony's own point, y the colony's own number.
  let colony = worley(s.uv * 1.3, 401u);
  let grown = growth(s.uv, colony);
  let depth = fbm(s.uv * 0.5, 405u, 3);
  let gel = GEL * (0.55 + 0.8 * depth);
  // Some colonies clear the gel around them, and the lightbox shows through.
  let halo = step(0.7, colony.y) * (1.0 - smoothstep(0.3, 0.52, colony.x));
  let ring = 0.8 + 0.2 * sin(grown.y * 34.0);
  let kind = colony.y;
  let cream =
    mix(
      mix(vec3f(0.6, 0.55, 0.36), vec3f(0.52, 0.07, 0.05), step(0.55, kind)),
      vec3f(0.16, 0.3, 0.12),
      step(0.85, kind),
    ) * ring;
  let albedo = mix(gel * 0.25, cream, grown.x);
  let lightbox = gel * (0.75 + 0.9 * halo) * (1.0 - 0.96 * grown.x);
  let m = Material(albedo, lightbox, mix(0.45, 0.25, grown.x), vec3f(0.0));
  return embossed(s, m, grown.x * (0.5 + 0.5 * grown.y) + 0.05 * ring, 0.03);
}

/// Condensation, 0 to 1 a drop's height: beads thicker where `much` is high.
fn beads(uv: vec2f, much: f32, salt: u32) -> f32 {
  let drop = worley(uv * 28.0, salt);
  let radius = 0.2 + 0.25 * drop.y;
  return
    step(1.0 - much, drop.y) * sqrt(
      max(1.0 - drop.x * drop.x / (radius * radius), 0.0),
    );
}

fn dishWall(s: Surf) -> Material {
  let h = s.p.y;
  let fogged =
    smoothstep(0.3, ROOM.y, h + 0.6 * fbm(s.uv * 0.8, s.seed ^ 0x40u, 3));
  let bead = beads(s.uv, 0.25 + 0.6 * fogged, 406u);
  let run =
    smoothstep(
      0.62,
      0.7,
      fbm(vec2f(s.uv.x * 16.0, s.uv.y * 0.4), s.seed ^ 0x41u, 2),
    ) * fogged;
  // Growth climbs the wall from the gel in a fuzz.
  let climb =
    smoothstep(0.55, 0.3, h + 0.45 * fbm(s.uv * vec2f(2.0, 1.0), 407u, 4));
  let fuzz = climb * (0.6 + 0.4 * valueNoise(s.uv * 140.0, 408u));
  let plastic =
    vec3f(0.46, 0.44, 0.38) * (0.75 + 0.35 * fogged) * (1.0 - 0.35 * run);
  let albedo = mix(plastic, vec3f(0.5, 0.52, 0.4), fuzz);
  let uplit = GEL * 0.9 * exp(-h * 1.5) * (1.0 - 0.7 * fuzz);
  let wall =
    Material(
      albedo,
      uplit,
      mix(0.75, 0.1, max(fuzz, 0.6 * fogged * (1.0 - bead))),
      vec3f(0.0),
    );
  return embossed(s, wall, bead + 0.6 * fuzz - 0.3 * run, 0.005);
}

fn lid(s: Surf) -> Material {
  let bead = beads(s.uv * 0.6, 0.55, 409u);
  let film = fbm(s.uv * 1.2, s.seed ^ 0x42u, 3);
  let plastic = vec3f(0.34, 0.32, 0.27) * (0.7 + 0.5 * film);
  let m =
    Material(
      plastic,
      lampGlow(s, lamps()) * (0.6 + 0.4 * film) * (1.0 - 0.5 * bead),
      0.7 * bead,
      vec3f(0.0),
    );
  return embossed(s, m, bead, 0.012);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return dishWall(s);
    }
    case FLOOR, OWNED: {
      return plate(s);
    }
    case CEILING: {
      return lid(s);
    }
    case TRIM: {
      return polished(vec3f(0.3, 0.29, 0.25), 0.8);
    }
    default: {
      return stuff(s);
    }
  }
}
