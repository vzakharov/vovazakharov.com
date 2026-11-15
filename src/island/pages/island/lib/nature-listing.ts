import { assemble } from '@/scene/shared/shader';

import { SHORE_CUSPED, SHORE_LEVEL, WETNESS } from '@/nature/shared/shore';

/**
 * The WGSL of nature's swell and shore as one listing, for a TSL material to
 * include through `code()` and call by `wgslFn`: the swell's train, the shore's
 * scalar water level, the swash's wetness and the beach's cusps. Every
 * function in it is a function of its arguments alone.
 */
export const NATURE_LISTING = assemble([SHORE_LEVEL, WETNESS, SHORE_CUSPED]);
