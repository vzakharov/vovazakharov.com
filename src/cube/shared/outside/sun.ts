import type { Rgb } from '../lib/colour';
import type { Vec3 } from '../lib/vec';
import { vecf, wgsl } from '../lib/wgsl';

const DEGREES = Math.PI / 180;
/** The sun over the horizon, and its bearing from east (+x) towards south (+z). */
const ELEVATION = 9 * DEGREES;
const AZIMUTH = 8 * DEGREES;

/** The unit direction towards the sun, which does not move. */
export const SUN_DIR: Vec3 = [
  Math.cos(ELEVATION) * Math.cos(AZIMUTH),
  Math.sin(ELEVATION),
  Math.cos(ELEVATION) * Math.sin(AZIMUTH),
];

/** What a white matte face square to the sun shows, in the scene's light. */
export const SUN_LIGHT: Rgb = [8, 4.96, 2.64];

/** What the sky alone puts on a white matte face looking up. */
export const SKY_FILL: Rgb = [1.9, 2.5, 3.4];

/** `SUN_DIR`, `SUN_LIGHT` and `SKY_FILL` as WGSL constants of those names. */
export const SUN = wgsl(
  'outside/sun',
  /* wgsl */ `
const SUN_DIR = ${vecf(SUN_DIR)};
const SUN_LIGHT = ${vecf(SUN_LIGHT)};
const SKY_FILL = ${vecf(SKY_FILL)};
`,
);
