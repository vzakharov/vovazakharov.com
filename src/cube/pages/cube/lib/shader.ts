import type { Wgsl } from '@/cube/shared/shader';
import { floorSource, themeOf } from '@/cube/entities/theme';

import { FLOOR_LENS } from './floor-lens.shader';
import { FLOOR_STAGE } from './floor-stage.shader';

/** The floats of `lens-stage.wgsl`'s `Uniforms`: a matrix and three vectors. */
export const UNIFORM_FLOATS = 16 + 4 + 4 + 4;

/** The whole shader of floor `n`. */
export const shaderOf = (n: number): string =>
  floorSource(themeOf(n), FLOOR_STAGE, FLOOR_LENS);

/**
 * Floor 1's whole shader with `lens` for its `lensFragment`: a lens that can
 * call floor 1's `themeLens`, for an eye passing between that room and the
 * outside.
 */
export const firstFloorThrough = (lens: Wgsl): string =>
  floorSource(themeOf(1), FLOOR_STAGE, lens);
