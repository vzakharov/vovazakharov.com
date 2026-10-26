import type { Point } from './geometry';
import { type DoorPlace, onStem } from './house';
import type { RunEnd } from './mouse-run-clock';

/**
 * The run's end at a door seated at `door` on a mushroom of `size` in the
 * clump's, with its `front` on the plane and its stem's `foot`; with none
 * given, its course is held clear of its front instead, which stands nearer
 * the eye, so the course bows deeper than it needs.
 */
export function endOf(
  front: Point,
  door: DoorPlace,
  size: number,
  foot?: Point,
): RunEnd {
  return {
    front,
    ...(foot && { foot }),
    across: door.width * size,
    sillHeight: onStem(door)({ x: 0, y: 0 }).y * size,
  };
}
