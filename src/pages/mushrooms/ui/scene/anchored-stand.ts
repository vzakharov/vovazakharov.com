/**
 * The meadow as an eye other than the opening one judges it: the mushrooms'
 * ground anchored at that eye (`anchoredGround`) and every planted and seeded
 * flower's foot moved with it onto `OPENING_EYE` (`anchored`), so a rule that
 * reads the opening layout runs unchanged and judges what the eye sees. What
 * a rule finds there goes back to the plane through `unanchored`.
 */

import { sameAnchor } from '../../model/anchor';
import type { Point } from '../../model/geometry';
import {
  anchored,
  type Eye,
  type Footing,
  gathered,
  OPENING_EYE,
  planeFootOf,
} from '../../model/ground';
import { isBeeSown, type Sown } from '../../model/pollen';
import { anchoredGround } from './clump-layout';
import { groundOf, standingOn } from './flower-layout';
import type { Stand } from './flower-sight';

/** Whether `point` has ground on the layout (`groundOfPlane`): anywhere but a sliver straight behind `OPENING_EYE`. */
function hasGround(point: Point): boolean {
  return gathered(point).y > 0;
}

/**
 * `stand` as `anchor` sees it: the mushrooms stood on their ground anchored
 * at it (`anchoredGround`), each where `placeIn` stands it there; every
 * planted flower's foot moved with it onto `OPENING_EYE` (`anchored`), each
 * seeded flower's place on the layout re-stood at its anchored foot, and
 * every flower that then stands in the sliver straight behind the eye, which
 * the layout has no ground for, left out. A bee's flower stays in its ring
 * slot round its anchored parent, the slot turned with the anchor
 * (`ringFoot`), so it stands on the same plane spot from every anchor. At
 * `OPENING_EYE` it is `stand` itself.
 */
export function anchoredStand(stand: Stand, anchor: Eye): Stand {
  if (sameAnchor(anchor, OPENING_EYE)) return stand;
  const { layout, flowers, planted } = stand;
  const { camera, mushrooms } = layout;
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
    layout: {
      ...layout,
      mushrooms: anchoredGround(mushrooms, anchor),
      flowers: seeded.map(({ place }) => place),
    },
    flowers: seeded.map(({ flower }) => flower),
    planted: planted.flatMap((sown): Sown[] => {
      if (isBeeSown(sown)) return [sown];
      const foot: Footing = moved(sown.foot);
      return hasGround(foot) ? [{ ...sown, foot }] : [];
    }),
  };
}
