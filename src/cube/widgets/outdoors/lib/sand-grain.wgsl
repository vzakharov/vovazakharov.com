// What the sand is made of at the scale of a pixel: its grains, the glints
// off their faces, and the few things a beach carries besides sand. Each is
// drawn at the size it has and fades to its average once a pixel covers
// several, so the beach holds one brightness from 20 cm to the far shore.

import package::cube::entities::island::model::island_ease::sq;
import package::cube::shared::shader::hash::{cellHash, unitOf, mix32};
import super::sand_relief::noised;
import super::sand_relief_numbers::SAND_PI;
import super::sand_salt::SAND_SALT;

/// A grain's width, metres: coarse beach sand.
const GRAIN_WIDTH = 0.0011;

/// The nearest of a unit lattice's points, one in each cell: xy from `p` to
/// it, zw two random numbers of its own in [0, 1).
fn nearestSpeck(p: vec2f, salt: u32) -> vec4f {
  let cell = vec2i(floor(p));
  var nearest = vec4f(8.0, 8.0, 0.0, 0.0);
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let to = vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word))) - p;
      if (dot(to, to) < dot(nearest.xy, nearest.xy)) {
        nearest =
          vec4f(
            to,
            unitOf(mix32(word ^ 0xa5a5a5a5u)),
            unitOf(mix32(word ^ 0x3c3c3c3cu)),
          );
      }
    }
  }
  return nearest;
}

/// What the grains do to the sand at one pixel.
struct Grains {
  /// What the albedo is multiplied by.
  tint: vec3f,
  slope: vec2f,
}

/// The grains at `xz`, where a pixel covers `px` metres of ground: each one
/// drawn near the eye, their speckle further off.
fn sandGrains(xz: vec2f, px: f32) -> Grains {
  var tint = vec3f(1.0);
  var slope = vec2f(0.0);
  let near = 1.0 - smoothstep(0.35, 1.1, px / GRAIN_WIDTH);
  if (near > 0.0) {
    let grain = nearestSpeck(xz / GRAIN_WIDTH, SAND_SALT + 0x71u);
    let kind = grain.z;
    var own = vec3f(0.86 + 0.28 * grain.w);
    if (kind < 0.035) {
      own = vec3f(0.42, 0.37, 0.34);
    } else if (kind > 0.93) {
      own = vec3f(1.3, 1.32, 1.34);
    } else if (kind > 0.75) {
      own = vec3f(1.1, 0.99, 0.85);
    }
    let gap = 1.0 - 0.3 * smoothstep(0.3, 0.62, length(grain.xy));
    tint = mix(tint, own * gap, near);
    slope +=
      near * 0.6 * (vec2f(fract(grain.w * 57.3), fract(grain.z * 113.7)) - 0.5);
  }
  // Past single grains, the speckle of a few to a pixel, then of a handful.
  let size = max(px * 1.6, GRAIN_WIDTH);
  let level = log2(size / GRAIN_WIDTH);
  let lower = floor(level);
  let fine = GRAIN_WIDTH * exp2(lower);
  let blend = level - lower;
  let speckle =
    mix(
      noised(xz / fine, SAND_SALT + 0x73u + u32(lower)),
      noised(xz / (2.0 * fine), SAND_SALT + 0x74u + u32(lower)),
      blend,
    );
  let far = (1.0 - near) / (1.0 + 0.6 * level);
  tint *= 1.0 + far * 0.5 * (speckle.x - 0.5);
  slope += far * 0.55 * speckle.yz;
  return Grains(tint, slope);
}

/// The glint of grain faces that happen to mirror the sun to the eye: 0 where
/// none does. `half` is the unit vector halfway between sun and eye, `px` the
/// metres of ground under a pixel.
fn sandGlint(xz: vec2f, normal: vec3f, half: vec3f, px: f32) -> f32 {
  let size = max(px * 2.0, 0.0015);
  let level = log2(size);
  let lower = floor(level);
  var glint = 0.0;
  for (var step = 0; step < 2; step++) {
    let scale = exp2(lower + f32(step));
    let at = xz / scale;
    let word =
      cellHash(
        vec2i(floor(at)),
        SAND_SALT + 0x79u + u32(i32(lower) + step + 64),
      );
    let lean = 0.6 * (vec2f(unitOf(word), unitOf(mix32(word))) - 0.5);
    let facet = normalize(normal + vec3f(lean.x, 0.0, lean.y));
    let lit = smoothstep(0.996, 0.9996, dot(facet, half));
    let dot_ = 1.0 - smoothstep(0.12, 0.42, length(fract(at) - 0.5));
    let weight = select(level - lower, 1.0 - (level - lower), step == 0);
    glint +=
      weight * lit * dot_ * (0.4 + 1.6 * unitOf(mix32(word ^ 0x5bd1e995u)));
  }
  return glint;
}

