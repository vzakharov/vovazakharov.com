import type { Rgb } from '../lib/colour';

/** `rgb` as a WGSL `vec3f`, for a colour a piece holds as a constant. */
export const vec3f = (rgb: Rgb): string =>
  `vec3f(${rgb.map((channel) => channel.toFixed(4)).join(', ')})`;
