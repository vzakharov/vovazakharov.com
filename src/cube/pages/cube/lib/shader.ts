import type { Wgsl } from '@/cube/shared/shader';
import { floorSource, themeOf } from '@/cube/entities/theme';

import { FLOOR_LENS } from './floor-lens.shader.generated';
import { FLOOR_STAGE } from './floor-stage.shader.generated';

/**
 * The whole shader of floor `n`, in the air of floor `air`: its own, but for
 * a floor seen through a portal, which stands in the air of the floor the
 * eye is on.
 */
export function shaderOf(n: number, air = n): string {
  const { air: around } = themeOf(air);
  return floorSource({ ...themeOf(n), air: around }, FLOOR_STAGE, FLOOR_LENS);
}

/**
 * Floor 1's whole shader with `lens` for its `lensFragment`: a lens that can
 * call floor 1's `themeLens`, for an eye passing between that room and the
 * outside.
 */
export const firstFloorThrough = (lens: Wgsl): string =>
  floorSource(themeOf(1), FLOOR_STAGE, lens);
