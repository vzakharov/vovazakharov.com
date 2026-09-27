/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch a
 * butterfly sits. A perch holds one butterfly at a time, and none goes to a
 * perch crowded by a taken one, so no two drawn butterflies cover much of
 * each other.
 */

import type { Perch, Sight } from '../../model/flight';
import { type Flower, flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Meadow } from '../../model/game';
import { placedAt, type Point } from '../../model/geometry';
import { phaseOf } from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import type { MeadowLayout } from './layout';

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

/** Where on its perch `insect` sits, from -`PERCH_SPREAD` to `PERCH_SPREAD` of the way out. */
export function perchSpot(insect: Seeded): number {
  return Math.sin(phaseOf(insect) * 5) * PERCH_SPREAD;
}

/** The meadow as the scene stands it: the layout, the visit's flowers, and the mushrooms standing. */
export type Stand = Pick<Meadow, 'mushrooms'> & {
  layout: MeadowLayout;
  flowers: readonly Flower[];
};

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
      const place = layout.flowers[index];
      const flower = flowers[index];
      if (!place || !flower) return undefined;
      const head = flowerHead(flowerGenes(flower), place.size);
      return {
        x: place.x + head.x + spot * head.r,
        y: place.y + head.y,
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
    case 'away': {
      return undefined;
    }
    default: {
      return perch satisfies never;
    }
  }
}

/**
 * What the scene sees of the perches in `stand`: every flower the layout has
 * room for, and every pair of perches whose butterflies, the widest there
 * are, could cover more than `MOST_OVERLAP` of each other wherever their
 * spots put them.
 */
export function perchSight(stand: Stand): Sight {
  const { layout, flowers, mushrooms } = stand;
  const shown = flowers
    .filter((_, index) => layout.flowers[index] !== undefined)
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
  return { flowers: shown, crowded };
}
