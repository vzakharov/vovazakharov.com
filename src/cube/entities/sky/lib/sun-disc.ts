import { AIR } from '../model/atmosphere';
import { SUN_DIR, SUN_RADIUS, SUN_WHITE } from '../model/sun';
import { f } from './air';

/**
 * What the disc shows at its middle, in the scene's units. The sun itself is
 * some forty-six thousand times a face it lights; a half float and the bloom
 * both want less, and past this the eye could not tell.
 */
export const DISC_LIGHT = 600;

/**
 * The share of the haze's scattering that goes into the two narrow forward
 * lobes large droplets throw: the glare a degree from the limb, and the
 * aureole ten degrees wide. The broad lobe is the sky table's.
 */
const AUREOLE = [
  { g: 0.99, share: 0.04 },
  { g: 0.95, share: 0.22 },
] as const;

/**
 * The sun as the eye meets it. Needs \`AIR_WGSL\` and its tables.
 */
export const SUN_WGSL = /* wgsl */ `
const SUN_RADIUS = ${f(SUN_RADIUS)};

fn henyey(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// The haze's optical depth for scattering from the eye out along a ray
/// \`lift\` radians over the horizon, by Kasten and Young's air mass.
fn hazeDepth(lift: f32) -> vec3f {
  let degrees = max(lift, 0.0) * 180.0 / PI;
  let mass = 1.0 / (sin(max(lift, 0.0)) + 0.50572 * pow(degrees + 6.07995, -1.6364));
  return MIE * ${f(AIR.mie.height)} * mass;
}

/// The glow close round the sun: the haze's forward lobes, scattered once.
/// Near the sun the way to a droplet and on to the eye is one straight line,
/// so the light is the sun's own through the whole air along \`dir\`.
fn aureole(dir: vec3f, sun: vec3f) -> vec3f {
  let c = dot(dir, sun);
  let lobes = ${AUREOLE.map(({ g, share }) => `${f(share)} * henyey(c, ${f(g)})`).join(' + ')};
  let lift = asin(clamp(dir.y, -1.0, 1.0));
  let reaching = sunTransmittance(EYE_RADIUS, dir.y);
  let glow = ${f(SUN_WHITE * Math.PI)} * lobes * reaching * hazeDepth(lift);
  // Nothing round the disc outshines the disc.
  return glow / (1.0 + max(glow.r, max(glow.g, glow.b)) / ${f(DISC_LIGHT * 0.5)});
}

/// The disc itself: darker and redder to the limb, redder again toward the
/// horizon, where its light has more air to cross. \`edge\` is a pixel's
/// width in radians, which is how soft its rim is drawn.
fn sunDisc(dir: vec3f, sun: vec3f, edge: f32) -> vec3f {
  let away = acos(clamp(dot(dir, sun), -1.0, 1.0));
  let inside = 1.0 - smoothstep(SUN_RADIUS - edge, SUN_RADIUS + edge, away);
  if (inside <= 0.0) { return vec3f(0.0); }
  let across = clamp(away / SUN_RADIUS, 0.0, 1.0);
  let limb = pow(vec3f(sqrt(1.0 - across * across * 0.98)), vec3f(0.40, 0.50, 0.65));
  let reaching = sunTransmittance(EYE_RADIUS, dir.y);
  let middle = sunTransmittance(EYE_RADIUS, ${f(SUN_DIR[1])});
  return ${f(DISC_LIGHT)} * limb * reaching / max(middle.r, 1e-6) * inside;
}
`;
