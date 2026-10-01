import type { Point } from '../../model/geometry';
import type { Camera } from '../../model/ground';
import type { EyeInput } from './eye-input';

/** A screen point to where across the world, in the layout's px, it lies now: what a `+`'s room is still judged by. */
export type Crosswise = {
  toWorld: <Placed extends Point>(point: Placed) => Placed;
};

/**
 * `eye`'s view as a crop of the world on the camera `cameraNow` gives: a point across the screen
 * goes to the layout's x the ground has under it on the ground's middle row,
 * its y kept. Exact at the opening eye; turned, the row's x stands in for
 * the screen's. Where that row's ground is behind the opening eye, a point
 * goes past the world's end on its side of the screen.
 */
export function eyeCrop(
  eye: EyeInput,
  cameraNow: () => Camera | undefined,
): Crosswise {
  return {
    toWorld: <Placed extends Point>(point: Placed): Placed => {
      const camera = cameraNow();
      if (!camera) return point;
      const row = (camera.groundTop + camera.height) / 2;
      const { x } = point;
      const under = eye.toLayout({ x, y: row });
      const beyond = x < camera.width / 2 ? -Infinity : Infinity;
      return { ...point, x: under?.x ?? beyond };
    },
  };
}
