import type { Point } from '../../model/geometry';
import {
  type Camera,
  EYE_HEIGHT,
  OPENING_EYE,
  pinholeOf,
} from '../../model/ground';
import type { EyeInput } from './eye-input';
import type { View } from './view';

/**
 * `ofLayout` run backwards: the point, in the layout's world px, that `view`
 * shows at `screen`, in CSS px, standing over the ground row `footRow`. A
 * row's points stand on one upright plane across the plane's y, so this is
 * where the screen's ray meets it; none where it never does in front of the
 * eye, nor for a row at or above the horizon.
 */
export function layoutAtRow(
  view: View,
  screen: Point,
  footRow: number,
): Point | undefined {
  const pinhole = pinholeOf(view);
  if (footRow <= pinhole.y) return undefined;
  const opening = (pinhole.focal * EYE_HEIGHT) / (footRow - pinhole.y);
  const perPx = opening / pinhole.focal;
  const across = (screen.x - pinhole.x) / pinhole.focal;
  const { x, y, heading } = view.eye;
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  // The ray one unit ahead of the eye, on the plane.
  const toward = { x: across * cos + sin, y: cos - across * sin };
  const ahead = (OPENING_EYE.y + opening - y) / toward.y;
  if (!(ahead > 0) || !Number.isFinite(ahead)) return undefined;
  const plane = x + ahead * toward.x;
  const height = EYE_HEIGHT - ((screen.y - pinhole.y) * ahead) / pinhole.focal;
  return {
    x:
      (plane - OPENING_EYE.x) / perPx +
      (view.world - view.width) / 2 +
      pinhole.x,
    y: footRow - height / perPx,
  };
}

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
