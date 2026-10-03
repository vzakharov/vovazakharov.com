/** Where a run meets a door on the plane, and which way its runner faces on screen: pure, for `MouseRuns`. */

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

/** Which way a runner at `point` heading along `heading` on the plane runs on the screen of an eye at `eye`: 1 right, -1 left. */
export function facingOn(heading: Point, point: Point, eye: Point): number {
  const dx = point.x - eye.x;
  const dy = point.y - eye.y;
  return heading.x * dy - heading.y * dx >= 0 ? 1 : -1;
}
