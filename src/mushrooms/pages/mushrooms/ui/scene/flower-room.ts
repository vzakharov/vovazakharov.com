/**
 * Where the child can plant a flower: on ground no occupant takes, in the
 * flowers' band, and where a butterfly on it would be in sight
 * (`plantable`), as the eye the child plants from judges it.
 */

import { anchorOf } from '../../model/anchor';
import type { Eye, Footing, Stood } from '../../model/ground';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { inFlowerBand, occupantsOf } from './flower-plots';
import {
  type FlowerSightLayout,
  plantable,
  plantingGroundIn,
  type Stand,
} from './flower-sight';
import type { InsectScaled } from './insect-size';
import { butterflyOn } from './widest-spans';

/** What of the meadow's layout this reads. */
export type FlowerRoomLayout = FlowerSightLayout & InsectScaled;

/**
 * Whether the child can plant a flower at `foot`, on the plane, on `stand`
 * as the anchor of `eye` judges it: it is `plantable` as a bee's planting
 * would be, and in the flowers' band, so the flower stands and is in sight
 * on every screen (`roomFrom`, for one foot).
 */
export function takesFlower<L extends FlowerRoomLayout, Thing extends Stood>(
  stand: Stand<L, Thing>,
  foot: Footing,
  eye: Eye,
): boolean {
  return roomFrom(stand, eye)(foot);
}

/**
 * `roomIn` on `stand` as the anchor of `eye` judges it (`anchoredStand`),
 * for a foot on the plane: moved with the anchor, and taking no flower in
 * the sliver straight behind it, which has no ground.
 */
function roomFrom<L extends FlowerRoomLayout, Thing extends Stood>(
  stand: Stand<L, Thing>,
  eye: Eye,
): (foot: Footing) => boolean {
  const anchor = anchorOf(eye);
  const room = roomIn(anchoredStand(stand, anchor));
  return (foot) => {
    const moved = movedTo(anchor, foot);
    return hasGround(moved) && room(moved);
  };
}

/**
 * Whether the child's flower planted at a foot on `stand` would stand there
 * and be in sight with a butterfly on it (`plantable`), in the flowers' band
 * (`inFlowerBand`): what `stand` holds read once, for every foot asked after.
 */
export function roomIn<L extends FlowerRoomLayout, Thing extends Stood>(
  stand: Stand<L, Thing>,
): (foot: Footing) => boolean {
  const { layout } = stand;
  const ground = plantingGroundIn(stand);
  const occupants = occupantsOf(stand);
  const sitter = butterflyOn(layout);
  return (foot) =>
    inFlowerBand(foot) && plantable(layout, foot, ground, occupants, sitter);
}
