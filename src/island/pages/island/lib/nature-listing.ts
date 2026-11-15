import { assemble } from '@/scene/shared/shader';

import { SHORE_CUSPED, SHORE_LEVEL, WETNESS } from '@/nature/shared/shore';
import { WATER_LIGHT } from '@/nature/shared/water';

/**
 * Nature's WGSL as one listing, for a TSL material to include through `code()`
 * and call by `wgslFn`. Every function in it is a function of its arguments
 * alone, so the material binds nothing for it.
 */
export const NATURE_LISTING = assemble([
  SHORE_LEVEL,
  WETNESS,
  SHORE_CUSPED,
  WATER_LIGHT,
]);
