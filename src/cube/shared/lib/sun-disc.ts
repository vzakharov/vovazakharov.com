import { f32, wgsl } from '../shader/wgsl';

/**
 * The tangent of the sun's radius in the sky: it is half a degree across, so
 * a shadow's edge widens by twice this for every metre the shadow falls.
 */
export const SUN_SPREAD = Math.tan((0.2665 * Math.PI) / 180);

/** `SUN_SPREAD` as a WGSL constant. */
export const SUN_DISC = wgsl(
  'sun-disc',
  `const SUN_SPREAD = ${f32(SUN_SPREAD)};`,
);