/// The beach's litter at one pixel.
struct Litter {
  /// How much of the pixel it covers.
  cover: f32,
  albedo: vec3f,
  slope: vec2f,
  gloss: f32,
  /// 1 where the sun reaches the sand, 0 in a pebble's shadow.
  sun: f32,
}

/// How thickly the sea has strewn a point `h` metres over it: x along the
/// wrack lines high water left, y that and the thin scatter of the foreshore.
fn sandStrewn(xz: vec2f, h: f32) -> vec2f {
  // 0.44 metres over the sea is where the last high water left its line.
  let line = 0.44 + 0.12 * (noised(xz / 7.0, SAND_SALT + 0x83u).x - 0.5);
  let wrack = exp(-sq((h - line) / 0.035));
  let older = 0.35 * exp(-sq((h - line - 0.33) / 0.03));
  let shore = 0.12 * (1.0 - smoothstep(0.5, 1.1, h));
  return
    clamp(vec2f(wrack + older, wrack + older + shore), vec2f(0.0), vec2f(1.0));
}

/// A dried strand of weed seen from a point beside it.
struct Strand {
  /// Metres from the point to the strand's middle line.
  off: f32,
  /// Where along it the nearest of that line is: -1 and 1 its ends.
  along: f32,
  /// Metres across it, signed, and the unit vector that way.
  across: f32,
  side: vec2f,
  /// Its half width there, metres: it thins to a frayed point at each end.
  wide: f32,
}

/// The strand through the middle of a cell, `to` metres from that middle, its
/// lie, length, curl and thickness drawn from the cell's `lot`.
fn weedStrand(to: vec2f, lot: f32) -> Strand {
  let turn = 2.0 * SAND_PI * lot;
  let along = vec2f(cos(turn), sin(turn));
  let side = vec2f(-along.y, along.x);
  let reach = 0.012 + 0.02 * fract(lot * 41.3);
  let u = clamp(dot(to, along), -reach, reach);
  // A bend one way and a kink the other, so no two lie in the same arc.
  let curl = (fract(lot * 17.9) - 0.5) * 26.0;
  let kink = (fract(lot * 29.3) - 0.5) * 1800.0;
  let v =
    dot(to, side) - curl * (u * u - reach * reach * 0.3) - kink * u * u * u;
  let wide =
    (0.0005 + 0.0007 * fract(lot * 23.7)) * (0.2 + 0.8 * (1.0 - sq(u / reach)));
  return Strand(length(vec2f(dot(to, along) - u, v)), u / reach, v, side, wide);
}

