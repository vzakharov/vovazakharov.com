import type { Point } from '../lib/geometry';
import { type Stride, tick } from './stride';

export const FRAME = 1 / 60;
/** A lift this long after the finger's last move finds it at rest, flinging nothing. */
export const LATE = 10;
export const ORIGIN: Point = { x: 0, y: 0 };

export function apart(one: Point, other: Point): number {
  return Math.hypot(one.x - other.x, one.y - other.y);
}

/** `stride` ticked along `heading` for `seconds`, a frame at a time, and where it stood after each. */
export function walked(
  stride: Stride,
  heading: number,
  seconds: number,
): [Stride, Point[]] {
  let walking = stride;
  const seen: Point[] = [];
  for (let time = 0; time < seconds - 1e-9; time += FRAME) {
    walking = tick(walking, heading, FRAME);
    seen.push(walking.at);
  }
  return [walking, seen];
}

/** Every frame's move along `seen` from `from`. */
export function moves(from: Point, seen: Point[]): number[] {
  return seen.map((at, index) => apart(at, seen[index - 1] ?? from));
}
