/**
 * A door as a finger's target and its mouse as something an eye can read,
 * whatever the size its stem leaves the door: in the pixels its house's
 * graphics paints in, which at rest are CSS pixels.
 */

import { ellipse, type Point, ROUND_STEPS } from '../../model/geometry';
import { type DoorPlace, onStem, paintedDoor } from '../../model/house';
import { toCanvas } from '../../model/mushroom-outline';
import { TAP_RADIUS } from './sky-layout';

/**
 * Where a door answers a tap: a circle round its middle that takes in the
 * whole painted door, and is never under `TAP_RADIUS` — so it spills onto the
 * stem round a small door, where it takes a tap that would otherwise select.
 */
export function doorHitArea(door: DoorPlace, size: number): Point[] {
  const canvas = toCanvas(size);
  const stem = onStem(door);
  const middle = canvas(door);
  const reach = Math.max(
    ...paintedDoor(door.height / door.width).map((point) => {
      const { x, y } = canvas(stem(point));
      return Math.hypot(x - middle.x, y - middle.y);
    }),
  );
  // Widened so the polygon's chords, not only its corners, keep outside the circle.
  return ellipse(
    middle,
    Math.max(TAP_RADIUS, reach) / Math.cos(Math.PI / ROUND_STEPS),
  );
}

/** The mouse's head radius, in door widths, drawn at its door's own scale. */
export const MOUSE_HEAD_R = 0.3;
/** The least a mouse's head is drawn across, in pixels. */
export const MOUSE_HEAD_LEAST = 28;

/**
 * How many times over its door's scale the mouse at a door `doorWidth`
 * pixels wide is drawn, so its head is never under `MOUSE_HEAD_LEAST`
 * across: 1 at a door wide enough.
 */
export function mouseScale(doorWidth: number): number {
  return Math.max(1, MOUSE_HEAD_LEAST / (2 * MOUSE_HEAD_R * doorWidth));
}

/** How far across, in pixels, the mouse's head is drawn at a door `doorWidth` pixels wide. */
export function mouseHead(doorWidth: number): number {
  return 2 * MOUSE_HEAD_R * doorWidth * mouseScale(doorWidth);
}
