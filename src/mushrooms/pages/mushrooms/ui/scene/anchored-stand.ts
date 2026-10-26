/**
 * The meadow as an eye other than the opening one judges it: the mushrooms'
 * ground anchored at that eye (`anchoredGround`) and every planted and seeded
 * flower's foot moved with it onto `OPENING_EYE` (`anchored`), so a rule that
 * reads the opening layout runs unchanged and judges what the eye sees. What
 * a rule finds there goes back to the plane through `unanchored`.
 */

import { sameAnchor } from '../../model/anchor';
import { D_SEE_MOST } from '../../model/eye-height';
import type { Flower } from '../../model/flower-genes';
import { distanceBetween, type Point } from '../../model/geometry';
import {
  anchored,
  D_SEE,
  type Eye,
  type Footing,
  gathered,
  OPENING_EYE,
  planeFootOf,
} from '../../model/ground';
import { isBeeSown, type Sown } from '../../model/pollen';
import { anchoredGround } from './clump-layout';
import { groundOf, standingOn } from './flower-layout';
import type { SeededLayout, Stand } from './flower-sight';
import { PALE_SPAN } from './repaint-queue';
import type { WithHeight } from '@/kernel/shared/typings';
import type { WithCamera } from '../../model/ground';
import type { ClumpGround } from './clump-layout';
import type { Bedded } from './flower-layout';

/** What of the meadow's layout this reads. */
export type AnchoredStandLayout = WithHeight &
  WithCamera &
  ClumpGround &
  Bedded;

/**
 * How far from the anchor an anchored stand reads the meadow: a foot the rules
 * judge stands within the farthest brow (`D_SEE_MOST`) and `PALE_SPAN` of the
 * eye and a step more, and a rule counts round it (`FLOWER_SLOTS`,
 * `MUSHROOM_SLOTS`) `D_SEE` further.
 */
const STAND_REACH = D_SEE_MOST + D_SEE + PALE_SPAN + 1;

/** Whether `point` has ground on the layout (`groundOfPlane`): anywhere but a sliver straight behind `OPENING_EYE`. */
export function hasGround(point: Point): boolean {
  return gathered(point).y > 0;
}

/** `foot` moved with `anchor` onto `OPENING_EYE` (`anchored`), the rest of it kept: `foot` itself at `OPENING_EYE`. */
export function movedTo<Foot extends Point>(anchor: Eye, foot: Foot): Foot {
  if (sameAnchor(anchor, OPENING_EYE)) return foot;
  return { ...foot, ...anchored(anchor, foot) };
}

/** Whether `foot`, on the stored plane, stands within `STAND_REACH` of `anchor`. */
function inReach(anchor: Eye, foot: Point): boolean {
  return distanceBetween(anchor, foot) <= STAND_REACH;
}

/** One thing kept per key, for the last anchor it was asked at. */
type AtAnchor<Kept> = { anchor: Eye; kept: Kept };

/** `make`'s answer for `key` at `anchor`, the same object while the anchor stays (`sameAnchor`). */
function keptAt<Key extends object, Kept>(
  cache: WeakMap<Key, AtAnchor<Kept>>,
  key: Key,
  anchor: Eye,
  make: () => Kept,
): Kept {
  const known = cache.get(key);
  if (known && sameAnchor(known.anchor, anchor)) return known.kept;
  const kept = make();
  cache.set(key, { anchor, kept });
  return kept;
}

/** What anchoring a layout at an anchor changes: its flowers' feet and the seeded flowers on them, `from` the visit's. */
type Reseeded = {
  feet: Footing[];
  flowers: Flower[];
  from: readonly Flower[];
};

/** Each layout's `Reseeded`, by the seeded flowers it lays (`seededAt`). */
const reseedings = new WeakMap<AnchoredStandLayout, AtAnchor<Reseeded>>();
/** Each mushrooms list's mushrooms in reach of the last anchor asked (`STAND_REACH`). */
const mushroomsInReach = new WeakMap<
  Stand['mushrooms'],
  AtAnchor<Stand['mushrooms']>
>();

/**
 * `stand`'s layout anchored at `anchor`, its mushrooms' ground anchored
 * there (`anchoredGround`) and each seeded flower in reach re-stood at its
 * anchored foot, the re-standing kept per layout while the anchor stays.
 */
function seededAt<L extends AnchoredStandLayout>(
  { layout, flowers }: SeededLayout<L>,
  anchor: Eye,
): SeededLayout<L> {
  const known = reseedings.get(layout);
  const reseeded =
    known?.kept.from === flowers && sameAnchor(known.anchor, anchor)
      ? known.kept
      : reseed(layout, flowers, anchor);
  reseedings.set(layout, { anchor, kept: reseeded });
  return {
    layout: {
      ...layout,
      mushrooms: anchoredGround(layout.mushrooms, anchor),
      flowers: reseeded.feet,
    },
    flowers: reseeded.flowers,
  };
}

/** Each of `flowers` seeded on `layout` in reach of `anchor`, re-stood at its anchored foot. */
function reseed(
  { camera, flowers: feet }: AnchoredStandLayout,
  flowers: readonly Flower[],
  anchor: Eye,
): Reseeded {
  const seeded = flowers.flatMap((flower, index) => {
    const place = feet[index];
    if (!place) return [];
    const stored = planeFootOf(groundOf(camera, place));
    if (!inReach(anchor, stored)) return [];
    const foot = movedTo(anchor, stored);
    return hasGround(foot) ? [{ flower, place: standingOn(camera, foot) }] : [];
  });
  return {
    from: flowers,
    feet: seeded.map(({ place }) => place),
    flowers: seeded.map(({ flower }) => flower),
  };
}

/**
 * `stand` as `anchor` sees it, out to `STAND_REACH`: its mushrooms on their
 * ground anchored there (`anchoredGround`), its flowers moved with it onto
 * `OPENING_EYE` (`anchored`), none kept in the sliver behind the eye that has
 * no ground. A bee's flower is kept unmoved while its parent is, `ringFoot`
 * turning its slot with the anchor. The layout's ground and the mushrooms are
 * the same objects while the anchor stays, so a rule's caches by them hold
 * (`coversOn`). At `OPENING_EYE` it is `stand` itself.
 */
export function anchoredStand<L extends AnchoredStandLayout>(
  stand: Stand<L>,
  anchor: Eye,
): Stand<L> {
  if (sameAnchor(anchor, OPENING_EYE)) return stand;
  const { mushrooms, planted } = stand;
  const seeded = seededAt(stand, anchor);
  const kept = new Set(seeded.flowers.map(({ id }) => id));
  const reached = planted.flatMap((sown): Sown[] => {
    if (isBeeSown(sown)) {
      if (!kept.has(sown.parent)) return [];
      kept.add(sown.id);
      return [sown];
    }
    if (!inReach(anchor, sown.foot)) return [];
    const foot: Footing = movedTo(anchor, sown.foot);
    if (!hasGround(foot)) return [];
    kept.add(sown.id);
    return [{ ...sown, foot }];
  });
  return {
    ...stand,
    ...seeded,
    mushrooms: keptAt(mushroomsInReach, mushrooms, anchor, () =>
      mushrooms.filter(({ foot }) => inReach(anchor, foot)),
    ),
    planted: reached,
  };
}
