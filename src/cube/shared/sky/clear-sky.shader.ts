// Generated from clear-sky.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN } from '../outside/sun';
import { wgsl } from '../shader/wgsl';
import { CLEAR_SKY_FIT } from './clear-sky-fit';

export const CLEAR_SKY = wgsl(
  'cube/shared/sky/clear-sky',
  /* wgsl */ `
const PI = 3.141592653589793;

fn rayleighPhase(c: f32) -> f32 {
  return 3.0 / (16.0 * PI) * (1.0 + c * c);
}

/// Cornette and Shanks's phase function for asymmetry \`g\` at cosine \`c\`.
fn miePhase(c: f32, g: f32) -> f32 {
  return
    3.0
      / (8.0 * PI)
      * (1.0 - g * g)
      * (1.0 + c * c)
      / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// The cloudless sky's radiance along unit \`dir\` in the scene's light, the
/// model's own within a few percent; under the horizon it is the horizon's.
fn clearSky(dir: vec3f) -> vec3f {
  let lifted = vec3f(dir.x, max(dir.y, 0.0), dir.z);
  let up = lifted / max(length(lifted), 1e-6);
  let lift = 2.0 * pow(up.y, 1.0 / 3.0) - 1.0;
  let flat = length(up.xz);
  let turn = select(1.0, dot(up.xz, SUN_BEARING) / flat, flat > 1e-5);
  let between = dot(up, SUN_DIR);
  return
    SUN_IRRADIANCE * (skyPart(0, lift, turn) * rayleighPhase(between)
      + skyPart(1, lift, turn) * miePhase(between, MIE_G)
      + skyPart(2, lift, turn));
}

/// The same sky smoothed, in a few dozen operations: what a rough mirror or
/// a matte face gathers.
fn skyGlance(dir: vec3f) -> vec3f {
  let lift = 2.0 * pow(max(dir.y, 0.0), 1.0 / 3.0) - 1.0;
  let flat = length(dir.xz);
  let turn = select(1.0, dot(dir.xz, SUN_BEARING) / flat, flat > 1e-5);
  let sunward = pow(max(dot(dir, SUN_DIR), 0.0), GLANCE_SUNWARD);
  return
    SUN_IRRADIANCE * exp(
      SKY_GLANCE[0]
        + lift * (SKY_GLANCE[1] + lift * SKY_GLANCE[2])
        + turn * (SKY_GLANCE[3]
          + lift * (SKY_GLANCE[4] + lift * SKY_GLANCE[5])
          + turn * (SKY_GLANCE[6] + lift * (SKY_GLANCE[7] + lift * SKY_GLANCE[8])))
        + sunward * SKY_GLANCE[9],
    );
}

/// What a white face square to the sun shows \`km\` kilometres over the sea.
fn sunThrough(km: f32) -> vec3f {
  return
    SUN_WHITE * exp(SUN_LOG_FLAT + km * (SUN_LOG_SLOPE + km * SUN_LOG_CURVE));
}

/// The share of the sun's own light that reaches the eye along a ray near
/// the sun.
fn sunSeen(dir: vec3f) -> vec3f {
  return EYE_SUN * exp(EYE_SUN_SLOPE * (dir.y - SUN_DIR.y));
}

/// The share of light that crosses \`metres\` of the air at the sea's level.
fn airThrough(metres: f32) -> vec3f {
  return exp(-AIR_PER_METRE * metres);
}
`,
  SUN,
  CLEAR_SKY_FIT,
);
