import { assemble } from '@/scene/shared/shader';

import { SHORE_CUSPED, SHORE_LEVEL, WETNESS } from '@/nature/shared/shore';
import { WATER_LIGHT } from '@/nature/shared/water';

/**
 * The WGSL of nature's swell, shore and water as one listing, for a TSL material to
 * include through `code()` and call by `wgslFn`: the swell's train, the shore's
 * scalar water level, the swash's wetness, the beach's cusps and what
 * water does to light. Every
 * function in it is a function of its arguments alone.
 */
export const NATURE_LISTING = assemble([
  SHORE_LEVEL,
  WETNESS,
  SHORE_CUSPED,
  WATER_LIGHT,
]);
