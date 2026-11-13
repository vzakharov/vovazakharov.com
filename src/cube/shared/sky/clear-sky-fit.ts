import type { Rgb } from '../lib/colour';
import { SUN_DIR, SUN_WHITE } from '../outside/sun';
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
 * What the model works out for the clear sky in `clear-sky.wgsl`, as WGSL:
 * the fitted sky's coefficients and `skyPart(part, lift, turn) -> vec3f`,
 * which sums one part of them; the smoothed sky's; the sun's light, bearing
 * and haze; the parabola `sunThrough` follows; the sun's share reaching the
 * eye and its slope; and what a metre of the air takes out of a beam.
 */
export const CLEAR_SKY_FIT = wgsl(
  'sky/clear-sky-fit',
  /* wgsl */ `
const SKY_FIT = array<vec3f, ${String(COEFFICIENTS.length)}>(
${COEFFICIENTS.map((colour) => `  ${vecf(colour)},`).join('\n')}
);
/// The sun's irradiance above the air, in the scene's light.
const SUN_IRRADIANCE = ${f32(SUN_WHITE * Math.PI)};
const SUN_WHITE = ${f32(SUN_WHITE)};
const SUN_BEARING = ${vecf([SUN_DIR[0] / SUN_FLAT, SUN_DIR[2] / SUN_FLAT])};
const MIE_G = ${f32(ATMOSPHERE.mie.g)};

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

const SKY_GLANCE = array<vec3f, ${String(GLANCE.length)}>(
${GLANCE.map((colour) => `  ${vecf(colour)},`).join('\n')}
);
const GLANCE_SUNWARD = ${f32(GLANCE_SUNWARD)};

/// The logarithm of the sun's transmittance \`km\` up: its constant, linear
/// and square coefficients.
const SUN_LOG_FLAT = ${vecf(sunLog[0])};
const SUN_LOG_SLOPE = ${vecf(sunLog[1])};
const SUN_LOG_CURVE = ${vecf(sunLog[2])};

const EYE_SUN = ${vecf(EYE_SUN)};
const EYE_SUN_SLOPE = ${vecf(EYE_SUN_SLOPE)};
const AIR_PER_METRE = ${vecf(AIR_PER_METRE)};
`,
);
