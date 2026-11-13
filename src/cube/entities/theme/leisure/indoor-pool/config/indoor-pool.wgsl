import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, embossed, Lens};
import package::cube::shared::shader::hash::{valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, tiling, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampReach, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};
import package::cube::entities::theme::leisure::shape::lib::shape::caustics;

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(1.05, 1.22, 1.22),
      vec3f(0.008, 0.013, 0.014),
      2,
      vec2f(1.0, 1.0),
      0.05,
    );
}

/// The water's height at a point of its surface, 0 to about 1.5.
fn ripple(p: vec2f, t: f32) -> f32 {
  return
    fbm(p * 1.5 + vec2f(t * 0.21, t * 0.13), 211u, 3) + 0.5 * fbm(
      p * 4.3 - vec2f(t * 0.3, -t * 0.17),
      215u,
      2,
    );
}

/// The pool's floor seen through a hand's depth of moving water.
fn water(s: Surf) -> Material {
  let depth = 0.3;
  let bent = refract(s.view, vec3f(0.0, 1.0, 0.0), 0.75);
  let sink = max(-bent.y, 0.2);
  let wobble =
    vec2f(
      valueNoise(s.uv * 5.0 + s.time * 0.4, 216u),
      valueNoise(s.uv * 5.0 - s.time * 0.35, 217u),
    ) - 0.5;
  let at = s.uv + bent.xz / sink * depth + wobble * 0.05;
  let tile = tiling(at, 0.1, 0.008, 212u);
  let lane = band(fract(at.x / 2.5) * 2.5, 1.25, 0.2);
  let pale = vec3f(0.5, 0.63, 0.62) * (0.9 + 0.1 * tile.y);
  let laid =
    mix(
      vec3f(0.2, 0.26, 0.27),
      mix(pale, vec3f(0.015, 0.04, 0.11), lane),
      tile.x,
    );
  let lit = laid * (0.7 + 1.3 * caustics(at, s.time));
  let seen = lit * exp(-(depth / sink) * vec3f(1.5, 0.3, 0.22));
  return embossed(s, polished(seen, 0.92), ripple(s.uv, s.time), 0.022);
}

fn tiled(s: Surf, size: f32) -> Material {
  let tile = tiling(s.uv, size, 0.006, 213u);
  let h = s.p.y;
  let upright = abs(s.normal.y) < 0.5;
  let stripe = select(0.0, band(h, 1.25, 0.2) + band(h, 0.05, 0.1), upright);
  let white = vec3f(0.6, 0.65, 0.63) * (0.88 + 0.12 * tile.y);
  let blue = vec3f(0.025, 0.15, 0.3) * (0.7 + 0.5 * tile.y);
  let scale =
    select(
      0.0,
      exp(-h / 0.14) * fbm(vec2f(s.uv.x * 6.0, h * 2.0), 214u, 3),
      upright,
    );
  let grout = vec3f(0.3, 0.33, 0.31) * (1.0 - 0.6 * damp(s));
  let glazed =
    mix(
      mix(white, blue, clamp(stripe, 0.0, 1.0)),
      vec3f(0.45, 0.4, 0.28),
      0.7 * scale,
    );
  let wall = polished(mix(grout, glazed, tile.x), 0.8 * tile.x * (1.0 - scale));
  return embossed(s, wall, tile.x * (1.0 + 0.4 * tile.y), 0.002);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL, TRIM: {
      return tiled(s, 0.1);
    }
    case FLOOR, OWNED: {
      return water(s);
    }
    case CEILING: {
      let m = tiled(s, 0.2);
      return Material(m.albedo, lampGlow(s, lamps()), m.gloss * 0.4, m.relief);
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  var colour = roomLight(s, m, lamps());
  if (s.kind == WALL || s.kind == TRIM || s.kind == CEILING) {
    let up = s.kind == CEILING;
    let air = lampReach(s, s.normal, 0.0, lamps()).z;
    let at = select(vec2f(s.uv.x, s.p.y * 1.4), s.uv * 0.8, up);
    let fall = select(exp(-s.p.y / 0.9), 0.22, up);
    colour +=
      m.albedo * lamps().colour * (air * fall * 0.55 * caustics(at, s.time));
  }
  return haze(colour, s, AIR, 32.0);
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.2, 0.005) * 1.05;
  return tonemap(seen) * vignette(l, 0.3) + grain(l) * 0.012;
}
