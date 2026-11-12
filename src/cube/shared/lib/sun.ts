import type { Rgb } from './colour';

const ELEVATION = (9 * Math.PI) / 180;
const AZIMUTH = (8 * Math.PI) / 180;

/** Toward the sun, unit length: x east, y up, z south. It does not move. */
export const SUN_DIR: readonly [number, number, number] = [
  Math.cos(ELEVATION) * Math.cos(AZIMUTH),
  Math.sin(ELEVATION),
  Math.cos(ELEVATION) * Math.sin(AZIMUTH),
];

/** The sun's light as a white face square to it shows it, in scene units. */
export const SUN_LIGHT: Rgb = [8, 4.96, 2.64];

/** The tangent of the sun's radius in the sky: it is half a degree across. */
export const SUN_SPREAD = Math.tan((0.2665 * Math.PI) / 180);
