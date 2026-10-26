/**
 * Where a bee plants: round a flower it visited, in the first ring slot that
 * would stand and be in sight, and whose flower the child would see come up.
 */

import type { Stood } from '../../model/ground';
import { type Plot, slotTaken } from '../../model/planted-flowers';
import { RING_SLOTS, ringFoot } from './flower-plots';
import {
  type FlowerSightLayout,
  plantable,
  plantingGroundIn,
  sightAt,
  type Stand,
} from './flower-sight';
import type { InsectScaled } from './insect-size';
import type { Occupant } from './occupant';
import { butterflyOn } from './widest-spans';

/**
 * Where a bee could plant round each flower of `shown`, on `stand` as judged
 * from the anchor: the first ring slot no planted flower takes that is
 * `plantable` past `occupants`, off the foot of every one of them, at any
 * depth, a butterfly on it in sight, and whose head, whatever its genes,
 * stands whole on the screen (`sightAt`), so the child sees every flower a
 * bee plants come up. A flower whose ring has no such slot takes none.
 */
export function roomFor<
  L extends FlowerSightLayout & InsectScaled,
  Thing extends Stood,
>(
  stand: Stand<L, Thing>,
  shown: readonly string[],
  occupants: readonly Occupant[],
): Plot['room'] {
  const { layout, planted } = stand;
  const ground = plantingGroundIn(stand);
  const sitter = butterflyOn(layout);
  return shown.flatMap((id) => {
    const parent = ground.standing.find((flower) => flower.id === id);
    if (!parent) return [];
    const ring = RING_SLOTS.findIndex((_, slot) => {
      if (slotTaken(planted, id, slot)) return false;
      const spot = ringFoot(parent.foot, slot, layout.mushrooms.anchor);
      return (
        spot !== undefined &&
        plantable(layout, spot, ground, occupants, sitter) &&
        sightAt(layout, occupants, spot, sitter).onScreen
      );
    });
    return ring === -1 ? [] : [{ flower: id, ring }];
  });
}
