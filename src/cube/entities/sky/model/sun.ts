import { lightUnder } from './sky-light';

const DEGREES = Math.PI / 180;
const ELEVATION = 9 * DEGREES;
const AZIMUTH = 8 * DEGREES;

/** Toward the sun, in W: 9° up, 8° round from +x toward +z. */
export const SUN_DIR = [
  Math.cos(ELEVATION) * Math.cos(AZIMUTH),
  Math.sin(ELEVATION),
  Math.cos(ELEVATION) * Math.sin(AZIMUTH),
] as const;

/** The sun's radius in the sky, in radians. */
export const SUN_RADIUS = 0.2666 * DEGREES;

const LIGHT = lightUnder(SUN_DIR);

/** A white face square to the sun above the air: the scale of every light below. */
export const SUN_WHITE = LIGHT.white;
/** A white face square to the sun on the island. */
export const SUN_LIGHT = LIGHT.sun;
/** A white face turned up to the clear sky, out of the sun. */
export const SKY_FILL = LIGHT.sky;
/** A white face turned down to the open sea. */
export const GROUND_FILL = LIGHT.ground;
/** The sky's mean light just over the horizon, away from the sun's glare. */
export const HORIZON_FILL = LIGHT.horizon;
