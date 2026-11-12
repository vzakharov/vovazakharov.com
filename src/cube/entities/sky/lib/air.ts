import type { Rgb } from '@/cube/shared/lib/colour';

import {
  AIR,
  SCATTER_SIZE,
  SCATTER_SUN,
  TRANSMITTANCE_SIZE,
} from '../model/atmosphere';
import { EYE_RADIUS } from '../model/sky-light';

/** `rgb` as a WGSL `vec3f`, with the digits a per-kilometre coefficient needs. */
export const vec3 = (rgb: Rgb | readonly number[]): string =>
  `vec3f(${rgb.map((channel) => channel.toPrecision(7)).join(', ')})`;

/** A number as a WGSL float literal. */
export const f = (x: number): string =>
  Number.isInteger(x) ? x.toFixed(1) : x.toPrecision(8);

/**
 * The atmosphere as the shaders read it: `model/atmosphere.ts`'s constants
 * and its two tables, with the lookups written the way the model writes
 * them. A shader taking this piece declares `transmittanceTable`,
 * `scatterTable` and `tableSampler` (linear, clamped) itself.
 */
export const AIR_WGSL = /* wgsl */ `
const RG = ${f(AIR.ground)};
const RT = ${f(AIR.top)};
const EYE_RADIUS = ${f(EYE_RADIUS)};
const PI = 3.14159265358979;
const RAYLEIGH = ${vec3(AIR.rayleigh.scatter)};
const MIE = ${vec3(AIR.mie.scatter)};
const MIE_ABSORB = ${vec3(AIR.mie.absorb)};
const OZONE = ${vec3(AIR.ozone.absorb)};
const SEA_ALBEDO = ${vec3(AIR.albedo)};
const MIE_G = ${f(AIR.mie.g)};

struct Air { rayleigh: vec3f, mie: vec3f, extinction: vec3f };

/// What a kilometre of air \`h\` km up scatters, by kind, and takes out in all.
fn airAt(h: f32) -> Air {
  let rayleigh = RAYLEIGH * exp(-h / ${f(AIR.rayleigh.height)});
  let haze = exp(-h / ${f(AIR.mie.height)});
  let ozone = max(0.0, 1.0 - abs(h - ${f(AIR.ozone.centre)}) / ${f(AIR.ozone.half)});
  return Air(rayleigh, MIE * haze, rayleigh + (MIE + MIE_ABSORB) * haze + OZONE * ozone);
}

fn toTop(r: f32, mu: f32) -> f32 {
  return -r * mu + sqrt(max(0.0, r * r * (mu * mu - 1.0) + RT * RT));
}

/// Kilometres to the ground along the ray, negative where it misses.
fn toGround(r: f32, mu: f32) -> f32 {
  let under = r * r * (mu * mu - 1.0) + RG * RG;
  if (mu >= 0.0 || under < 0.0) { return -1.0; }
  return -r * mu - sqrt(under);
}

fn tableUv(uv: vec2f, size: vec2f) -> vec2f {
  return (clamp(uv, vec2f(0.0), vec2f(1.0)) * (size - 1.0) + 0.5) / size;
}

/// The share of the sun's light reaching radius \`r\` when its cosine there is \`mu\`.
fn sunTransmittance(r: f32, mu: f32) -> vec3f {
  if (toGround(r, mu) >= 0.0) { return vec3f(0.0); }
  let reach = sqrt(RT * RT - RG * RG);
  let rho = sqrt(max(0.0, r * r - RG * RG));
  let least = RT - r;
  let uv = vec2f((toTop(r, mu) - least) / (rho + reach - least), rho / reach);
  let size = vec2f(${f(TRANSMITTANCE_SIZE.width)}, ${f(TRANSMITTANCE_SIZE.height)});
  return textureSampleLevel(transmittanceTable, tableSampler, tableUv(uv, size), 0.0).rgb;
}

/// Every order of scattering past the first at radius \`r\`, per unit of sun irradiance.
fn manyScattered(r: f32, mu: f32) -> vec3f {
  let uv = vec2f(
    (mu - ${f(SCATTER_SUN.low)}) / ${f(SCATTER_SUN.high - SCATTER_SUN.low)},
    sqrt(clamp((r - RG) / (RT - RG), 0.0, 1.0)),
  );
  let size = vec2f(${f(SCATTER_SIZE.width)}, ${f(SCATTER_SIZE.height)});
  return textureSampleLevel(scatterTable, tableSampler, tableUv(uv, size), 0.0).rgb;
}

fn rayleighPhase(c: f32) -> f32 {
  return 3.0 / (16.0 * PI) * (1.0 + c * c);
}

/// Cornette and Shanks's phase function for asymmetry \`g\` at cosine \`c\`.
fn miePhase(c: f32, g: f32) -> f32 {
  return 3.0 / (8.0 * PI) * ((1.0 - g * g) * (1.0 + c * c))
    / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// What the matte sea sends up under a unit sun at cosine \`mu\`.
fn groundGlow(mu: f32) -> vec3f {
  return SEA_ALBEDO * sunTransmittance(RG, mu) * max(0.0, mu) / PI;
}
`;
