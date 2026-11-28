import type { Point } from './path';

export const add = ([ax, ay]: Point, [bx, by]: Point): Point => [
  ax + bx,
  ay + by,
];

export const sub = ([ax, ay]: Point, [bx, by]: Point): Point => [
  ax - bx,
  ay - by,
];

export const times = ([x, y]: Point, k: number): Point => [x * k, y * k];

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** The point `t` of the way from `a` to `b`. */
export const mix = (a: Point, b: Point, t: number): Point => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];

export const distance = (a: Point, b: Point): number =>
  Math.hypot(b[0] - a[0], b[1] - a[1]);

export const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

/** `point` turned `degrees` clockwise about `pivot`. */
export function turned(point: Point, pivot: Point, degrees: number): Point {
  const angle = (degrees * Math.PI) / 180;
  const [x, y] = sub(point, pivot);
  return add(pivot, [
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle),
  ]);
}

/** How far clockwise, in degrees, the line from `from` to `to` leans off straight down. */
export const heading = (from: Point, to: Point): number =>
  (Math.atan2(from[0] - to[0], to[1] - from[1]) * 180) / Math.PI;

/** 0 below `from`, 1 above `to`, an eased ramp between. */
export function smoothstep(from: number, to: number, value: number): number {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}
