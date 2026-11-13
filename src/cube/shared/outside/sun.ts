import type { Rgb } from '../lib/colour';
import type { Vec3 } from '../lib/vec';
import { vecf, wgsl } from '../lib/wgsl';

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

/** What a white matte face square to the sun shows, in the scene's light. */
export const SUN_LIGHT: Rgb = [8, 4.96, 2.64];

/**
 * What the sky alone puts on a white matte face looking up: about the sun's own
 * share on flat ground, as under a clear sky with the sun this low.
 */
export const SKY_FILL: Rgb = [0.65, 0.87, 1.2];

/** `SUN_DIR`, `SUN_LIGHT` and `SKY_FILL` as WGSL constants of those names. */
export const SUN = wgsl(
  'outside/sun',
  /* wgsl */ `
const SUN_DIR = ${vecf(SUN_DIR)};
const SUN_LIGHT = ${vecf(SUN_LIGHT)};
const SKY_FILL = ${vecf(SKY_FILL)};
`,
);
