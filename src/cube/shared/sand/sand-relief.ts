import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { wgsl } from '../lib/wgsl';
import { HASH } from '../lib/wgsl-hash';

/**
 * The sand's small relief, in metres over the island's walked-on shape: the
 * hummocks a foot would not notice and the wind's ripples. The mesh is lifted
 * by it near the eye and the fragment takes its slopes everywhere, so both
 * read these functions at the same ground point.
 */

/** Where the wind blows to, a unit vector on the ground plane (x east, z south). */
export const WIND = [-Math.cos(0.6), -Math.sin(0.6)] as const;

export const RIPPLES = {
  /** Crest to crest, metres. */
  wavelength: 0.085,
  /** Trough to crest, metres, where the ripples stand full. */
  height: 0.0055,
  /** The share of a wavelength the windward face takes; the rest is the lee. */
  stoss: 0.7,
  /** Metres over the sea below which the swash has smoothed them away. */
  from: 0.5,
  full: 0.95,
} as const;

/** Trough to crest of the hummocks, metres. */
const HUMMOCKS = 0.05;

const TURN = 2 * Math.PI;

const hash = pathHash('0');

/** What every per-pixel hash of the sand is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`island/sand/${path}`),
);

export const SAND_RELIEF = wgsl(
  'sand-relief',
  /* wgsl */ `
const SAND_SALT = ${Math.floor(SALT)}u;

/// Smooth noise in [0, 1) with its slope: x the value, yz its gradient in \`p\`.
fn noised(p: vec2f, salt: u32) -> vec3f {
  let cell = vec2i(floor(p));
  let f = fract(p);
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  let du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  let a = unitOf(cellHash(cell, salt));
  let b = unitOf(cellHash(cell + vec2i(1, 0), salt));
  let c = unitOf(cellHash(cell + vec2i(0, 1), salt));
  let d = unitOf(cellHash(cell + vec2i(1, 1), salt));
  let k = a - b - c + d;
  return vec3f(
    a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y,
    du * vec2f(b - a + k * u.y, c - a + k * u.x),
  );
}

/// \`octaves\` of \`noised\`, each turned, twice as fine and half as strong:
/// x in [0, 1), yz the gradient in \`p\`.
fn fbmd(p: vec2f, salt: u32, octaves: i32) -> vec3f {
  let turn = mat2x2f(0.8, 0.6, -0.6, 0.8);
  var sum = vec3f(0.0);
  var weight = 0.5;
  var at = p;
  var back = mat2x2f(1.0, 0.0, 0.0, 1.0);
  for (var octave = 0; octave < octaves; octave++) {
    let n = noised(at, salt + u32(octave));
    sum += weight * vec3f(n.x, back * n.yz);
    at = 2.0 * (turn * at);
    back = 2.0 * (back * transpose(turn));
    weight *= 0.5;
  }
  return sum / (1.0 - 2.0 * weight);
}

/// A height in metres and its slope on the ground plane.
struct Relief {
  height: f32,
  slope: vec2f,
}

/// How much of the dry sand's relief stands at \`h\` metres over the sea: none
/// where the swash runs, all of it on the backshore.
fn sandDryness(h: f32) -> f32 {
  return smoothstep(${RIPPLES.from}, ${RIPPLES.full}, h);
}

/// The hummocks: what feet, rain and wind leave between the dunes.
fn sandHummocks(xz: vec2f, h: f32) -> Relief {
  let broad = fbmd(xz / 2.6, SAND_SALT + 0x51u, 2);
  let close = fbmd(xz / 0.55, SAND_SALT + 0x57u, 3);
  let stand = ${HUMMOCKS} * (0.25 + 0.75 * sandDryness(h));
  return Relief(
    stand * (0.7 * broad.x + 0.3 * close.x - 0.5),
    stand * (0.7 * broad.yz / 2.6 + 0.3 * close.yz / 0.55),
  );
}

/// One train of ripples: x its phase, yz the phase's gradient on the ground.
fn rippleTrain(xz: vec2f, dir: vec2f, wavelength: f32, salt: u32) -> vec3f {
  let k = ${TURN} / wavelength;
  let wander = noised(xz / 0.8, salt);
  let waver = noised(xz / 0.23, salt + 1u);
  // Where crests of two neighbouring runs do not meet, one forks or ends: a
  // step of half a wave across a wandering line.
  let seam = noised(xz / vec2f(0.9, 1.7), salt + 2u);
  // Over metres the crests swing round by tens of degrees and draw apart.
  let bend = noised(xz / 3.1, salt + 3u);
  let fork =smoothstep(0.46, 0.54, seam.x);
  return vec3f(
    k * dot(xz, dir) + 42.0 * bend.x + 5.0 * wander.x + 1.2 * waver.x + 3.1 * fork,
    k * dir + 42.0 * bend.yz / 3.1 + 5.0 * wander.yz / 0.8 + 1.2 * waver.yz / 0.23,
  );
}

/// A ripple's section at \`phase\`: x its height in [0, 1], y the height's
/// slope in phase. The windward face climbs slowly and the lee drops fast.
fn rippleSection(phase: f32) -> vec2f {
  let f = fract(phase / ${TURN});
  let stoss = ${RIPPLES.stoss};
  if (f < stoss) {
    let t = f / stoss;
    return vec2f(0.5 - 0.5 * cos(${Math.PI} * t), 0.5 * sin(${Math.PI} * t) / (2.0 * stoss));
  }
  let t = (1.0 - f) / (1.0 - stoss);
  return vec2f(0.5 - 0.5 * cos(${Math.PI} * t), -0.5 * sin(${Math.PI} * t) / (2.0 * (1.0 - stoss)));
}

/// How much sun reaches a point of a ripple train whose crests stand \`stand\`
/// metres tall, by the crest between it and the sun: 0 in the crest's shadow.
fn rippleSun(train: vec3f, stand: f32, sun: vec3f) -> f32 {
  let run = dot(train.yz, normalize(sun.xz));
  let f = fract(train.x / ${TURN});
  // The share of a wavelength from here to the next crest sunward.
  let ahead = fract(select(f - ${RIPPLES.stoss}, ${RIPPLES.stoss} - f, run > 0.0));
  let rise = stand * (1.0 - rippleSection(train.x).x);
  let ray = ${TURN} * ahead / max(abs(run), 1e-3) * sun.y / length(sun.xz);
  return smoothstep(-0.25, 0.35, (ray - rise) / max(stand, 1e-5));
}

/// The wind's ripples at a ground point \`h\` metres over the sea.
struct Ripples {
  relief: Relief,
  /// 0 in a trough, 1 on a crest.
  crest: f32,
  /// Metres from trough to crest here.
  stand: f32,
  /// 1 in sun, 0 in the shadow of the next crest sunward.
  sun: f32,
}

/// The share of their full height the ripples stand to at \`xz\`: fields of
/// them between stretches the wind has swept smooth.
fn rippleSwathe(xz: vec2f) -> f32 {
  let field = fbmd(xz / 7.0, SAND_SALT + 0x6du, 2).x;
  let within = noised(xz / 2.3, SAND_SALT + 0x6eu).x;
  return smoothstep(0.4, 0.62, field) * (0.45 + 0.55 * within) + 0.03;
}

fn sandRipples(xz: vec2f, h: f32, sun: vec3f) -> Ripples {
  let wind = vec2f(${WIND[0]}, ${WIND[1]});
  let veer = vec2f(wind.x * 0.9336 - wind.y * 0.3584, wind.x * 0.3584 + wind.y * 0.9336);
  let one = rippleTrain(xz, wind, ${RIPPLES.wavelength}, SAND_SALT + 0x61u);
  let other = rippleTrain(xz, veer, ${RIPPLES.wavelength * 1.45}, SAND_SALT + 0x67u);
  let which = smoothstep(0.44, 0.56, noised(xz / 4.3, SAND_SALT + 0x6bu).x);
  let stand = ${RIPPLES.height} * sandDryness(h) * rippleSwathe(xz);
  let a = rippleSection(one.x);
  let b = rippleSection(other.x);
  return Ripples(
    Relief(
      stand * (mix(a.x, b.x, which) - 0.5),
      stand * mix(a.y * one.yz, b.y * other.yz, which),
    ),
    mix(a.x, b.x, which),
    stand,
    mix(rippleSun(one, stand, sun), rippleSun(other, stand, sun), which),
  );
}
`,
  HASH,
);
