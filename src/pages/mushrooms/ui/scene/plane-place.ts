/**
 * Between the layout and the plane: a point laid out over a ground row as a
 * fixed point in the world, and a point in the world as the `Place` a leg is
 * timed by, so every end a leg is drawn to is timed where it is drawn.
 */

import type { Place } from '../../model/flight';
import { type Aloft, framedOf, placeOf } from '../../model/flight-frame';
import type { Point } from '../../model/geometry';
import { type Camera, spread } from '../../model/ground';
import { eyeFrameOf } from './insect-frame';
import { middleOf, rowAt, V_NEAR, type View } from './view';

/**
 * `point`, in world px as `camera`'s layout lays it out over the ground row
 * `footRow`, as a fixed point in the world: `ofLayout`'s own construction, so
 * the opening eye draws it where the layout does, and a thing whose foot is
 * on that row stands on the plane where its bed places it.
 */
export function aloftOfLayout(
  camera: Camera,
  point: Point,
  footRow: number,
): Aloft {
  const { opening, perPx } = rowAt(camera, footRow);
  return {
    ...spread({ x: (point.x - middleOf(camera)) * perPx, y: opening }),
    h: (footRow - point.y) * perPx,
  };
}

/**
 * How far from `view`'s eye a perch at `at` is, in the clump's size (`Place`'s
 * `fromEye`), the one seam a distance enters `Places` by: its forward
 * distance in the frame turned to the eye's heading (`framedOf`), which at the
 * opening eye is its foot row's opening distance; kept out at `V_NEAR`, as
 * the frame's forward falls to nothing and below straight behind the eye.
 */
export function perchDistance(view: View, at: Aloft): number {
  return Math.max(
    V_NEAR,
    framedOf(eyeFrameOf(view), view.eye.heading, at).forward,
  );
}

/**
 * `aloft` as the `Place` a leg to or from it is timed by (`placeOf`), in
 * `view`'s frame in insect sizes of `unit` px, kept out at `V_NEAR` as
 * `perchDistance` keeps it. At the opening eye that frame is the layout, so
 * this is `aloftOfLayout` run backwards; at any eye a leg is framed as it is
 * drawn (`pairFramed`), so it is timed as long as it is drawn.
 */
export function placeOfAloft(view: View, unit: number, aloft: Aloft): Place {
  return placeOf(eyeFrameOf(view, unit), V_NEAR, aloft);
}