/// Shell fragments, a few pebbles and dried weed: sparse everywhere, gathered
/// along the wrack line.
fn sandLitter(xz: vec2f, h: f32, px: f32, sun: vec3f) -> Litter {
  var litter = Litter(0.0, vec3f(0.0), vec2f(0.0), 0.0, 1.0);
  // Past this nothing strewn on the beach is as wide as a pixel.
  if (px > 0.03) {
    return litter;
  }
  let lines = sandStrewn(xz, h);
  let strewn = lines.y;
  let edge = max(px, 0.0004);

  // Shell fragments: pale angular flakes a few millimetres across.
  if (px < 0.02) {
    let shell = nearestSpeck(xz / 0.045, SAND_SALT + 0x85u);
    if (shell.z < 0.1 + 0.85 * strewn) {
      let turn = 2.0 * SAND_PI * shell.w;
      let to = shell.xy * 0.045;
      let along = vec2f(cos(turn), sin(turn));
      let q = vec2f(dot(to, along), dot(to, vec2f(-along.y, along.x)));
      let radius = 0.0015 + 0.0045 * fract(shell.w * 31.7);
      let d = abs(q.x) + 1.7 * abs(q.y) - radius;
      let cover =
        (1.0 - smoothstep(-edge, edge, d)) * (1.0 - smoothstep(
          0.008,
          0.02,
          px,
        ));
      litter.cover = cover;
      litter.albedo =
        mix(
          vec3f(0.78, 0.74, 0.66),
          vec3f(0.62, 0.5, 0.42),
          fract(shell.w * 7.3),
        );
      litter.slope = 0.5 * along * sign(q.x);
      litter.gloss = 0.35;
    }
  }

  // Pebbles: a rounded stone and the long shadow a low sun gives it.
  let pebble = nearestSpeck(xz / 0.8, SAND_SALT + 0x89u);
  if (pebble.z < 0.03 + 0.3 * strewn) {
    let to = -pebble.xy * 0.8;
    let radius = 0.007 + 0.018 * fract(pebble.w * 13.1);
    let d = length(to);
    if (d < radius + edge) {
      let dome = sqrt(max(radius * radius - d * d, 1e-8));
      let cover =
        (1.0 - smoothstep(radius - edge, radius + edge, d)) * (1.0 - smoothstep(
          0.4,
          1.0,
          px / radius,
        ));
      let tone = 0.12 + 0.3 * fract(pebble.w * 91.7);
      litter.albedo = mix(litter.albedo, tone * vec3f(1.0, 0.95, 0.88), cover);
      litter.slope = mix(litter.slope, -0.7 * to / dome, cover);
      litter.gloss = mix(litter.gloss, 0.2, cover);
      litter.cover = max(litter.cover, cover);
    }
    let away = -normalize(sun.xz);
    let reach = 0.7 * radius * length(sun.xz) / sun.y;
    let t = clamp(dot(to, away) / reach, 0.0, 1.0);
    let off = length(to - away * reach * t) - radius * (1.0 - 0.7 * t);
    litter.sun =
      mix(
        smoothstep(-edge, edge + 0.004 * t, off),
        1.0,
        smoothstep(0.4, 1.0, px / radius),
      );
  }

  // Dried weed: dark curled strands, in clumps, along the wrack lines.
  if (px < 0.012 && lines.x > 0.03) {
    let clump =
      smoothstep(0.4, 0.62, noised(xz / 0.7, SAND_SALT + 0x8bu).x) * lines.x;
    let strand = nearestSpeck(xz / 0.03, SAND_SALT + 0x8du);
    if (strand.z < 0.9 * clump) {
      let to = -strand.xy * 0.03;
      let near = 1.0 - smoothstep(0.004, 0.012, px);
      let body = weedStrand(to, strand.w);
      // A strand thinner than a pixel covers only its share of it.
      let cover =
        (1.0 - smoothstep(body.wide, body.wide + edge, body.off))
          * min(1.0, 2.8 * body.wide / edge)
          * near;
      // Bleached straw to nearly black, and no one strand a single tone.
      let bleached = sq(fract(strand.w * 67.1));
      let tone =
        mix(
          vec3f(0.07, 0.05, 0.03),
          vec3f(0.3, 0.22, 0.11),
          bleached,
        ) * (0.8 + 0.3 * sin(9.0 * body.along + 40.0 * strand.w));
      litter.albedo = mix(litter.albedo, tone, cover);
      // Round in section, so the low sun lights one side of it.
      litter.slope =
        mix(
          litter.slope,
          -1.2 * body.side * clamp(body.across / body.wide, -1.0, 1.0),
          cover,
        );
      litter.gloss = mix(litter.gloss, 0.0, cover);
      litter.cover = max(litter.cover, cover);
      // Lying on the sand, it lays its shadow beside itself: the longer the
      // lower the sun, up to where the grains it falls across break it up.
      let toSun =
        normalize(sun.xz) * min(
          2.0 * body.wide * length(sun.xz) / sun.y,
          3.5 * body.wide + 0.001,
        );
      var shade = 0.0;
      for (var step = 1.0; step <= 3.0; step += 1.0) {
        let thrown = weedStrand(to + toSun * step / 3.0, strand.w);
        shade =
          max(
            shade,
            1.0 - smoothstep(
              thrown.wide,
              thrown.wide + edge + 0.0006 * step,
              thrown.off,
            ),
          );
      }
      litter.sun = min(litter.sun, 1.0 - 0.6 * shade * near * (1.0 - cover));
    }
  }
  return litter;
}
