/** Where a run meets a door on the plane: pure, for `MouseRuns`. */

import type { Point } from '../../model/geometry';

/**
 * Where a door's runs stand at the plane: in front of its stem, its `foot`
 * moved `toward` the `eye` by the stem's half width there, and `sideways` by
 * its sill's offset across the screen, all in the clump's size — so the
 * mouse leaves and enters in front of its stem, where its door is drawn.
 */
export function doorFront(
  foot: Point,
  eye: Point,
  toward: number,
  sideways: number,
): Point {
  const dx = foot.x - eye.x;
  const dy = foot.y - eye.y;
  const away = Math.hypot(dx, dy) || 1;
  return {
    x: foot.x + (-dx * toward + dy * sideways) / away,
    y: foot.y + (-dy * toward - dx * sideways) / away,
  };
}
