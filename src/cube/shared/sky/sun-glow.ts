import { f32, vecf, wgsl } from '../lib/wgsl';
import { SUN_WHITE } from '../outside/sun';
import { AIR } from './atmosphere';
import { CLEAR_SKY } from './clear-sky';

const SUN_RADIUS = (0.2666 * Math.PI) / 180;

/**
 * What the disc shows at its middle, in the scene's units. The sun itself is
 * some forty-six thousand times a face it lights; a half float and the bloom
 * both want less, and past this the eye could not tell.
 */
export const DISC_LIGHT = 600;

/**
 * The share of the haze's scattering that goes into the two narrow forward
 * lobes large droplets throw: the glare a degree from the limb, and the
 * aureole ten degrees wide. The broad lobe is the fitted sky's.
 */
const AUREOLE = [
  { g: 0.99, share: 0.02 },
  { g: 0.95, share: 0.06 },
] as const;

/**
 * The sun as the eye meets it:
 *
 * - `aureole(dir) -> vec3f`, the glow close round the sun;
 * - `sunDisc(dir, edge) -> vec3f`, the disc itself, `edge` a pixel's width in
 *   radians.
 */
export const SUN_GLOW = wgsl(
  'sky/sun-glow',
  /* wgsl */ `
const SUN_RADIUS = ${f32(SUN_RADIUS)};

fn henyey(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// The haze's optical depth for scattering from the eye out along a ray
/// \`lift\` radians over the horizon, by Kasten and Young's air mass.
fn hazeDepth(lift: f32) -> vec3f {
  let degrees = max(lift, 0.0) * 180.0 / PI;
  let mass = 1.0 / (sin(max(lift, 0.0)) + 0.50572 * pow(degrees + 6.07995, -1.6364));
  return ${vecf(AIR.mie.scatter.map((perKm) => perKm * AIR.mie.height))} * mass;
}

/// The haze's forward lobes, scattered once. Near the sun the way to a
/// droplet and on to the eye is one straight line, so the light is the sun's
/// own through the whole air along \`dir\`.
fn aureole(dir: vec3f) -> vec3f {
  let c = dot(dir, SUN_DIR);
  let lobes = ${AUREOLE.map(({ g, share }) => `${f32(share)} * henyey(c, ${f32(g)})`).join(' + ')};
  let lift = asin(clamp(dir.y, -1.0, 1.0));
  let glow = ${f32(SUN_WHITE * Math.PI)} * lobes * sunSeen(dir) * hazeDepth(lift);
  // Nothing round the disc outshines the disc.
  return glow / (1.0 + max(glow.r, max(glow.g, glow.b)) / ${f32(DISC_LIGHT * 0.5)});
}

/// Darker and redder to the limb, redder again toward the horizon, where its
/// light has more air to cross.
fn sunDisc(dir: vec3f, edge: f32) -> vec3f {
  let away = acos(clamp(dot(dir, SUN_DIR), -1.0, 1.0));
  let inside = 1.0 - smoothstep(SUN_RADIUS - edge, SUN_RADIUS + edge, away);
  if (inside <= 0.0) { return vec3f(0.0); }
  let across = clamp(away / SUN_RADIUS, 0.0, 1.0);
  let limb = pow(vec3f(sqrt(1.0 - across * across * 0.98)), vec3f(0.40, 0.50, 0.65));
  let reaching = sunSeen(dir);
  return ${f32(DISC_LIGHT)} * limb * reaching / max(sunSeen(SUN_DIR).r, 1e-6) * inside;
}
`,
  CLEAR_SKY,
);
