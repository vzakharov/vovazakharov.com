/**
 * Whether a flower can be seen — by an insect sitting on it, and by a child
 * looking for a flower a bee planted — and where a bee could plant one, as
 * pure functions of the layout and what stands in it. A flower in sight
 * stands inside the world's edges by an insect's wings, its head in view past
 * the mushrooms in front of it, wherever the crop stands: the controls stand
 * on the screen, not the world, so a pan never changes what is in sight. A
 * flower is planted only where it would be in sight.
 */

import { pick } from '@/kernel/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { flowersCrowdAt } from '../../model/crowding';
import {
  type Flower,
  FLOWER_RANGES,
  flowerGenes,
  flowerHead,
  type WithPulled,
} from '../../model/flower-genes';
import type { WithMushrooms } from '../../model/planted';
import {
  type Box,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import type { Camera, Eye, Layered } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import type { WithPlanted } from '../../model/insects';
import { pinholeOf } from '../../model/pinhole';
import { type Plot, slotTaken } from '../../model/pollen';
import type { WithSpores } from '../../model/planted';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { type MushroomGround, placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import { FLOWER_SWAY, standingOn } from './flower-layout';
import type { Footing } from '../../model/ground';
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
import { tapReach } from './tap-reach';
import { middleOf } from './view';
import type { WithHeight } from '@/kernel/shared/typings';
import type { WithCamera } from '../../model/ground';
import type { InsectScaled } from './insect-size';
import type { ClumpGround } from './clump-layout';
import type { Bedded } from './flower-layout';

/** What of the meadow's layout this reads. */
export type FlowerSightLayout = WithHeight &
  WithCamera &
  InsectScaled &
  ClumpGround &
  Bedded;

/**
 * How far off a cap's crown toward its rims, or off a flower's centre toward
 * its petals' tips, a butterfly sits at the most, its phase picking where, so
 * not every one lands dead centre.
 */
export const PERCH_SPREAD = 0.3;
/** The widest a butterfly's open wings span, in units of its size, whatever its genes. */
export const WIDEST_SPAN = 1.22;

/** The widest a butterfly's wings span on `layout`, in px: the span `flowerInSight` judges by unless told. */
export function widestSpanOn({ insectSize }: FlowerSightLayout): number {
  return WIDEST_SPAN * insectSize;
}
/**
 * How much of a flower's head, out from its centre as a share of its reach,
 * has to show past the mushrooms in front of it, and at how many points
 * round it that is read, beside the centre.
 */
const HEAD_SHOWN = 0.5;
const HEAD_RING = 8;

/** The mushrooms standing and the flowers pulled up: what the child's hands left on the ground. */
export type Tended = WithMushrooms & WithPulled;

/** What of the meadow a `Stand` reads: the mushrooms standing, the spores lying, the planted flowers, and the ones the child pulled up. */
const STOOD = ['mushrooms', 'spores', 'planted', 'pulled'] as const;

/**
 * The meadow as the scene stands it: the layout, the visit's seeded flowers,
 * and what of the meadow `STOOD` names; generic in the layout, which the
 * scene reads more of than the sight does.
 */
export type Stand<L = FlowerSightLayout> = PlotGround<L> & WithSpores;

/** The layout the scene stands the meadow on. */
export type WithLayout<L = FlowerSightLayout> = {
  layout: L;
};
/** The layout and the visit's seeded flowers on it. */
export type SeededLayout<L = FlowerSightLayout> = WithLayout<L> & {
  flowers: readonly Flower[];
};
/** A `Stand` but for its spores: what the flowers' plots are laid among. */
export type PlotGround<L = FlowerSightLayout> = SeededLayout<L> &
  Tended &
  WithPlanted;

/** `meadow` as it stands on `layout` among the visit's seeded `flowers`. */
export function standOf<L extends FlowerSightLayout>(
  layout: L,
  flowers: readonly Flower[],
  meadow: Tended & WithPlanted & WithSpores,
): Stand<L> {
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
  { insectSizes }: FlowerSightLayout,
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
function sightingsAt(
  place: Footing,
  { insectSize }: FlowerSightLayout,
): Sighting[] {
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
 * A store made once per mushrooms' ground (`MushroomGround`): what the sight
 * keeps reads off a layout only its camera, the screen it draws and the sizes
 * it scales by, which the ground holds, and its anchor, which the ground is a
 * new object for (`anchoredGround`). Keyed by the ground rather than the
 * layout, it holds across an anchored stand's layouts, which are made afresh.
 */
function perGround<Store extends object>(
  make: () => Store,
): (layout: FlowerSightLayout) => Store {
  const stores = new WeakMap<MushroomGround, Store>();
  return ({ mushrooms }) => {
    const known = stores.get(mushrooms);
    if (known) return known;
    const fresh = make();
    stores.set(mushrooms, fresh);
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
export type Cover = Layered & BoxedOutlines;

/**
 * Whether an insect on `flower` can be seen there, on `layout`: its seat
 * (`Sighting`), as far as the sway and its spot move it, stands inside the
 * world's edges by half `span`, its kind's widest wingspan, a butterfly's
 * unless said, and no mushroom of
 * `covers` standing nearer the front covers the head's middle (`HEAD_SHOWN`).
 */
export function flowerInSight(
  layout: FlowerSightLayout,
  { place, head, lift }: Sighting,
  covers: readonly Cover[],
  span: number = widestSpanOn(layout),
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

/** Each ground's covers, by the mushrooms standing on it (`coversOn`). */
const coverings = perGround(
  () => new WeakMap<Stand['mushrooms'], readonly Cover[]>(),
);

/** Every standing mushroom of `mushrooms` on `layout`, as the flowers' sight reads it. */
export function coversOn(
  layout: FlowerSightLayout,
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
  { camera }: FlowerSightLayout,
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
  layout: FlowerSightLayout,
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

/** Each ground's `FootSight`s, by the covers judged against and the foot. */
const footSights = perGround(
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
  layout: FlowerSightLayout,
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
function groundIn<L extends FlowerSightLayout>(stand: Stand<L>): Ground {
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
export function takesFlower<L extends FlowerSightLayout>(
  stand: Stand<L>,
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
function roomFrom<L extends FlowerSightLayout>(
  stand: Stand<L>,
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
 * and be in sight (`plantable`), in the flowers' band (`inFlowerBand`): what
 * `stand` holds read once, for every foot asked after.
 */
export function roomIn<L extends FlowerSightLayout>(
  stand: Stand<L>,
): (foot: Footing) => boolean {
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
export function roomFor<L extends FlowerSightLayout>(
  stand: Stand<L>,
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
