import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, glowing, embossed, repeated, spaced, Lens};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash, valueNoise, worley};
import package::cube::entities::theme::kit::lib::finish::{band, tiling, carpet};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, roundBox, spun, oneOf};

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.75, 0.42, 1.5),
      vec3f(0.012, 0.004, 0.022),
      2,
      vec2f(0.34, 0.34),
      0.12,
    );
}

fn neon(u: f32) -> vec3f {
  return
    oneOf(
      u,
      vec3f(1.0, 0.04, 0.55),
      vec3f(0.03, 0.75, 1.0),
      vec3f(1.0, 0.8, 0.06),
      vec3f(0.25, 1.0, 0.15),
    );
}

/// The carpet's shapes: a squiggle, a triangle, a ring or a zigzag to a
/// cell, each turned its own way.
fn confetti(s: Surf) -> Material {
  let size = 0.42;
  let word = cellHash(vec2i(floor(s.uv / size)), 225u);
  let p = spun(repeated(s.uv, vec2f(size)), unitOf(word) * 6.2832);
  let which = unitOf(mix32(word)) * 4.0;
  var d = abs(length(p) - 0.07) - 0.011;
  if (which < 1.0) {
    d = max(abs(p.y - 0.03 * sin(p.x * 48.0)) - 0.011, abs(p.x) - 0.15);
  } else if (which < 2.0) {
    d = abs(max(abs(p.x) * 0.866 + p.y * 0.5, -p.y) - 0.065) - 0.009;
  } else if (which < 3.0) {
    d =
      max(
        abs(p.y - (abs(fract(p.x * 11.0) - 0.5) - 0.25) * 0.11) - 0.011,
        abs(p.x) - 0.15,
      );
  }
  let fleck = worley(s.uv * 11.0, 226u);
  let speck = inside(fleck.x / 11.0 - 0.011) * step(0.55, fleck.y);
  let ink = max(inside(d), speck);
  let colour =
    neon(
      select(
        unitOf(mix32(word ^ 0x5u)),
        fleck.y * 2.2 - 1.2,
        speck > inside(d),
      ),
    );
  let pile = valueNoise(s.uv * 240.0, 11u);
  let ground = carpet(s, vec3f(0.012, 0.011, 0.045));
  let dyed = mix(ground, colour * (0.3 + 0.2 * pile), ink);
  return embossed(s, glowing(dyed, colour * (0.07 * ink)), pile, 0.0015);
}

/// A carpeted wall with a tube of neon along its head and its foot, each
/// length of tube its own: lit, dead or trying.
fn tubed(s: Surf) -> Material {
  let h = s.p.y;
  let rib = valueNoise(vec2f(s.uv.x * 170.0, h * 6.0), 227u);
  let cloth = vec3f(0.02, 0.011, 0.04) * (0.6 + 0.6 * rib);
  let run = 1.25;
  let word = hashOf(bitcast<u32>(i32(floor(s.uv.x / run))), 228u);
  let luck = unitOf(word);
  let trying = step(0.35, unitOf(hashOf(word, u32(s.time * 9.0))));
  let live = select(select(1.0, trying, luck < 0.2), 0.0, luck < 0.08);
  // A tube stops short of its holders at either end.
  let held = step(0.04, run * 0.5 - abs(spaced(s.uv.x, run)));
  let pink = vec3f(1.0, 0.05, 0.5);
  let cyan = vec3f(0.03, 0.7, 1.0);
  let head = band(h, 1.95, 0.022) * held;
  let foot = band(h, 0.2, 0.022) * held;
  let wash = pink * exp(-abs(h - 1.95) * 6.0) + cyan * exp(-abs(h - 0.2) * 6.0);
  let glow = (pink * head + cyan * foot) * 5.0 + (cloth + 0.012) * wash * 2.4;
  return
    embossed(s, Material(cloth, glow * live, 0.05, vec3f(0.0)), rib, 0.002);
}

/// Black tiles with points of fibre-optic light let into them.
fn starred(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.02, 4u);
  let black = vec3f(0.018, 0.016, 0.03) * (0.7 + 0.3 * tile.y);
  let point = worley(s.uv * 13.0, 229u);
  let twinkle =
    0.6 + 0.4 * sin(s.time * (1.0 + 3.0 * point.y) + point.y * 40.0);
  let star = inside(point.x / 13.0 - 0.004) * step(0.78, point.y) * twinkle;
  let glow = lampGlow(s, lamps()) + neon(point.y * 4.5 - 3.5) * (1.6 * star);
  return
    embossed(
      s,
      glowing(mix(vec3f(0.05, 0.045, 0.07), black, tile.x), glow),
      tile.x,
      0.006,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return tubed(s);
    }
    case FLOOR, OWNED: {
      return confetti(s);
    }
    case CEILING: {
      return starred(s);
    }
    case TRIM: {
      return polished(vec3f(0.02, 0.02, 0.03), 0.6);
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, 30.0);
}

/// The frame on a picture tube: its glass bowed, its lines and its triads
/// of phosphor showing, a brighter bar rolling down it.
fn themeLens(l: Lens) -> vec3f {
  let off = l.uv - 0.5;
  let bowed = l.uv + off * dot(off, off) * 0.14;
  let tube = Lens(bowed, l.pixel, l.size, l.time, l.hour);
  let seen = through(tube, 0.5, 0.012) * 2.2;
  let line = 0.78 + 0.22 * cos(l.pixel.y * 2.0944);
  let triad = u32(l.pixel.x) % 3u;
  let mask =
    vec3f(
      select(0.78, 1.12, triad == 0u),
      select(0.78, 1.12, triad == 1u),
      select(0.78, 1.12, triad == 2u),
    );
  let roll =
    1.0 + 0.07 * smoothstep(
      0.08,
      0.0,
      abs(fract(l.uv.y - l.time * 0.11) - 0.5),
    );
  let edge = roundBox(bowed - 0.5, vec2f(0.5), 0.03);
  let glass = 1.0 - smoothstep(-0.012, 0.0, edge);
  return
    (tonemap(seen) * line * mask * roll * vignette(l, 0.45) + grain(
      l,
    ) * 0.03) * glass;
}
