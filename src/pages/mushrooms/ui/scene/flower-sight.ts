/**
 * Whether a flower can be seen — by an insect sitting on it, and by a child
 * looking for a flower a bee planted — and where a bee could plant one, as
 * pure functions of the layout and what stands in it. A flower in sight
 * stands inside the world's edges by an insect's wings, its head in view past
 * the mushrooms in front of it, wherever the crop stands: the controls stand
 * on the screen, not the world, so a pan never changes what is in sight. A
 * flower is planted only where it would be in sight.
 */

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { flowersCrowdAt } from '../../model/crowding';
import {
  type Flower,
  FLOWER_RANGES,
  flowerGenes,
  flowerHead,
} from '../../model/flower-genes';
import type { Meadow } from '../../model/game';
import {
  type Box,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import type { Camera, Eye } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { pinholeOf } from '../../model/pinhole';
import { type Plot, slotTaken } from '../../model/pollen';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { placeIn } from './clump-layout';
import { type Standing, standingAt } from './door-sight';
import { FLOWER_SWAY, type Footing, standingOn } from './flower-layout';
import {
  flowersOf,
  groundFor,
  inFlowerBand,
  mushroomFeet,
  type Placed,
  RING_SLOTS,
  ringFoot,
  type StandingFlower,
} from './flower-plots';
import { flowerLift } from './flower-seat';
import type { MeadowLayout } from './layout';
import { tapReach } from './tap-reach';
import { middleOf } from './view';

/**
 * How far off a cap's crown toward its rims, or off a flower's centre toward
 * its petals' tips, a butterfly sits at the most, its phase picking where, so
 * not every one lands dead centre.
 */
export const PERCH_SPREAD = 0.3;
/** The widest a butterfly's open wings span, in units of its size, whatever its genes. */
export const WIDEST_SPAN = 1.22;
/**
 * How much of a flower's head, out from its centre as a share of its reach,
 * has to show past the mushrooms in front of it, and at how many points
 * round it that is read, beside the centre.
 */
const HEAD_SHOWN = 0.5;
const HEAD_RING = 8;

/** What of the meadow a `Stand` reads: the mushrooms standing, the spores lying, the planted flowers, and the ones the child pulled up. */
const STOOD = ['mushrooms', 'spores', 'planted', 'pulled'] as const;

/** The meadow as the scene stands it: the layout, the visit's seeded flowers, and what of the meadow `STOOD` names. */
export type Stand = Pick<Meadow, (typeof STOOD)[number]> & {
  layout: MeadowLayout;
  flowers: readonly Flower[];
};

/** `meadow` as it stands on `layout` among the visit's seeded `flowers`. */
export function standOf(
  layout: MeadowLayout,
  flowers: readonly Flower[],
  meadow: Meadow,
): Stand {
  return { layout, flowers, ...pick(meadow, ...STOOD) };
}

/**
 * A flower as the sight reads it: its place, its head on screen, and how far
 * over the head's middle the insect it is read for sits (`flowerLift`).
 */
export type Sighting = Placed & { head: Circle; lift: number };

/** A standing flower as the sight reads it for an insect of `kind` (`Sighting`). */
export function sightingOf(
  { place, seed }: StandingFlower,
  { insectSizes }: MeadowLayout,
  kind: InsectKind = 'butterfly',
): Sighting {
  const genes = flowerGenes({ seed });
  const head = flowerHead(genes, place.size);
  return {
    place,
    head: { ...head, x: place.x + head.x, y: place.y + head.y },
    lift: flowerLift(
      { ...pick(head, 'r'), disc: genes.centre * place.size },
      insectSizes[kind],
      kind,
    ),
  };
}

/**
 * A flower to be planted at `place` as it could grow, whatever its genes:
 * its stem bent either way or not at all, its head and its centre at their
 * smallest and largest.
 */
function sightingsAt(place: Footing, { insectSize }: MeadowLayout): Sighting[] {
  const [least, most] = FLOWER_RANGES.stemBend;
  return [least, 0, most].flatMap((bend) =>
    FLOWER_RANGES.petalLength.flatMap((petal) =>
      FLOWER_RANGES.centre.map((centre) => ({
        place,
        head: {
          x: place.x + bend * place.size,
          y: place.y - place.size,
          r: petal * place.size,
        },
        lift: flowerLift(
          { r: petal * place.size, disc: centre * place.size },
          insectSize,
        ),
      })),
    ),
  );
}

/**
 * `measure` of a layout, measured once a layout: a layout is never changed
 * once laid out, so what the sight reads off it alone is read once.
 */
function perLayout<Measured extends object>(
  measure: (layout: MeadowLayout) => Measured,
): (layout: MeadowLayout) => Measured {
  const measured = new WeakMap<MeadowLayout, Measured>();
  return (layout) => {
    const known = measured.get(layout);
    if (known) return known;
    const fresh = measure(layout);
    measured.set(layout, fresh);
    return fresh;
  };
}

/** How far round its head's middle a flower whose petals reach `r` answers a tap: a little past them, and never under `TAP_RADIUS`. */
export function flowerTapReach(r: number): number {
  return tapReach(r * 1.2);
}

/** A mushroom's outlines as drawn, each with the box round it. */
export type BoxedOutlines = {
  drawn: ReadonlyArray<{ outline: readonly Point[]; box: Box }>;
};

/** A standing mushroom as the flowers' sight reads it: how near the front it stands, and its outlines as drawn. */
export type Cover = Pick<Standing, 'depth'> & BoxedOutlines;

/**
 * Whether an insect on `flower` can be seen there, on `layout`: its seat
 * (`Sighting`), as far as the sway and its spot move it, stands inside the
 * world's edges by half `span`, its kind's widest wingspan, a butterfly's
 * unless said, and no mushroom of
 * `covers` standing nearer the front covers the head's middle (`HEAD_SHOWN`).
 */
export function flowerInSight(
  layout: MeadowLayout,
  { place, head, lift }: Sighting,
  covers: readonly Cover[],
  span: number = WIDEST_SPAN * layout.insectSize,
): boolean {
  const centre = pick(head, 'x', 'y');
  const seat = { ...centre, y: centre.y - lift };
  const reach =
    span / 2 +
    PERCH_SPREAD * head.r +
    (place.size + lift) * Math.sin(FLOWER_SWAY);
  const { camera, height } = layout;
  const inWorld =
    seat.x - reach >= 0 &&
    seat.x + reach <= camera.world &&
    seat.y - reach >= 0 &&
    seat.y + reach <= height;
  if (!inWorld) return false;
  const points = [
    centre,
    ...Array.from({ length: HEAD_RING }, (_, step) => {
      const angle = (step * Math.PI * 2) / HEAD_RING;
      return {
        x: centre.x + HEAD_SHOWN * head.r * Math.cos(angle),
        y: centre.y + HEAD_SHOWN * head.r * Math.sin(angle),
      };
    }),
  ];
  const headBox = boxAround(points);
  return covers.every(
    ({ depth, drawn }) =>
      depth <= place.y ||
      drawn.every(
        ({ outline, box }) =>
          !boxesMeet(headBox, box) ||
          points.every((point) => !containsPoint(outline, point)),
      ),
  );
}

/** Each layout's covers, by the mushrooms standing on it (`coversOn`). */
const coverings = perLayout(
  () => new WeakMap<Stand['mushrooms'], readonly Cover[]>(),
);

/** Every standing mushroom of `mushrooms` on `layout`, as the flowers' sight reads it. */
export function coversOn(
  layout: MeadowLayout,
  mushrooms: Stand['mushrooms'],
): readonly Cover[] {
  // The meadow's mushrooms are never changed in place, only replaced.
  const covering = coverings(layout);
  const known = covering.get(mushrooms);
  if (known) return known;
  const covers = mushrooms.flatMap((mushroom) => {
    const place = placeIn(layout.mushrooms, mushroom);
    if (!place) return [];
    const { depth, drawn } = standingAt(place, mushroom);
    const outlines = drawn.map((outline) => ({
      outline,
      box: boxAround(outline),
    }));
    return [{ depth, drawn: outlines }];
  });
  covering.set(mushrooms, covers);
  return covers;
}

/**
 * The screen's sides, in world px across `camera`'s layout, as the opening
 * crop shows them: the screen is linear in azimuth and the layout its
 * tangent, so a thing stands on the screen just where it stands between them.
 */
export function screenSides(camera: Camera): Record<'left' | 'right', number> {
  const { x, focal } = pinholeOf(camera);
  const half = focal * Math.tan(x / focal);
  const middle = middleOf(camera);
  return { left: middle - half, right: middle + half };
}

/**
 * Whether `sighting`'s whole head, as far as the sway moves it, stands
 * between the screen's sides on `layout` (`screenSides`).
 */
function headOnScreen(
  { camera }: MeadowLayout,
  { place, head }: Sighting,
): boolean {
  const { left, right } = screenSides(camera);
  const reach = head.r + place.size * Math.sin(FLOWER_SWAY);
  return head.x - reach >= left && head.x + reach <= right;
}

/** The flowers standing where a bee plants, and every foot on the ground a planting keeps off. */
type Ground = {
  standing: readonly StandingFlower[];
  claimed: readonly Footing[];
};

/**
 * Whether a flower planted at `foot` would have ground there among the
 * flowers of `standing`, off every foot of `claimed` (`groundFor`), and be
 * in sight on `layout` (`flowerInSight`), whatever its genes, and fewer than
 * `FLOWER_SLOTS` of `standing` stand round it (`flowersCrowdAt`).
 */
function plantable(
  layout: MeadowLayout,
  foot: Footing,
  { standing, claimed }: Ground,
  covers: readonly Cover[],
): boolean {
  return (
    !flowersCrowdAt(standing, foot) &&
    groundFor(foot, standing, claimed) &&
    sightAt(layout, covers, foot).inSight
  );
}

/** How a flower planted on a foot would be seen, whatever its genes: in sight past the covers (`flowerInSight`), and its head whole on the screen (`headOnScreen`). */
type FootSight = Record<'inSight' | 'onScreen', boolean>;

/** Each layout's `FootSight`s, by the covers judged against and the foot. */
const footSights = perLayout(
  () => new WeakMap<readonly Cover[], Map<string, FootSight>>(),
);

/**
 * How a flower planted at `foot` on `layout` would be seen among `covers`,
 * judged once a foot: what it reads is the layout, the covers and the foot
 * alone, and a sow re-judges the same ring slots round every flower that
 * still has room (`roomFor`), each of them testing every sighting against
 * every mushroom's outline.
 */
function sightAt(
  layout: MeadowLayout,
  covers: readonly Cover[],
  foot: Footing,
): FootSight {
  const byCovers = footSights(layout);
  const known = byCovers.get(covers) ?? new Map<string, FootSight>();
  byCovers.set(covers, known);
  const key = `${String(foot.x)} ${String(foot.y)} ${String(foot.size)}`;
  const judged = known.get(key);
  if (judged) return judged;
  const sightings = sightingsAt(standingOn(layout.camera, foot), layout);
  const fresh = {
    inSight: sightings.every((sighting) =>
      flowerInSight(layout, sighting, covers),
    ),
    onScreen: sightings.every((sighting) => headOnScreen(layout, sighting)),
  };
  known.set(key, fresh);
  return fresh;
}

/** The flowers standing in `stand`, and the mushrooms' feet a planting keeps off. */
function groundIn(stand: Stand): Ground {
  const { layout, mushrooms } = stand;
  return {
    standing: flowersOf(stand),
    claimed: mushroomFeet(layout, mushrooms),
  };
}

/**
 * Whether the child can plant a flower at `foot`, on the plane, on `stand`
 * as the anchor of `eye` judges it: it is `plantable` as a bee's planting
 * would be, and in the flowers' band, so the flower stands and is in sight
 * on every screen (`roomFrom`, for one foot).
 */
export function takesFlower(stand: Stand, foot: Footing, eye: Eye): boolean {
  return roomFrom(stand, eye)(foot);
}

/**
 * `roomIn` on `stand` as the anchor of `eye` judges it (`anchoredStand`),
 * for a foot on the plane: moved with the anchor, and taking no flower in
 * the sliver straight behind it, which has no ground.
 */
function roomFrom(stand: Stand, eye: Eye): (foot: Footing) => boolean {
  const anchor = anchorOf(eye);
  const room = roomIn(anchoredStand(stand, anchor));
  return (foot) => {
    const moved = movedTo(anchor, foot);
    return hasGround(moved) && room(moved);
  };
}

/**
 * Whether the child's flower planted at a foot on `stand` would stand there
 * and be in sight (`plantable`), in the flowers' band (`inFlowerBand`): what
 * `stand` holds read once, for every foot asked after.
 */
export function roomIn(stand: Stand): (foot: Footing) => boolean {
  const { layout, mushrooms } = stand;
  const ground = groundIn(stand);
  const covers = coversOn(layout, mushrooms);
  return (foot) =>
    inFlowerBand(foot) && plantable(layout, foot, ground, covers);
}

/**
 * Where a bee could plant round each flower of `shown`, on `stand` as judged
 * from the anchor: the first ring slot no planted flower takes that is
 * `plantable`, in sight, off the foot of every mushroom standing
 * (`mushroomFeet`), at any depth, and whose head, whatever its genes, stands
 * whole on the screen (`headOnScreen`), so the child sees every flower a bee
 * plants come up. A flower whose ring has no such slot takes none.
 */
export function roomFor(
  stand: Stand,
  shown: readonly string[],
  covers: readonly Cover[],
): Plot['room'] {
  const { layout, planted } = stand;
  const ground = groundIn(stand);
  return shown.flatMap((id) => {
    const parent = ground.standing.find((flower) => flower.id === id);
    if (!parent) return [];
    const ring = RING_SLOTS.findIndex((_, slot) => {
      if (slotTaken(planted, id, slot)) return false;
      const spot = ringFoot(parent.foot, slot, layout.mushrooms.anchor);
      return (
        spot !== undefined &&
        plantable(layout, spot, ground, covers) &&
        sightAt(layout, covers, spot).onScreen
      );
    });
    return ring === -1 ? [] : [{ flower: id, ring }];
  });
}
