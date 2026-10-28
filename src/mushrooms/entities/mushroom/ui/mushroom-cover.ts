/**
 * The mushrooms as the meadow's occupants: the ground each one's foot takes,
 * and what each hides, its dome, gills and stem as the layout stands them
 * (`standingAt`, the outlines `cap-cover.ts` weighs) — as the layout judges
 * them (`occupantsOn`), or drawn about its foot where a frame's view places
 * it, as the bed draws its body (`coversShown`). A thing on the ground is in
 * sight where no mushroom standing nearer the eye is drawn over it, so a key
 * plays and plants only through what the child can see.
 */

import { keptIn } from '@/kernel/shared/cache';

import { boxAround } from '@/mushrooms/shared/lib/geometry';
import {
  aboutFoot,
  bedPlace,
  type ClumpGround,
  type MushroomGround,
  type Occupant,
  type Occupying,
  type ShownCover,
} from '@/mushrooms/shared/meadow';
import { planeFootAt, type View } from '@/mushrooms/shared/space';

import type { Planted } from '../model/planted';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';

/** Each ground's occupants, by the mushrooms standing on it (`occupantsOn`). */
const occupancies = new WeakMap<
  MushroomGround,
  WeakMap<readonly Planted[], readonly Occupant[]>
>();

/**
 * Every one of `mushrooms` that `ground` shows, as an occupant: its foot on
 * the plane of the ground's anchor, which a flower keeps off, and its
 * outlines where the layout stands it, which hide what stands behind. Kept
 * per ground and mushrooms, which the meadow never changes in place, only
 * replaces.
 */
export const occupantsOn: Occupying<Planted> = (ground, mushrooms) => {
  const byMushrooms = keptIn(
    occupancies,
    ground,
    () => new WeakMap<readonly Planted[], readonly Occupant[]>(),
  );
  return keptIn(byMushrooms, mushrooms, () =>
    mushrooms.flatMap((mushroom): Occupant[] => {
      const place = placeIn(ground, mushroom);
      if (!place) return [];
      const { depth, drawn } = standingAt(place, mushroom);
      return [
        {
          foot: planeFootAt(ground.camera, place),
          cover: {
            depth,
            drawn: drawn.map((outline) => ({
              outline,
              box: boxAround(outline),
            })),
          },
        },
      ];
    }),
  );
};

/** Every one of `mushrooms` that `view` draws, as it covers what stands behind it. */
export function coversShown(
  view: View,
  { mushrooms: ground }: ClumpGround,
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
