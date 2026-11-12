/**
 * The tangent of the sun's radius in the sky: it is half a degree across, so
 * a shadow's edge widens by twice this for every metre the shadow falls.
 */
export const SUN_SPREAD = Math.tan((0.2665 * Math.PI) / 180);
