import { f32, vecf, wgsl } from '../lib/wgsl';
import { SUN_DIR, SUN_WHITE } from '../outside/sun';
import { ATMOSPHERE } from './atmosphere';
import { CLEAR_SKY, EYE_SUN } from './clear-sky';

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
  { g: 0.99, share: 0.01 },
  { g: 0.95, share: 0.03 },
] as const;

/** Kasten and Young's air mass along a ray `lift` radians over the horizon. */
const KASTEN = { a: 0.505_72, b: 6.079_95, c: -1.6364 } as const;
const airMass = (lift: number): number =>
  1 /
  (Math.sin(lift) + KASTEN.a * ((lift * 180) / Math.PI + KASTEN.b) ** KASTEN.c);

const BROAD = AUREOLE[1];

/**
 * The broad lobe's glow per unit of its phase function, along the ray to the
 * sun itself: what `sunHalo` spreads round the sun.
 */
const HALO = EYE_SUN.map(
  (reaching, channel) =>
    SUN_WHITE *
    Math.PI *
    BROAD.share *
    reaching *
    (ATMOSPHERE.mie.scatter[channel] ?? 0) *
    ATMOSPHERE.mie.height *
    airMass(Math.asin(SUN_DIR[1])),
);

/**
 * The sun as the eye meets it:
 *
 * - `aureole(dir) -> vec3f`, the glow close round the sun;
 * - `sunHalo(dir) -> vec3f`, that glow's broad lobe alone at the price of
 *   one power, for a mirror too rough to show the rest;
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
  let mass = 1.0 / (sin(max(lift, 0.0)) + ${f32(KASTEN.a)} * pow(degrees + ${f32(KASTEN.b)}, ${f32(KASTEN.c)}));
  return ${vecf(ATMOSPHERE.mie.scatter.map((perKm) => perKm * ATMOSPHERE.mie.height))} * mass;
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

fn sunHalo(dir: vec3f) -> vec3f {
  return ${vecf(HALO)} * henyey(dot(dir, SUN_DIR), ${f32(BROAD.g)});
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
