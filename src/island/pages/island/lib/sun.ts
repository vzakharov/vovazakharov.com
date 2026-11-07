import { CENTRE, EAST, NORTH, type Vec3 } from '@/island/shared/globe';

const DEGREE = Math.PI / 180;

/**
 * Toward the sun, a world vector: `elevation` degrees over the island
 * centre's horizon, from `azimuth` degrees clockwise from north. The planet
 * keeps one sun, so every tile is lit from the same direction.
 */
export function sunToward(elevation: number, azimuth: number): Vec3 {
  const up = Math.sin(elevation * DEGREE);
  const across = Math.cos(elevation * DEGREE);
  const east = across * Math.sin(azimuth * DEGREE);
  const north = across * Math.cos(azimuth * DEGREE);
  const axis = (i: 0 | 1 | 2) =>
    up * CENTRE[i] + east * EAST[i] + north * NORTH[i];
  return [axis(0), axis(1), axis(2)];
}

/**
 * The intensity a directional light needs at `elevation` degrees to lay
 * `irradiance` on level ground: level ground takes the sine of the sun's
 * elevation of its intensity.
 */
export const intensityFor = (irradiance: number, elevation: number): number =>
  irradiance / Math.sin(elevation * DEGREE);
