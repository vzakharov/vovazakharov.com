/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch a
 * butterfly sits. A flower is a perch only where a butterfly on it can be
 * seen; a perch holds one butterfly at a time, and none goes to a perch
 * crowded by a taken one, so no two drawn butterflies cover much of each
 * other. A butterfly with no perch open roams between spots in the open air
 * over the meadow, clear of the controls and inside the screen.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import type { Perch, Sight } from '../../model/flight';
import { type Flower, flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Meadow } from '../../model/game';
import {
  type Box,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  placedAt,
  type Point,
} from '../../model/geometry';
import { phaseOf } from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { type Standing, standingAt } from './door-sight';
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';

/**
 * How far off a cap's crown toward its rims, or off a flower's centre toward
 * its petals' tips, a butterfly sits at the most, its phase picking where, so
 * not every one lands dead centre.
 */
const PERCH_SPREAD = 0.3;
/** The widest a butterfly's open wings span, in units of its size, whatever its genes. */
export const WIDEST_SPAN = 1.22;
/** How much of the narrower of two perched butterflies' spans the other may cover. */
export const MOST_OVERLAP = 0.25;
/** A flower's lean at the breeze's strongest, in radians. */
export const FLOWER_SWAY = 0.09;
/**
 * How much of a flower's head, out from its centre as a share of its reach,
 * has to show past the mushrooms in front of it, and at how many points
 * round it that is read, beside the centre.
 */
const HEAD_SHOWN = 0.5;
const HEAD_RING = 8;
/** How many spots across and down the open air offers a roaming butterfly, before the controls take theirs out. */
const AIR_ACROSS = 6;
const AIR_DOWN = 4;

/**
 * How far above a flower's centre a drinking butterfly's middle sits, past
 * the centre's own radius, in units of its size: far enough that its tail
 * stays off the centre, so its body rests on the head's upper rim and the
 * proboscis is seen going down into the flower.
 */
const ABOVE_CENTRE = 0.3;

/** How far above the middle of a flower whose centre is `disc` across a butterfly `insectSize` to its unit sits. */
export function flowerLift(disc: number, insectSize: number): number {
  return disc + ABOVE_CENTRE * insectSize;
}

/** Where on its perch `insect` sits, from -`PERCH_SPREAD` to `PERCH_SPREAD` of the way out. */
export function perchSpot(insect: Seeded): number {
  return Math.sin(phaseOf(insect) * 5) * PERCH_SPREAD;
}

/** The meadow as the scene stands it: the layout, the visit's flowers, and the mushrooms standing. */
export type Stand = Pick<Meadow, 'mushrooms'> & {
  layout: MeadowLayout;
  flowers: readonly Flower[];
};

/**
 * The flower at `index` as the layout stands it: its place, its head on
 * screen, and how far over the head's middle a drinking butterfly sits.
 */
function flowerAt(
  { layout, flowers }: Pick<Stand, 'layout' | 'flowers'>,
  index: number,
) {
  const place = layout.flowers[index];
  const flower = flowers[index];
  if (!place || !flower) return;
  const genes = flowerGenes(flower);
  const head = flowerHead(genes, place.size);
  return {
    place,
    head: { ...head, x: place.x + head.x, y: place.y + head.y },
    lift: flowerLift(genes.centre * place.size, layout.insectSize),
  };
}

/** A seat on a perch: where it is and how far across it a butterfly's spot moves it at most, either way. */
type Seat = Point & { slack: number };

/**
 * Where a butterfly sits on `perch`, `spot` of the way out (`perchSpot`), as
 * the layout stands it, before sway and breath move it; `undefined` for a
 * perch that stands nowhere on this screen.
 */
export function seatAt(
  { layout, flowers, mushrooms }: Stand,
  perch: Perch,
  spot: number,
): Seat | undefined {
  switch (perch.kind) {
    case 'flower': {
      const index = flowers.findIndex(({ id }) => id === perch.id);
      const standing = flowerAt({ layout, flowers }, index);
      if (!standing) return undefined;
      const { head, lift } = standing;
      return {
        x: head.x + spot * head.r,
        y: head.y - lift,
        slack: PERCH_SPREAD * head.r,
      };
    }
    case 'cap': {
      const mushroom = mushrooms.find(({ id }) => id === perch.id);
      const place = mushroom && layout.mushrooms[mushroom.slot];
      if (!mushroom || !place) return undefined;
      const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
      const seat = toCanvas(place.size)(capSeat(genes, spot));
      return {
        ...placedAt(place, turn, seat),
        slack: (PERCH_SPREAD * genes.capWidth * place.size) / 2,
      };
    }
    case 'air': {
      const found = airSpots(layout).find(({ id }) => id === perch.id);
      return found && { ...found, slack: 0 };
    }
    case 'away': {
      return undefined;
    }
    default: {
      return perch satisfies never;
    }
  }
}

