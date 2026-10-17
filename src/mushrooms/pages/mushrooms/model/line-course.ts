/**
 * A course to a point on a line (`Aimed`) along the unit way `ahead`. A drive
 * on it asks toward the aim from wherever it stands and brakes to rest
 * exactly there, `covered` hearing every length it moves.
 */

import { type Course, type Direction, wayOf } from './cruise';
import type { Facing, Point } from './geometry';

/** A point on a line, `aim` units on from its `origin` (back for less than 0). */
export type Aimed = { origin: Point; aim: number };

type Line = Aimed & Facing;

/** The course to `line`'s aim at `pace` units a second, eased in over `ease` seconds. */
export function lineCourse(
  { origin, ahead, aim }: Line,
  pace: Pick<Course<Point>, 'cruise' | 'ease'>,
  covered: (length: number) => void,
): Course<Point> {
  const left = (at: Point) =>
    aim - ((at.x - origin.x) * ahead.x + (at.y - origin.y) * ahead.y);
  const room = (at: Point, way: Direction) => {
    const on = left(at) * way;
    return on > 0 ? on : Infinity;
  };
  return {
    ...pace,
    toward: (at) => Math.sign(left(at)),
    room,
    step: (at, by) => {
      if (by === 0) return { at, stopped: false };
      const most = room(at, wayOf(by));
      const length = Math.sign(by) * Math.min(Math.abs(by), most);
      covered(Math.abs(length));
      return {
        at: { x: at.x + ahead.x * length, y: at.y + ahead.y * length },
        stopped: Math.abs(by) >= most,
      };
    },
  };
}
