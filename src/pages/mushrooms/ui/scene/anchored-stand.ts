/**
 * The meadow as an eye other than the opening one judges it: the mushrooms'
 * ground anchored at that eye (`anchoredGround`) and every planted and seeded
 * flower's foot moved with it onto `OPENING_EYE` (`anchored`), so a rule that
 * reads the opening layout runs unchanged and judges what the eye sees. What
 * a rule finds there goes back to the plane through `unanchored`.
 */

import { sameAnchor } from '../../model/anchor';
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
import type { Stand } from './flower-sight';
import type { MeadowLayout } from './layout';
import { PALE_SPAN } from './repaint-queue';

/**
 * How far from the anchor an anchored stand reads the meadow: a foot the rules
 * judge stands within `D_SEE` and `PALE_SPAN` of the eye and a step more, and
 * a rule counts round it (`FLOWER_SLOTS`, `MUSHROOM_SLOTS`) `D_SEE` further.
 */
const STAND_REACH = 2 * D_SEE + PALE_SPAN + 1;

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

/** The seeded flowers of an anchored stand, each with its place on the anchored layout. */
type Seeded = Pick<Stand, 'layout' | 'flowers'>;

/** Each layout's anchored layout and seeded flowers, by the seeded flowers it lays (`seededAt`). */
const anchoredLayouts = new WeakMap<
  MeadowLayout,
  AtAnchor<Seeded & { from: readonly Flower[] }>
>();
/** Each mushrooms list's mushrooms in reach of the last anchor asked (`STAND_REACH`). */
const mushroomsInReach = new WeakMap<
  Stand['mushrooms'],
  AtAnchor<Stand['mushrooms']>
>();

/**
 * `stand`'s layout anchored at `anchor`, its mushrooms' ground anchored
 * there and each seeded flower in reach re-stood at its anchored foot, kept
 * per layout while the anchor stays, so whatever a rule keeps per layout
 * (`perLayout`) holds until the anchor moves.
 */
function seededAt({ layout, flowers }: Seeded, anchor: Eye): Seeded {
  const known = anchoredLayouts.get(layout);
  if (known?.kept.from === flowers && sameAnchor(known.anchor, anchor)) {
    return known.kept;
  }
  const { camera, mushrooms } = layout;
  const seeded = flowers.flatMap((flower, index) => {
    const place = layout.flowers[index];
    if (!place) return [];
    const stored = planeFootOf(groundOf(camera, place));
    if (!inReach(anchor, stored)) return [];
    const foot = movedTo(anchor, stored);
    return hasGround(foot) ? [{ flower, place: standingOn(camera, foot) }] : [];
  });
  const kept = {
    from: flowers,
    layout: {
      ...layout,
      mushrooms: anchoredGround(mushrooms, anchor),
      flowers: seeded.map(({ place }) => place),
    },
    flowers: seeded.map(({ flower }) => flower),
  };
  anchoredLayouts.set(layout, { anchor, kept });
  return kept;
}

/**
 * `stand` as `anchor` sees it, out to `STAND_REACH`: its mushrooms on their
 * ground anchored there (`anchoredGround`), its flowers moved with it onto
 * `OPENING_EYE` (`anchored`), none kept in the sliver behind the eye that has
 * no ground. A bee's flower is kept unmoved while its parent is, `ringFoot`
 * turning its slot with the anchor. The layout and the mushrooms are the same
 * objects while the anchor stays, so a rule's caches by them hold
 * (`coversOn`). At `OPENING_EYE` it is `stand` itself.
 */
export function anchoredStand(stand: Stand, anchor: Eye): Stand {
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
