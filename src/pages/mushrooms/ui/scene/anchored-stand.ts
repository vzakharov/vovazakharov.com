/**
 * The meadow as an eye other than the opening one judges it: every stored
 * foot moved with that eye onto `OPENING_EYE` (`anchored`), so a rule that
 * reads the opening layout runs unchanged and judges what the eye sees. What
 * a rule finds there goes back to the plane through `unanchored`.
 */

import { pick } from '@/shared/lib/collections';

import { sameAnchor } from '../../model/anchor';
import type { Point } from '../../model/geometry';
import {
  anchored,
  type Eye,
  type Footing,
  gathered,
  groundOfPlane,
  OPENING_EYE,
  planeFootOf,
} from '../../model/ground';
import { type Footed, openingIndex } from '../../model/placement';
import { isBeeSown, type Sown } from '../../model/pollen';
import {
  type MushroomGround,
  placeIn,
  placeOf,
  placeOnGround,
} from './clump-layout';
import { groundOf, standingOn } from './flower-layout';
import type { Stand } from './flower-sight';
import type { Placement } from './layout';

/**
 * Each anchored mushroom of the opening clump, as it is stored: the bed lays
 * the clump out once, at the opening eye, so wherever an anchor moves its
 * foot it keeps the clump's size and splay (`placeAnchored`).
 */
const openers = new WeakMap<Footed, Footed>();

/** Whether `point` has ground on the layout (`groundOfPlane`): anywhere but a sliver straight behind `OPENING_EYE`. */
function hasGround(point: Point): boolean {
  return gathered(point).y > 0;
}

/**
 * `stand` as `anchor` sees it, moved with it onto `OPENING_EYE`: every
 * mushroom's and planted flower's foot `anchored`, each seeded flower's place
 * on the layout re-stood at its anchored foot, and whatever then stands in
 * the sliver straight behind the eye, which the layout has no ground for,
 * left out. A bee's flower stays in its ring slot round its anchored parent.
 * At `OPENING_EYE` it is `stand` itself.
 */
export function anchoredStand(stand: Stand, anchor: Eye): Stand {
  if (sameAnchor(anchor, OPENING_EYE)) return stand;
  const { layout, flowers, mushrooms, planted } = stand;
  const { camera } = layout;
  const moved = <Foot extends Point>(foot: Foot): Foot => ({
    ...foot,
    ...anchored(anchor, foot),
  });
  const seeded = flowers.flatMap((flower, index) => {
    const place = layout.flowers[index];
    if (!place) return [];
    const foot = moved(planeFootOf(groundOf(camera, place)));
    return hasGround(foot) ? [{ flower, place: standingOn(camera, foot) }] : [];
  });
  return {
    ...stand,
    layout: { ...layout, flowers: seeded.map(({ place }) => place) },
    flowers: seeded.map(({ flower }) => flower),
    mushrooms: mushrooms.flatMap((mushroom) => {
      const foot = moved(mushroom.foot);
      if (!hasGround(foot)) return [];
      const shifted = { ...mushroom, foot };
      if (openingIndex(mushroom.foot) !== undefined) {
        openers.set(shifted, mushroom);
      }
      return [shifted];
    }),
    planted: planted.flatMap((sown): Sown[] => {
      if (isBeeSown(sown)) return [sown];
      const foot: Footing = moved(sown.foot);
      return hasGround(foot) ? [{ ...sown, foot }] : [];
    }),
  };
}

/**
 * Where the anchored stand's layout stands `mushroom` (`placeIn`): one of the
 * opening clump at the clump's size and splay, as the bed draws it wherever
 * the eye walks, the rest as the forest.
 */
export function placeAnchored(
  ground: MushroomGround,
  mushroom: Footed,
): Placement | undefined {
  const place = placeIn(ground, mushroom);
  const stored = openers.get(mushroom);
  if (!place || !stored) return place;
  const { camera } = ground;
  const laid = placeOf(camera, stored);
  const asForest = placeOnGround(camera, groundOfPlane(stored.foot));
  return {
    ...place,
    ...pick(laid, 'splay'),
    size: (place.size * laid.size) / asForest.size,
  };
}
