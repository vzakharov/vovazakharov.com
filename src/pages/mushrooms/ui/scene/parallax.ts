/**
 * How far each layer of the backdrop scrolls, pure: a layer at scroll factor
 * `f` moves `f` px for every px the camera does, so the sky stands still, the
 * hills slide slower than the ground, and the ground moves with the world.
 */

import { clampLeft, type View } from '../../model/pan';
import type { Span } from './baking';

/** Each layer's scroll factor: the far and farthest hills, the near hills, and the land. */
export const PARALLAX = { fixed: 0, far: 0.3, near: 0.6, ground: 1 } as const;

/**
 * The stretch of a layer at scroll factor `factor` the screen shows over
 * every crop `view` allows, from the crop at the world's left end to the one
 * at its right: laid there, the layer covers the screen however it pans. At
 * factor 1 it is the world, at 0 the screen.
 */
export function layerSpan(view: View, factor: number): Span {
  const least = clampLeft(view, -Infinity);
  const most = clampLeft(view, Infinity);
  return {
    left: factor * least,
    across: view.width + factor * (most - least),
  };
}
