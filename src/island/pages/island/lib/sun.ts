const DEGREE = Math.PI / 180;

/**
 * The intensity a directional light needs at `elevation` degrees to lay
 * `irradiance` on level ground: level ground takes the sine of the sun's
 * elevation of its intensity.
 */
export const intensityFor = (irradiance: number, elevation: number): number =>
  irradiance / Math.sin(elevation * DEGREE);