/**
 * The spots in the open air a roaming butterfly flies between: a grid over
 * the sky and hills, down to where the ground begins, its widest wings
 * inside the screen by a wingspan and clear of every control's tap circle.
 * Each is named by its place in the grid, so a resize moves a spot rather
 * than renaming it.
 */
export function airSpots(layout: MeadowLayout): Array<WithId & Point> {
  const { width, groundTop, insectSize } = layout;
  const margin = WIDEST_SPAN * insectSize;
  const half = margin / 2;
  const [left, right] = [margin, width - margin];
  const [top, bottom] = [margin, Math.max(margin, groundTop)];
  const controls = tapCircles(layout);
  return Array.from({ length: AIR_ACROSS * AIR_DOWN }, (_, index) => {
    const [across, down] = [index % AIR_ACROSS, Math.floor(index / AIR_ACROSS)];
    return {
      id: `air-${String(across)}-${String(down)}`,
      x: left + ((right - left) * across) / (AIR_ACROSS - 1),
      y: top + ((bottom - top) * down) / (AIR_DOWN - 1),
    };
  }).filter(({ x, y }) =>
    controls.every(
      (control) => Math.hypot(x - control.x, y - control.y) >= control.r + half,
    ),
  );
}

/** Every control's tap circle, as far as a finger reaches it. */
function tapCircles(layout: MeadowLayout): Circle[] {
  const { mute, plus, minus, house, butterfly, picker, housePicker } = layout;
  return [mute, plus, minus, house, butterfly, ...picker, ...housePicker].map(
    (circle) => ({ ...circle, r: tapReach(circle.r) }),
  );
}

/** A standing mushroom as the flowers' sight reads it: how near the front it stands, and its outlines as drawn. */
type Cover = Pick<Standing, 'depth'> & {
  drawn: ReadonlyArray<{ outline: readonly Point[]; box: Box }>;
};

/**
 * Whether a butterfly on the flower at `index` can be seen there: its seat
 * over the head, as far as the sway and a butterfly's spot move it, stands
 * clear of every control's tap circle and of the screen's edge by half the
 * widest wingspan, and no mushroom of `covers` standing nearer the front
 * covers the head's middle (`HEAD_SHOWN`).
 */
function flowerInSight(
  stand: Stand,
  index: number,
  covers: readonly Cover[],
): boolean {
  const { layout } = stand;
  const standing = flowerAt(stand, index);
  if (!standing) return false;
  const { place, head, lift } = standing;
  const centre = pick(head, 'x', 'y');
  const seat = { ...centre, y: centre.y - lift };
  const reach =
    (WIDEST_SPAN * layout.insectSize) / 2 +
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

/**
 * What the scene sees of the perches in `stand`: the flowers in sight
 * (`flowerInSight`), the spots in the open air (`airSpots`), and every pair of perches whose butterflies, the widest
 * there are, could cover more than `MOST_OVERLAP` of each other wherever
 * their spots put them.
 */
export function perchSight(stand: Stand): Sight {
  const { layout, flowers, mushrooms } = stand;
  const covers = mushrooms.flatMap((mushroom) => {
    const place = layout.mushrooms[mushroom.slot];
    if (!place) return [];
    const { depth, drawn } = standingAt(place, mushroom);
    const outlines = drawn.map((outline) => ({
      outline,
      box: boxAround(outline),
    }));
    return [{ depth, drawn: outlines }];
  });
  const shown = flowers
    .filter((_, index) => flowerInSight(stand, index, covers))
    .map(({ id }) => id);
  const perches: Perch[] = [
    ...mushrooms.map(({ id }) => ({ kind: 'cap', id }) as const),
    ...shown.map((id) => ({ kind: 'flower', id }) as const),
  ];
  const seats = perches.flatMap((perch) => {
    const seat = seatAt(stand, perch, 0);
    return seat ? [{ perch, seat }] : [];
  });
  const apart = (1 - MOST_OVERLAP) * WIDEST_SPAN * layout.insectSize;
  const crowded = seats.flatMap(({ perch, seat }, index) =>
    seats
      .slice(index + 1)
      .filter(
        (other) =>
          Math.hypot(seat.x - other.seat.x, seat.y - other.seat.y) <
          apart + seat.slack + other.seat.slack,
      )
      .map((other) => [perch, other.perch] as const),
  );
  return {
    flowers: shown,
    air: airSpots(layout).map(({ id }) => id),
    crowded,
    // No ring slot is offered yet, so no bee plants.
    room: [],
    seededFlowers: flowers.length,
  };
}
