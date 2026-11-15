// The micrograph's whole picture: what its rooms are made of, its light, and
// the instrument's frame. `micrograph.ts` holds the rest of the floor.

import package::cube::entities::theme::laboratory::small_world::lib::small_world::{dome, shards};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampGlow, lampReach, cornerShade};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};
import package::cube::entities::theme::kit::lib::honeycomb::honeycomb;
import package::cube::entities::theme::kit::lib::luma::luma;
import package::cube::entities::theme::kit::lib::math::PI;
import package::cube::entities::theme::kit::lib::core::{Surf, Material, Lens, spaced, matte, glowing, embossed, WALL, FLOOR, OWNED, CEILING, TRIM};
import package::cube::shared::shader::hash::{fbm, cellHash, unitOf, hashOf};

/// A diatom's shell: a sieve of pores, each a smaller sieve, between ribs.
fn sieve(s: Surf) -> Material {
  let comb = honeycomb(s.uv / 0.21);
  let pore = dome(comb.xy, 0.4);
  let fine = honeycomb(s.uv / 0.035);
  let near = 1.0 / (1.0 + s.far * s.far / 40.0);
  let pit = dome(fine.xy, 0.36) * near;
  let rib = 1.0 - smoothstep(0.05, 0.09, abs(spaced(s.uv.x, 1.25)));
  let height = (1.0 - pore) * (1.0 - 0.4 * pit) + 0.8 * rib;
  let m = matte(vec3f(0.3 + 0.35 * height));
  return embossed(s, m, height, 0.05);
}

/// A moth's wing: scales in rows like roof tiles, each finely ridged.
fn scales(s: Surf) -> Material {
  let row = s.uv.y / 0.34;
  let shift = 0.5 * f32(i32(floor(row)) & 1);
  let col = s.uv.x / 0.26 + shift;
  let at = vec2f(fract(col) - 0.5, fract(row));
  let word = cellHash(vec2i(floor(vec2f(col, row))), 461u);
  // The scale's free end is its lower one, rounded and a little ragged.
  let tip = at.y - 1.3 * at.x * at.x;
  let under = 1.0 - smoothstep(0.0, 0.02, tip);
  let near = 1.0 / (1.0 + s.far * s.far / 6.0);
  let ridge = 0.5 + 0.5 * near * sin((at.x + 0.02 * unitOf(word)) * 75.0);
  let torn = step(0.93, unitOf(word));
  let height =
    mix((1.0 - 0.7 * tip + 0.12 * ridge) * (1.0 - 0.8 * torn), 0.2, under);
  let m = matte(vec3f(0.16 + 0.3 * height + 0.1 * ridge * (1.0 - under)));
  return embossed(s, m, height, 0.06);
}

/// Grains of metal: each flat, each at its own height, cracked where they meet.
fn grains(s: Surf) -> Material {
  let piece = shards(s.uv * 2.8, 462u);
  let crack = 1.0 - smoothstep(0.0, 0.05, piece.x);
  let etched = fbm(s.uv * 30.0 + piece.y * 20.0, 463u, 3);
  let m =
    glowing(
      vec3f(0.25 + 0.3 * piece.y + 0.1 * etched) * (1.0 - 0.7 * crack),
      lampGlow(s, lamps()),
    );
  return embossed(s, m, piece.z + 0.1 * etched - crack, 0.04);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return scales(s);
    }
    case FLOOR, OWNED: {
      return sieve(s);
    }
    case CEILING: {
      return grains(s);
    }
    case TRIM: {
      // A bundle of fibres, twisted.
      let fibre = 0.5 + 0.5 * sin((s.uv.x + 0.12 * s.uv.y) * 260.0);
      return embossed(s, matte(vec3f(0.3 + 0.3 * fibre)), fibre, 0.01);
    }
    default: {
      let m = stuff(s);
      return
        Material(
          vec3f(luma(m.albedo) + 0.15),
          vec3f(luma(m.emission)),
          0.0,
          m.relief,
        );
    }
  }
}

fn lamps() -> Lamps {
  return Lamps(vec3f(0.5), vec3f(0.02), 2, vec2f(0.5, 0.5), 0.25);
}

/// An electron picture has no lamps: a face is bright for how steeply the
/// beam meets it, so every edge glows, and the room's light only says how
/// much signal the detector gets from there.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let normal = normalize(s.normal + m.relief);
  let edge = 1.0 - abs(dot(normal, s.view));
  let detector = max(dot(normal, normalize(vec3f(0.35, 0.8, 0.45))), 0.0);
  let reach = lampReach(s, s.normal, 0.0, lamps());
  let gain = 0.3 + 0.7 * clamp(reach.z * 0.9, 0.0, 1.0);
  let signal =
    luma(m.albedo)
      * (0.14 + 1.2 * edge * edge + 0.4 * detector)
      * gain
      * cornerShade(s);
  return haze(vec3f(signal) + m.emission, s, AIR, 32.0);
}

/// The frame as the instrument prints it: grey, scanned line by line with
/// each line a little out of step, and a bar of data along the bottom with
/// the scale.
fn themeLens(l: Lens) -> vec3f {
  let row = u32(l.pixel.y);
  let slip = (unitOf(hashOf(row, u32(l.time * 8.0))) - 0.5) * 0.0025;
  let scanned = Lens(l.uv + vec2f(slip, 0.0), l.pixel, l.size, l.time, l.hour);
  let seen = luma(tonemap(through(scanned, 0.35, 0.0) * 1.25));
  let scan = 0.94 + 0.06 * sin(l.pixel.y * PI);
  let shot = grain(l) * 0.07 * (0.4 + seen);
  var grey = seen * scan * vignette(l, 0.25) + shot;
  let bar = step(0.925, l.uv.y);
  let rule =
    step(abs(l.uv.x - 0.82), 0.09) * step(abs(l.uv.y - 0.965), 0.004) + step(
      abs(abs(l.uv.x - 0.82) - 0.09),
      0.0012,
    ) * step(abs(l.uv.y - 0.965), 0.012);
  // Where the readings are printed: blocks the size of letters, in words.
  let glyph =
    vec2f(l.uv.x * l.size.x / (l.size.y * 0.011), (l.uv.y - 0.95) / 0.03);
  let word = floor(glyph.x / 7.0);
  let inked =
    step(0.03, l.uv.x)
      * step(l.uv.x, 0.62)
      * step(0.0, glyph.y)
      * step(glyph.y, 1.0)
      * step(0.25, fract(glyph.x))
      * step(fract(glyph.x / 7.0), 0.8)
      * step(
        0.3,
        unitOf(hashOf(u32(glyph.x), u32(word) + u32(floor(glyph.y * 5.0)))),
      )
      * step(unitOf(hashOf(u32(word), 46u)), 0.75);
  grey = mix(grey, 0.02 + 0.85 * clamp(rule + inked, 0.0, 1.0), bar);
  return vec3f(grey);
}
