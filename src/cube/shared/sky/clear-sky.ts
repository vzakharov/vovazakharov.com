import type { Rgb } from '../lib/colour';
import { SUN, SUN_DIR, SUN_WHITE } from '../outside/sun';
import { f32, vecf, wgsl } from '../shader/wgsl';
import {
  ATMOSPHERE,
  extinctionAt,
  perChannel,
  sunTransmittance,
} from './atmosphere';
import { FIT_TERMS, fitSky } from './sky-fit';
import { fitGlance, GLANCE_SUNWARD } from './sky-glance';
import { EYE_RADIUS } from './sky-light';

const FIT = fitSky(SUN_DIR);
const COEFFICIENTS = [...FIT.rayleigh, ...FIT.mie, ...FIT.many];
const PER_PART = FIT_TERMS.lift * FIT_TERMS.turn;
const GLANCE = fitGlance(SUN_DIR);

const SUN_FLAT = Math.hypot(SUN_DIR[0], SUN_DIR[2]);

/** Kilometres over the sea between which `sunThrough` follows the model. */
const SUN_HEIGHTS = [1, 4, 8] as const;

/**
 * The logarithm of the sun's transmittance `h` km up as a parabola through
 * the model's own values at `SUN_HEIGHTS`: its three coefficients, constant
 * first.
 */
const sunLog = ((): readonly [Rgb, Rgb, Rgb] => {
  const [a, b, c] = SUN_HEIGHTS;
  const logs = SUN_HEIGHTS.map((h) =>
    sunTransmittance(ATMOSPHERE.ground + h, SUN_DIR[1]).map((value) =>
      Math.log(value),
    ),
  );
  const at = (i: number, channel: number): number => logs[i]?.[channel] ?? 0;
  // Newton's divided differences, then expanded into powers of h.
  const first = (ch: number) => (at(1, ch) - at(0, ch)) / (b - a);
  const second = (ch: number) =>
    ((at(2, ch) - at(1, ch)) / (c - b) - first(ch)) / (c - a);
  return [
    perChannel((ch) => at(0, ch) - first(ch) * a + second(ch) * a * b),
    perChannel((ch) => first(ch) - second(ch) * (a + b)),
    perChannel(second),
  ];
})();

/** The sun's share reaching the eye, exported for the glow round it, and how its logarithm turns per unit of a ray's sine. */
export const EYE_SUN = sunTransmittance(EYE_RADIUS, SUN_DIR[1]);
const EYE_SUN_SLOPE = ((): Rgb => {
  const step = 0.004;
  const over = sunTransmittance(EYE_RADIUS, SUN_DIR[1] + step);
  const under = sunTransmittance(EYE_RADIUS, SUN_DIR[1] - step);
  return perChannel((c) => Math.log(over[c] / under[c]) / (2 * step));
})();

/** What a metre of the air the eye stands in takes out of a beam. */
const AIR_PER_METRE = extinctionAt(EYE_RADIUS - ATMOSPHERE.ground).map(
  (perKm) => perKm / 1000,
);

/**
 * The air, as the shader knows it:
 *
 * - `clearSky(dir) -> vec3f`, the cloudless sky's radiance along unit `dir`
 *   in the scene's light, the model's own within a few percent; under the
 *   horizon it is the horizon's;
 * - `skyGlance(dir) -> vec3f`, the same sky smoothed, in a few dozen
 *   operations: what a rough mirror or a matte face gathers;
 * - `sunThrough(km) -> vec3f`, what a white face square to the sun shows that
 *   many kilometres over the sea, and `sunSeen(dir) -> vec3f`, the share of the
 *   sun's own light that reaches the eye along a ray near the sun;
 * - `airThrough(metres) -> vec3f`, the share of light that crosses that much
 *   of the air at the sea's level.
 */
