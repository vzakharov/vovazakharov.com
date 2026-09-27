/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch a
 * insect sits. A flower is a perch only where an insect on it can be seen
 * (`flower-sight.ts`); a perch holds one insect at a time, and none goes to a
 * perch crowded by a taken one, so no two drawn insects cover much of each
 * other. An insect with no perch open roams between spots in the open air
 * over the meadow, clear of the controls and inside the screen, and no two
 * spots nearer than the widest wingspan are held at once, so hovering
 * insects never overlap while the air has room.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import type { Perch, Sight } from '../../model/flight';
import { placedAt, type Point } from '../../model/geometry';
import { phaseOf } from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { standingFlowers } from './flower-plots';
import {
  coversOn,
  flowerInSight,
  PERCH_SPREAD,
  roomFor,
  type Sighting,
  sightingOf,
  type Stand,
  tapCircles,
  WIDEST_SPAN,
} from './flower-sight';
import type { MeadowLayout } from './layout';

/** How much of the narrower of two perched butterflies' spans the other may cover. */
export const MOST_OVERLAP = 0.25;
/** How many spots across and down the open air offers a roaming butterfly, before the controls take theirs out. */
const AIR_ACROSS = 6;
const AIR_DOWN = 4;

/** Where on its perch `insect` sits, from -`PERCH_SPREAD` to `PERCH_SPREAD` of the way out. */
export function perchSpot(insect: Seeded): number {
  return Math.sin(phaseOf(insect) * 5) * PERCH_SPREAD;
}

/** The flower `id` as `stand` stands it on its screen, `undefined` where it stands nowhere. */
function flowerAt(stand: Stand, id: string): Sighting | undefined {
  const { layout, flowers, planted } = stand;
  const found = standingFlowers(layout, flowers, planted).find(
    (flower) => flower.id === id,
  );
  return found && sightingOf(found, layout);
}

/** A seat on a perch: where it is and how far across it a butterfly's spot moves it at most, either way. */
type Seat = Point & { slack: number };

/**
 * Where a butterfly sits on `perch`, `spot` of the way out (`perchSpot`), as
 * the layout stands it, before sway and breath move it; `undefined` for a
 * perch that stands nowhere on this screen.
 */
export function seatAt(
  stand: Stand,
  perch: Perch,
  spot: number,
): Seat | undefined {
  const { layout, mushrooms } = stand;
  switch (perch.kind) {
    case 'flower': {
      const standing = flowerAt(stand, perch.id);
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

/**
 * What the scene sees of the perches in `stand`: the flowers in sight
 * (`flowerInSight`), the spots in the open air (`airSpots`), and every pair of perches whose butterflies, the widest
 * there are, could cover more than `MOST_OVERLAP` of each other wherever
 * their spots put them.
 */
export function perchSight(stand: Stand): Sight {
  const { layout, flowers, mushrooms, planted } = stand;
  const covers = coversOn(layout, mushrooms);
  const standing = standingFlowers(layout, flowers, planted);
  const shown = standing
    .filter((flower) =>
      flowerInSight(layout, sightingOf(flower, layout), covers),
    )
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
  // Hovering fliers never overlap: two spots in the air nearer than the
  // widest wingspan crowd each other.
  const air = airSpots(layout);
  const span = WIDEST_SPAN * layout.insectSize;
  const aloft = air.flatMap((spot, index) =>
    air
      .slice(index + 1)
      .filter((other) => Math.hypot(spot.x - other.x, spot.y - other.y) < span)
      .map(
        (other) =>
          [
            { kind: 'air', ...pick(spot, 'id') },
            { kind: 'air', ...pick(other, 'id') },
          ] as const,
      ),
  );
  return {
    flowers: shown,
    air: air.map(({ id }) => id),
    crowded: [...crowded, ...aloft],
    room: roomFor(stand, shown, covers),
    seededFlowers:
      standing.length -
      planted.filter((sown) => standing.some(({ id }) => id === sown.id))
        .length,
  };
}
