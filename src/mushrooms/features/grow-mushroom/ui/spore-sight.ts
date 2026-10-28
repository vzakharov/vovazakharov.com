/**
 * Whether a spore's dot can be seen, and so tapped: the bed draws it at its
 * foot under every mushroom standing nearer the eye (`SporeBed`), so a dot is
 * in sight where it stands on the screen, ahead of the eye and short of the
 * brow, with no nearer mushroom's drawn outline over it (`inSightPast`, as a
 * flower's head or a tuft is judged).
 */

import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  bedPlace,
  inSightPast,
  type ShownCover,
} from '@/mushrooms/shared/meadow';
import { onScreen, type View } from '@/mushrooms/shared/space';

/**
 * Where on `view`'s screen the dot of a spore lying on `foot`, on the plane,
 * is drawn in sight past `covers` (`coversShown`); `undefined` where it is
 * not drawn, sunk behind the brow, off the screen or under a nearer mushroom.
 */
export function dotInSight(
  view: View,
  covers: readonly ShownCover[],
  foot: Point,
): Point | undefined {
  const { x, y, drawn, behind, distance } = bedPlace(view, foot);
  const at = { x, y };
  return drawn &&
    !behind &&
    onScreen(view, at) &&
    inSightPast(covers, at, distance)
    ? at
    : undefined;
}
