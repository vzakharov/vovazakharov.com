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

import { FACE_REACH } from '../../model/bee-outline';
import { CRAWL_REACH } from '../../model/buzz-rest';
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
import type { InsectKind } from '../../model/insect-genes';
import { type Plot, slotTaken } from '../../model/pollen';
import { placeIn } from './clump-layout';
import { type Standing, standingAt } from './door-sight';
import { FLOWER_SWAY, type FlowerFoot, standingOn } from './flower-layout';
import {
  flowersOf,
  groundFor,
  mushroomFeet,
  type Placed,
  RING_SLOTS,
  ringFoot,
  type StandingFlower,
} from './flower-plots';
import type { Footing, MeadowLayout } from './layout';
import { tapReach } from './tap-reach';

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

/**
 * How far above a flower's centre a drinking butterfly's middle sits, past
 * the centre's own radius, in units of its size: far enough that its tail
 * stays off the centre, so its body rests on the head's upper rim and the
 * proboscis is seen going down into the flower.
 */
const ABOVE_CENTRE = 0.3;

/**
 * How far above a flower's centre a fly sits, in units of its size: on the
 * centre itself, which it has no proboscis to reach from the rim.
 */
const ON_CENTRE = 0.12;

/**
 * How far below the head's lower rim a bee's middle sits, in units of its
 * size: its head and thorax over the petals, facing in toward the centre as
 * a settled insect faces up the screen, and its abdomen over the rim. On a
 * head small beside the bee it sits lower still, its face reaching no
 * farther than the centre (`FACE_REACH`) even at the top of its crawl
 * (`CRAWL_REACH`), so at least half of the head stays in sight under it
 * wherever the crawl takes it.
 */
const PAST_RIM = 0.05;

/** How far a flower's centre reaches from the head's middle, in CSS px. */
export type Centred = { disc: number };

/** How far a flower's head reaches, and its centre (`Centred`). */
export type HeadReach = Pick<Circle, 'r'> & Centred;

/**
 * How far above the middle of a flower whose head reaches `r` and whose
 * centre reaches `disc` an insect of `kind`, `insectSize` to its unit, sits:
 * a butterfly on the upper rim, drinking down into the centre, a fly on the
 * centre, and a bee on the lower rim, below the middle.
 */
export function flowerLift(
  reach: HeadReach,
  insectSize: number,
  kind: InsectKind = 'butterfly',
): number {
  return flowerLiftAt(reach, insectSize, kind, { host: 1, insect: 1 });
}

/** The zooms a seat on a host is drawn at: the host's own, and the insect's sitting on it. */
export type SeatZooms = Record<'host' | 'insect', number>;

/**
 * `flowerLift` as drawn, when the flower is drawn at `zoom.host` and the
 * insect on it at `zoom.insect`: its head and centre at the flower's zoom,
 * the insect's own offsets at its own, so its legs stay on the head when the
 * two differ.
 */
export function flowerLiftAt(
  { r, disc }: HeadReach,
  insectSize: number,
  kind: InsectKind,
  zoom: SeatZooms,
): number {
  const own = insectSize * zoom.insect;
  switch (kind) {
    case 'butterfly': {
      return disc * zoom.host + ABOVE_CENTRE * own;
    }
    case 'fly': {
      return ON_CENTRE * own;
    }
    case 'bee': {
      return -Math.max(
        r * zoom.host + PAST_RIM * own,
        (FACE_REACH + CRAWL_REACH.y) * own,
      );
    }
    default: {
      return kind satisfies never;
    }
  }
}

/**
 * The meadow as the scene stands it: the layout, the visit's seeded flowers,
 * the planted ones, the ones the child pulled up, and the mushrooms standing.
 */
export type Stand = Pick<Meadow, 'mushrooms' | 'planted' | 'pulled'> & {
  layout: MeadowLayout;
  flowers: readonly Flower[];
};

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
export function perLayout<Measured extends object>(
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

/** A standing mushroom as the flowers' sight reads it: how near the front it stands, and its outlines as drawn. */
export type Cover = Pick<Standing, 'depth'> & {
  drawn: ReadonlyArray<{ outline: readonly Point[]; box: Box }>;
};

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

/** The flowers standing where a bee plants, and every foot on the ground a planting keeps off. */
type Ground = {
  standing: readonly StandingFlower[];
  claimed: readonly FlowerFoot[];
};

/**
 * Whether a flower planted at `foot` would have ground there among the
 * flowers of `standing`, off every foot of `claimed` (`groundFor`), and be
 * in sight on `layout` (`flowerInSight`), whatever its genes.
 */
function plantable(
  layout: MeadowLayout,
  foot: FlowerFoot,
  { standing, claimed }: Ground,
  covers: readonly Cover[],
): boolean {
  return (
    groundFor(foot, standing, claimed) &&
    sightingsAt(standingOn(layout.camera, foot), layout).every((sighting) =>
      flowerInSight(layout, sighting, covers),
    )
  );
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
 * Whether the child can plant a flower at `foot` on `stand`: it is
 * `plantable` as a bee's planting would be, so the flower stands and is in
 * sight on every screen (`roomIn`, for one foot).
 */
export function takesFlower(stand: Stand, foot: FlowerFoot): boolean {
  return roomIn(stand)(foot);
}

/**
 * Whether a flower planted at a foot on `stand` would stand there and be in
 * sight (`plantable`): what `stand` holds read once, for every foot asked
 * after.
 */
export function roomIn(stand: Stand): (foot: FlowerFoot) => boolean {
  const { layout, mushrooms } = stand;
  const ground = groundIn(stand);
  const covers = coversOn(layout, mushrooms);
  return (foot) => plantable(layout, foot, ground, covers);
}

/**
 * Where a bee could plant round each flower of `shown`: the first ring slot
 * no planted flower takes that is `plantable`, in sight, off
 * the foot of every mushroom standing (`mushroomFeet`).
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
      const spot = ringFoot(parent.foot, slot);
      return spot !== undefined && plantable(layout, spot, ground, covers);
    });
    return ring === -1 ? [] : [{ flower: id, ring }];
  });
}
