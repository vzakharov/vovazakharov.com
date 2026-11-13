import { assemble } from '@/cube/shared/shader';

import { COVER } from './cover.shader';
import { HALVE_PASS } from './halve-pass.shader';
import { REFLECTION_PASS } from './reflection-pass.shader';

/** How many levels the scene is kept at, each half the last, for blur. */
export const BLUR_LEVELS = 6;

/** Floats of `View` below: two matrices and two vectors. */
export const VIEW_FLOATS = 16 + 16 + 4 + 4;

/** The level above, halved, for the blur's next level. */
export const HALVE_SHADER = assemble([HALVE_PASS, COVER]);

/** The frame's mirrors filled in from the scene's own light and depth. */
export const REFLECTION_SHADER = assemble([REFLECTION_PASS, COVER]);
