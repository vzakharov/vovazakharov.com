/**
 * What of the ground a frame's mushrooms hide: each mushroom's dome, gills
 * and stem as the layout stands them (`standingAt`, the outlines
 * `cap-cover.ts` weighs), drawn about its foot where the view places it, as
 * the bed draws its body. A thing on the ground is in sight where no
 * mushroom standing nearer the eye is drawn over it, so a key plays and
 * plants only through what the child can see.
 */

import type { Planted } from '../../model/game';
import { boxAround, containsPoint, type Point } from '../../model/geometry';
import { aboutFoot, bedPlace } from './bed-place';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import type { BoxedOutlines } from './flower-sight';
import type { MeadowLayout } from './layout';
import type { Placed, View } from './view';

/** A mushroom as a frame draws it: how far from the eye it stands, and its outlines on the screen. */
export type ShownCover = Pick<Placed, 'distance'> & BoxedOutlines;

/** Every one of `mushrooms` that `view` draws, as it covers what stands behind it. */
export function coversShown(
  view: View,
  { mushrooms: ground }: Pick<MeadowLayout, 'mushrooms'>,
  mushrooms: readonly Planted[],
): ShownCover[] {
  return mushrooms.flatMap((mushroom) => {
    const laid = placeIn(ground, mushroom);
    if (!laid) return [];
    const stands = bedPlace(view, mushroom.foot);
    const { distance } = stands;
    if (!stands.drawn) return [];
    const drawn = standingAt(laid, mushroom).drawn.map((outline) => {
      const shown = outline.map((point) => aboutFoot(stands, laid, point));
      return { outline: shown, box: boxAround(shown) };
    });
    return [{ distance, drawn }];
  });
}

/**
 * Whether something drawn at `point` on the screen, standing `distance` from
 * the eye, shows past `covers`: none of them standing nearer is drawn over it.
 */
export function inSightPast(
  covers: readonly ShownCover[],
  point: Point,
  distance: number,
): boolean {
  return covers.every(
    (cover) =>
      cover.distance >= distance ||
      cover.drawn.every(
        ({ outline, box }) =>
          point.x < box.left ||
          point.x > box.right ||
          point.y < box.top ||
          point.y > box.bottom ||
          !containsPoint(outline, point),
      ),
  );
}
