import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, polished, glowing, embossed, Lens};
import package::cube::shared::shader::hash::{mix32, unitOf, cellHash, valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::band;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampReach, cornerShade, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, stroke, spun, oneOf};

const KERB_ORANGE = vec3f(1.0, 0.3, 0.02);
const UNLIT_BLACK = vec3f(0.006, 0.005, 0.012);

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.34, 0.1, 1.1),
      vec3f(0.004, 0.002, 0.012),
      2,
      vec2f(0.1, 1.2),
      0.05,
    );
}

fn dayglo(u: f32) -> vec3f {
  return
    oneOf(
      u,
      vec3f(1.0, 0.05, 0.5),
      vec3f(0.05, 0.8, 1.0),
      vec3f(1.0, 0.75, 0.03),
      vec3f(0.35, 1.0, 0.1),
    );
}

/// Turf: a fairway winding between orange kerbs, a cup in it now and then
/// with a white ring round it, rough either side.
fn turf(s: Surf) -> Material {
  let blade = valueNoise(s.uv * 300.0, 321u);
  let lie = fbm(s.uv * 0.4, 322u, 3) - 0.5;
  let fairway = inside(abs(lie) - 0.05);
  let kerb = stroke(abs(lie) - 0.058, 0.012);
  let spot = worley(s.uv * 0.45, 323u);
  let cup = inside(spot.x / 0.45 - 0.054) * fairway;
  let ring = stroke(spot.x / 0.45 - 0.16, 0.02) * fairway;
  var colour =
    mix(
      vec3f(0.012, 0.016, 0.03),
      vec3f(0.07, 0.5, 0.08),
      fairway,
    ) * (0.6 + 0.6 * blade);
  colour = mix(colour, KERB_ORANGE, kerb);
  colour = mix(colour, vec3f(0.6, 0.62, 0.7), ring);
  colour = mix(colour, vec3f(0.0), cup);
  return embossed(s, matte(colour), blade + 6.0 * kerb - 8.0 * cup, 0.002);
}

/// One thing of the night sky, painted about the middle of its cell.
fn body(p: vec2f, which: f32) -> f32 {
  let r = length(p);
  let a = atan2(p.y, p.x);
  if (which < 1.0) {
    let ringed =
      stroke(
        length(vec2f(p.x + p.y * 0.3, (p.y - p.x * 0.3) * 3.2)) - 0.33,
        0.035,
      );
    return
      max(
        inside(r - 0.19) * (0.55 + 0.45 * step(
          0.0,
          sin(p.y * 46.0 + 2.0 * p.x),
        )),
        ringed,
      );
  }
  if (which < 2.0) {
    return inside(r - (0.07 + 0.09 * pow(abs(cos(a * 2.5)), 3.0)));
  }
  if (which < 3.0) {
    return
      stroke(fract(log(max(r, 0.01)) * 1.3 + a / 6.2832) - 0.5, 0.3) * inside(
        r - 0.3,
      ) + inside(r - 0.04);
  }
  if (which < 4.0) {
    return
      inside(r - 0.18) * (1.0 - inside(length(p - vec2f(0.08, 0.04)) - 0.16));
  }
  let tail =
    inside(abs(p.y + p.x * 0.4) - 0.045 * smoothstep(0.35, -0.1, p.x))
      * step(-0.1, p.x)
      * step(p.x, 0.35);
  return max(inside(length(p + vec2f(0.1, -0.04)) - 0.06), 0.6 * tail);
}

/// A black wall with planets, stars, galaxies, moons and comets on it, and
/// a spatter of small stars between.
fn cosmos(s: Surf) -> Material {
  let size = vec2f(1.25, 1.1);
  let at = vec2f(s.uv.x, s.p.y + 0.2) / size;
  let word = cellHash(vec2i(floor(at)), 324u);
  let p = spun((fract(at) - 0.5) * size, (unitOf(word) - 0.5) * 0.9);
  let shape =
    body(p, unitOf(mix32(word)) * 6.0) * step(unitOf(mix32(word)), 0.84);
  let star = worley(vec2f(s.uv.x, s.p.y) * 14.0, 325u);
  let spatter =
    inside(star.x / 14.0 - 0.003 - 0.007 * star.y * star.y) * step(
      0.72,
      star.y,
    );
  let brush = 0.75 + 0.35 * valueNoise(vec2f(s.uv.x, s.p.y) * 60.0, 326u);
  let paint =
    dayglo(unitOf(mix32(word ^ 0x11u))) * shape * brush + dayglo(
      star.y * 3.0 - 2.0,
    )
      * spatter
      * (1.0 - shape);
  let kerb = band(s.p.y, 0.06, 0.12);
  return polished(mix(UNLIT_BLACK + 0.6 * paint, KERB_ORANGE, kerb), 0.1);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return cosmos(s);
    }
    case FLOOR, OWNED: {
      return turf(s);
    }
    case CEILING: {
      let star = worley(s.uv * 10.0, 327u);
      let spatter =
        inside(star.x / 10.0 - 0.004 - 0.008 * star.y * star.y) * step(
          0.8,
          star.y,
        );
      return
        glowing(
          UNLIT_BLACK + 0.6 * dayglo(star.y * 4.0 - 3.0) * spatter,
          lampGlow(s, lamps()),
        );
    }
    case TRIM: {
      let stripe = step(0.5, fract(s.p.y / 0.3));
      return polished(mix(vec3f(0.01), KERB_ORANGE, stripe), 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}

/// The room under black light: what little the tubes show of it, and every
/// vivid paint shining back far more than it was given.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let lit = roomLight(s, m, lamps());
  let reach = lampReach(s, normalize(s.normal + m.relief), 0.0, lamps());
  let top = max(m.albedo.r, max(m.albedo.g, m.albedo.b));
  let vivid =
    (top - min(m.albedo.r, min(m.albedo.g, m.albedo.b))) / max(top, 0.001);
  let shine =
    m.albedo * (vivid
      * vivid
      * (reach.x + 0.5 * reach.z)
      * 2.6
      * cornerShade(s));
  return haze(lit + shine, s, AIR, 45.0);
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.45, 0.007) * 1.5;
  return tonemap(seen) * vignette(l, 0.45) + grain(l) * 0.02;
}
