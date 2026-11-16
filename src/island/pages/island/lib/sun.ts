const DEGREE = Math.PI / 180;

/**
 * The intensity a directional light needs at `elevation` degrees to lay
 * `irradiance` on level ground: level ground takes the sine of the sun's
 * elevation of its intensity.
 */
export const intensityFor = (irradiance: number, elevation: number): number =>
  irradiance / Math.sin(elevation * DEGREE);

/** How much of the growth in level ground's light the eye lets through as the sun climbs. */
export const CLIMB_KEPT = 0.25;

/**
 * What the eye keeps of a sun whose height's sine is `sine`, as it adapts to
 * one higher than `elevation` degrees: all of it up to there, and above it
 * enough that level ground brightens only by the `CLIMB_KEPT` power of what
 * the sun lays on it, so a noon beach stays under white.
 */
export function eyeKeeps(sine: number, elevation: number): number {
  const reference = Math.sin(elevation * DEGREE);
  return (reference / Math.max(sine, reference)) ** (1 - CLIMB_KEPT);
}
