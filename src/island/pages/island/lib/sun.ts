import { cross, northAt, unit, type Vec3 } from '@/island/shared/globe';

const DEGREE = Math.PI / 180;

/**
 * Toward the sun, a world vector: `elevation` degrees over the horizon of the
 * place at direction `at`, from `azimuth` degrees clockwise from its north.
 */
export function sunToward(elevation: number, azimuth: number, at: Vec3): Vec3 {
  const up = unit(at);
  const north = northAt(up);
  const east = cross(north, up);
  const rise = Math.sin(elevation * DEGREE);
  const across = Math.cos(elevation * DEGREE);
  const e = across * Math.sin(azimuth * DEGREE);
  const n = across * Math.cos(azimuth * DEGREE);
  const axis = (i: 0 | 1 | 2) => rise * up[i] + e * east[i] + n * north[i];
  return [axis(0), axis(1), axis(2)];
}

/**
 * The intensity a directional light needs at `elevation` degrees to lay
 * `irradiance` on level ground: level ground takes the sine of the sun's
 * elevation of its intensity.
 */
export const intensityFor = (irradiance: number, elevation: number): number =>
  irradiance / Math.sin(elevation * DEGREE);
