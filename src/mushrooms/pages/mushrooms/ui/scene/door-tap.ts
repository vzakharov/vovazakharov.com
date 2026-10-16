import type { Point } from '../../model/geometry';

/** A door as a tap finds it: its tap area's middle on screen, and whether that area holds a point on screen. */
export type DoorTarget = Point & { holds: (at: Point) => boolean };

/**
 * Which of `doors` a tap at `finger` goes to: of those whose tap area holds
 * it, the one whose middle is nearest, so where two areas overlap the nearer
 * door takes the tap and anywhere only one holds it that one does. Of two as
 * near, the later. `undefined` where no door's area holds the finger.
 */
export function tappedDoor<Door extends DoorTarget>(
  finger: Point,
  doors: readonly Door[],
): Door | undefined {
  let nearest: { door: Door; away: number } | undefined;
  for (const door of doors) {
    if (!door.holds(finger)) continue;
    const away = Math.hypot(finger.x - door.x, finger.y - door.y);
    if (nearest && away > nearest.away) continue;
    nearest = { door, away };
  }
  return nearest?.door;
}
