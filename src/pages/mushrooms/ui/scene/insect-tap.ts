import type { WithId } from '@/shared/typings';

import type { Circle, Point } from '../../model/geometry';

/** An insect as a tap finds it: where its body is drawn, and how far round it a tap reaches it. */
export type TapTarget = Circle & WithId;

/**
 * Which of `targets` a tap at `finger` reaches: of those whose reach holds
 * it, the one whose body is nearest the finger, so the child gets the insect
 * they aimed at rather than the one drawn on top. `targets` run bottom to top
 * as drawn, and of two bodies as near, the one on top wins. `undefined` where
 * no reach holds the finger.
 */
export function tappedInsect(
  finger: Point,
  targets: readonly TapTarget[],
): string | undefined {
  let nearest: { id: string; away: number } | undefined;
  for (const { id, x, y, r } of targets) {
    const away = Math.hypot(finger.x - x, finger.y - y);
    if (away > r || (nearest && away > nearest.away)) continue;
    nearest = { id, away };
  }
  return nearest?.id;
}
