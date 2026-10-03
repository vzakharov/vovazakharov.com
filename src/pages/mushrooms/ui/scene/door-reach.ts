/**
 * A door as a finger's target, whatever the size its stem leaves the door,
 * and its mouse's size: in the pixels its house's graphics paints in, which
 * at rest are CSS pixels.
 */

import { ellipse, type Point, ROUND_STEPS } from '../../model/geometry';
import { type DoorPlace, onStem, paintedDoor } from '../../model/house';
import { toCanvas } from '../../model/mushroom-outline';
import { TAP_RADIUS } from './tap-reach';

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

/** The mouse's head radius, in door widths: it is drawn at its door's own scale, whatever that door's size. */
export const MOUSE_HEAD_R = 0.3;

/** How far across, in pixels, the mouse's head is drawn at a door `doorWidth` pixels wide. */
export function mouseHead(doorWidth: number): number {
  return 2 * MOUSE_HEAD_R * doorWidth;
}