export const CLEAR_SKY = wgsl(
  'sky/clear',
  /* wgsl */ `
const PI = ${f32(Math.PI)};
const SKY_FIT = array<vec3f, ${String(COEFFICIENTS.length)}>(
${COEFFICIENTS.map((colour) => `  ${vecf(colour)},`).join('\n')}
);
/// The sun's irradiance above the air, in the scene's light.
const SUN_IRRADIANCE = ${f32(SUN_WHITE * Math.PI)};
const SUN_BEARING = ${vecf([SUN_DIR[0] / SUN_FLAT, SUN_DIR[2] / SUN_FLAT])};
const MIE_G = ${f32(ATMOSPHERE.mie.g)};

fn rayleighPhase(c: f32) -> f32 {
  return 3.0 / (16.0 * PI) * (1.0 + c * c);
}

/// Cornette and Shanks's phase function for asymmetry \`g\` at cosine \`c\`.
fn miePhase(c: f32, g: f32) -> f32 {
  return 3.0 / (8.0 * PI) * (1.0 - g * g) * (1.0 + c * c)
    / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// One part of the fitted sky at a height and a turn, each −1 to 1: a
/// Chebyshev series in the height, by Clenshaw's recurrence, whose
/// coefficients are a series in the turn.
fn skyPart(part: i32, lift: f32, turn: f32) -> vec3f {
  let first = part * ${String(PER_PART)};
  let twice = 2.0 * turn * turn - 1.0;
  var ahead = vec3f(0.0);
  var beyond = vec3f(0.0);
  for (var n = ${String(FIT_TERMS.lift - 1)}; n >= 0; n--) {
    let coefficient = SKY_FIT[first + n]
      + turn * SKY_FIT[first + ${String(FIT_TERMS.lift)} + n]
      + twice * SKY_FIT[first + ${String(2 * FIT_TERMS.lift)} + n];
    if (n == 0) { return exp(coefficient + lift * ahead - beyond); }
    let now = coefficient + 2.0 * lift * ahead - beyond;
    beyond = ahead;
    ahead = now;
  }
  return vec3f(0.0);
}

fn clearSky(dir: vec3f) -> vec3f {
  let lifted = vec3f(dir.x, max(dir.y, 0.0), dir.z);
  let up = lifted / max(length(lifted), 1e-6);
  let lift = 2.0 * pow(up.y, 1.0 / 3.0) - 1.0;
  let flat = length(up.xz);
  let turn = select(1.0, dot(up.xz, SUN_BEARING) / flat, flat > 1e-5);
  let between = dot(up, SUN_DIR);
  return SUN_IRRADIANCE * (
    skyPart(0, lift, turn) * rayleighPhase(between)
    + skyPart(1, lift, turn) * miePhase(between, MIE_G)
    + skyPart(2, lift, turn)
  );
}

const SKY_GLANCE = array<vec3f, ${String(GLANCE.length)}>(
${GLANCE.map((colour) => `  ${vecf(colour)},`).join('\n')}
);

fn skyGlance(dir: vec3f) -> vec3f {
  let lift = 2.0 * pow(max(dir.y, 0.0), 1.0 / 3.0) - 1.0;
  let flat = length(dir.xz);
  let turn = select(1.0, dot(dir.xz, SUN_BEARING) / flat, flat > 1e-5);
  let sunward = pow(max(dot(dir, SUN_DIR), 0.0), ${f32(GLANCE_SUNWARD)});
  return SUN_IRRADIANCE * exp(
    SKY_GLANCE[0] + lift * (SKY_GLANCE[1] + lift * SKY_GLANCE[2])
    + turn * (SKY_GLANCE[3] + lift * (SKY_GLANCE[4] + lift * SKY_GLANCE[5])
      + turn * (SKY_GLANCE[6] + lift * (SKY_GLANCE[7] + lift * SKY_GLANCE[8])))
    + sunward * SKY_GLANCE[9]
  );
}

fn sunThrough(km: f32) -> vec3f {
  return ${f32(SUN_WHITE)} * exp(
    ${vecf(sunLog[0])} + km * (${vecf(sunLog[1])} + km * ${vecf(sunLog[2])})
  );
}

fn sunSeen(dir: vec3f) -> vec3f {
  return ${vecf(EYE_SUN)} * exp(${vecf(EYE_SUN_SLOPE)} * (dir.y - SUN_DIR.y));
}

fn airThrough(metres: f32) -> vec3f {
  return exp(-${vecf(AIR_PER_METRE)} * metres);
}
`,
  SUN,
);
