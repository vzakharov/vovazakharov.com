/**
 * A finger's reach on the buttons over the meadow, in CSS pixels, which every
 * placement of them (`sky-layout.ts`, `picker-rows.ts`) and every tap on the
 * meadow keeps to.
 */

import type { Circle } from '../../model/geometry';

/** How far a button's edge keeps from the screen's. */
export const BUTTON_INSET = 18;
/** The gap between one of `+`, `−` and the house and the next. */
export const GROW_GAP = 16;
/**
 * The least radius, in CSS pixels, a tap target reaches: 64 across, which a
 * six-year-old's finger finds without aiming.
 */
export const TAP_RADIUS = 32;

/** A tap target's hit radius: what it draws, and never under `TAP_RADIUS`. */
export function tapReach(r: number): number {
  return Math.max(r, TAP_RADIUS);
}

/** Whether two buttons' tap circles keep `gap` apart. */
export const apart = (a: Circle, b: Circle, gap: number) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= tapReach(a.r) + tapReach(b.r) + gap;
