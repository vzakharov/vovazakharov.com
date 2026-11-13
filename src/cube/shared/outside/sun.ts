import type { Rgb } from '../lib/colour';
import type { Vec3 } from '../lib/vec';
import { vecf, wgsl } from '../shader/wgsl';
import { lightUnder } from '../sky/sky-light';

const DEGREES = Math.PI / 180;
/**
 * The sun over the horizon, and its bearing from east (+x), positive towards
 * south (+z). The bearing is the line from the pill's plate on floor 1's west
 * wall back through the doorway's middle, so the doorway's light crosses the
 * floor on that diagonal; at this height it ends on the plate.
 */
const ELEVATION = 9 * DEGREES;
const AZIMUTH = -31 * DEGREES;

/** The unit direction towards the sun, which does not move. */
export const SUN_DIR: Vec3 = [
  Math.cos(ELEVATION) * Math.cos(AZIMUTH),
  Math.sin(ELEVATION),
  Math.cos(ELEVATION) * Math.sin(AZIMUTH),
];

const LIT = lightUnder(SUN_DIR);

/**
 * What a white matte face square to the sun would show above the air: the
 * unit the sky's own radiance is counted in.
 */
export const SUN_WHITE = LIT.white;

/** What a white matte face square to the sun shows, in the scene's light. */
export const SUN_LIGHT: Rgb = LIT.sun;

/** What the sky alone puts on a white matte face looking up. */
const SKY_FILL: Rgb = LIT.sky;

/**
 * What the sea and the air under the horizon put on a white matte face
 * looking down.
 */
const GROUND_FILL: Rgb = LIT.ground;

/**
 * What the sky just over the horizon, away from the sun's glare, puts on a
 * white matte face it wholly surrounds: the light on a thing's flank.
 */
const HORIZON_FILL: Rgb = LIT.horizon;

/**
 * `SUN_DIR`, `SUN_LIGHT`, `SKY_FILL`, `GROUND_FILL` and `HORIZON_FILL` as WGSL
 * constants of those names.
 */
export const SUN = wgsl(
  'outside/sun',
  /* wgsl */ `
const SUN_DIR = ${vecf(SUN_DIR)};
const SUN_LIGHT = ${vecf(SUN_LIGHT)};
const SKY_FILL = ${vecf(SKY_FILL)};
const GROUND_FILL = ${vecf(GROUND_FILL)};
const HORIZON_FILL = ${vecf(HORIZON_FILL)};
`,
);
