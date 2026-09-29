/**
 * Whether a flower can be seen — by an insect sitting on it, and by a child
 * looking for a flower a bee planted — and where a bee could plant one, as
 * pure functions of the layout and what stands in it. A flower in sight
 * stands clear of every control and the screen's edges by an insect's
 * wings, its head in view past the mushrooms in front of it; a flower is
 * planted only where it would be in sight on this screen.
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
  groundFor,
  mushroomFeet,
  type Placed,
  RING_SLOTS,
  ringFoot,
  type StandingFlower,
  standingFlowers,
} from './flower-plots';
import type { Footing, MeadowLayout } from './layout';
import { standingControls, tapReach } from './sky-layout';

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
  { r, disc }: HeadReach,
  insectSize: number,
  kind: InsectKind = 'butterfly',
): number {
  switch (kind) {
    case 'butterfly': {
      return disc + ABOVE_CENTRE * insectSize;
    }
    case 'fly': {
      return ON_CENTRE * insectSize;
    }
    case 'bee': {
      return -Math.max(
        r + PAST_RIM * insectSize,
        (FACE_REACH + CRAWL_REACH.y) * insectSize,
      );
    }
    default: {
      return kind satisfies never;
    }
  }
}

/**
 * The meadow as the scene stands it: the layout, the visit's seeded flowers,
 * the planted ones, and the mushrooms standing.
 */
export type Stand = Pick<Meadow, 'mushrooms' | 'planted'> & {
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

/** Every control's tap circle, as far as a finger reaches it. */
export const tapCircles = perLayout((layout): readonly Circle[] => {
  const { picker, housePicker } = layout;
  return [...standingControls(layout), ...picker, ...housePicker].map(
    (circle) => ({ ...circle, r: tapReach(circle.r) }),
  );
});

/** A standing mushroom as the flowers' sight reads it: how near the front it stands, and its outlines as drawn. */
export type Cover = Pick<Standing, 'depth'> & {
  drawn: ReadonlyArray<{ outline: readonly Point[]; box: Box }>;
};

/**
 * Whether an insect on `flower` can be seen there, on `layout`: its seat
 * (`Sighting`), as far as the sway and its spot move it, stands clear of
 * every control's tap circle and of the screen's edge by half `span`, its
 * kind's widest wingspan, a butterfly's unless said, and no mushroom of
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
  const { width, height } = layout;
  const onScreen =
    seat.x - reach >= 0 &&
    seat.x + reach <= width &&
    seat.y - reach >= 0 &&
    seat.y + reach <= height;
  const clear = tapCircles(layout).every(
    ({ x, y, r }) => Math.hypot(seat.x - x, seat.y - y) >= r + reach,
  );
  if (!onScreen || !clear) return false;
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
 * in sight on `layout`, this screen (`flowerInSight`), whatever its genes.
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

/**
 * Where a bee could plant round each flower of `shown`: the first ring slot
 * no planted flower takes that is `plantable`, in sight on this screen, off
 * the foot of every mushroom standing (`mushroomFeet`).
 */
export function roomFor(
  { layout, flowers, planted, mushrooms }: Stand,
  shown: readonly string[],
  covers: readonly Cover[],
): Plot['room'] {
  const here = standingFlowers(layout, flowers, planted, mushrooms);
  const ground: Ground = {
    standing: here,
    claimed: mushroomFeet(layout, mushrooms),
  };
  return shown.flatMap((id) => {
    const parent = here.find((flower) => flower.id === id);
    if (!parent) return [];
    const ring = RING_SLOTS.findIndex((_, slot) => {
      if (slotTaken(planted, id, slot)) return false;
      const spot = ringFoot(parent.foot, slot);
      return spot !== undefined && plantable(layout, spot, ground, covers);
    });
    return ring === -1 ? [] : [{ flower: id, ring }];
  });
}
