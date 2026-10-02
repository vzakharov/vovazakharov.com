/**
 * The meadow as an eye other than the opening one judges it: the mushrooms'
 * ground anchored at that eye (`anchoredGround`) and every planted and seeded
 * flower's foot moved with it onto `OPENING_EYE` (`anchored`), so a rule that
 * reads the opening layout runs unchanged and judges what the eye sees. What
 * a rule finds there goes back to the plane through `unanchored`.
 */

import { anchorOf, sameAnchor } from '../../model/anchor';
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
 * How far from the anchor, on the plane, an anchored stand reads the meadow:
 * a foot the rules judge stands within `D_SEE` and `PALE_SPAN` of the eye
 * and a step more, and the most a rule counts round it (`FLOWER_SLOTS`,
 * `MUSHROOM_SLOTS`) reaches `D_SEE` past it, so nothing a rule reads stands
 * farther.
 */
export const STAND_REACH = 2 * D_SEE + PALE_SPAN + 1;

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
type Seeded = { layout: MeadowLayout; flowers: readonly Flower[] };

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
function seededAt(
  { layout, flowers }: Pick<Stand, 'layout' | 'flowers'>,
  anchor: Eye,
): Seeded {
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
 * `stand` as `anchor` sees it, read out to `STAND_REACH` of it: the
 * mushrooms in reach, by their stored feet, stood on their ground anchored
 * at it (`anchoredGround`), each where `placeIn` stands it there; every
 * planted flower in reach moved with it onto `OPENING_EYE` (`anchored`),
 * each seeded flower in reach re-stood at its anchored foot, and every
 * flower that then stands in the sliver straight behind the eye, which the
 * layout has no ground for, left out. A bee's flower is kept while its
 * parent is, and stays in its ring slot round its anchored parent, the slot
 * turned with the anchor (`ringFoot`), so it stands on the same plane spot
 * from every anchor. The layout and the mushrooms are the same objects while
 * the anchor stays, so a rule's caches by them hold (`coversOn`). At
 * `OPENING_EYE` it is `stand` itself.
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

/** `stand` as the anchor of `eye` sees it (`anchoredStand`, `anchorOf`). */
export function judgedFrom(stand: Stand, eye: Eye): Stand {
  return anchoredStand(stand, anchorOf(eye));
}
