/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch an
 * insect sits. A flower is a perch only where an insect on it can be seen
 * (`flower-sight.ts`); a perch holds one insect at a time, and none goes to a
 * perch crowded by a taken one for the two kinds' wings, so no two drawn
 * insects cover much of each other. An insect with no perch open roams
 * between spots in the open air over the meadow, clear of the controls and
 * inside the screen, as many as the meadow holds insects on every screen,
 * and no two spots nearer than the two kinds' wingspans are held at once, so
 * hovering insects never overlap while the air has room.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import {
  type Crowding,
  type Pairing,
  type Perch,
  perchName,
  type Places,
  SIDES,
  type Sight,
} from '../../model/flight';
import { flowerGenes } from '../../model/flower-genes';
import {
  boxAround,
  type Circle,
  distanceToEdge,
  placedAt,
  type Point,
} from '../../model/geometry';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { phaseOf } from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { standingFlowers } from './flower-plots';
import {
  coversOn,
  flowerInSight,
  flowerLift,
  PERCH_SPREAD,
  roomFor,
  type Sighting,
  sightingOf,
  type Stand,
  tapCircles,
  WIDEST_SPAN,
} from './flower-sight';
import type { MeadowLayout } from './layout';

/** How much of the narrower of two perched insects' spans the other may cover. */
export const MOST_OVERLAP = 0.25;

/**
 * The widest each kind's open wings span, in units of its own size, whatever
 * its genes: the butterfly's `WIDEST_SPAN`, and a fly's and a bee's.
 */
export const WIDEST_SPANS = {
  butterfly: WIDEST_SPAN,
  fly: 1.36,
  bee: 1.2,
} as const satisfies Record<InsectKind, number>;

/** The widest an insect of `kind` spans on `layout`, in CSS px. */
export function widestOn(layout: MeadowLayout, kind: InsectKind): number {
  return WIDEST_SPANS[kind] * layout.insectSizes[kind];
}

/** How far the open air reaches down over the back of the ground, as a share of the ground's depth. */
export const AIR_BELOW = 0.15;

/**
 * How far down the screen, as a share of its height, an insect flies in from
 * off screen and out to, about: the middle of the view's band for it.
 */
const AWAY_DOWN = 0.34;

/** Every two kinds, the first on one perch and the second on another. */
const PAIRINGS: readonly Pairing[] = INSECT_KINDS.flatMap((first) =>
  INSECT_KINDS.map((second) => [first, second] as const),
);

/** Where on its perch `insect` sits, from -`PERCH_SPREAD` to `PERCH_SPREAD` of the way out. */
export function perchSpot(insect: Seeded): number {
  return Math.sin(phaseOf(insect) * 5) * PERCH_SPREAD;
}

/** The flower `id` as `stand` stands it on its screen, `undefined` where it stands nowhere. */
function flowerAt(stand: Stand, id: string): (Sighting & Seeded) | undefined {
  const { layout, flowers, planted } = stand;
  const found = standingFlowers(layout, flowers, planted).find(
    (flower) => flower.id === id,
  );
  return found && { ...sightingOf(found, layout), ...pick(found, 'seed') };
}

/** Where on a perch an insect of `kind` sits, `spot` of the way out (`perchSpot`). */
type Seater = (spot: number, kind: InsectKind) => Point;

/**
 * Where on `perch` an insect sits, as the layout stands it, before sway and
 * breath move it; `undefined` for a perch that stands nowhere on this
 * screen. The perch is looked up once, however many seats are asked of it.
 */
function seaterOn(stand: Stand, perch: Perch): Seater | undefined {
  const { layout, mushrooms } = stand;
  switch (perch.kind) {
    case 'flower': {
      const standing = flowerAt(stand, perch.id);
      if (!standing) return undefined;
      const { head, place, seed } = standing;
      const disc = flowerGenes({ seed }).centre * place.size;
      const reach = { ...pick(head, 'r'), disc };
      return (spot, kind) => ({
        x: head.x + spot * head.r,
        y: head.y - flowerLift(reach, layout.insectSizes[kind], kind),
      });
    }
    case 'cap': {
      const mushroom = mushrooms.find(({ id }) => id === perch.id);
      const place = mushroom && layout.mushrooms[mushroom.slot];
      if (!mushroom || !place) return undefined;
      const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
      const toPlace = toCanvas(place.size);
      return (spot) => placedAt(place, turn, toPlace(capSeat(genes, spot)));
    }
    case 'air': {
      const found = airSpots(layout).find(({ id }) => id === perch.id);
      return found && (() => pick(found, 'x', 'y'));
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
 * Where an insect of `kind` sits on `perch`, `spot` of the way out
 * (`perchSpot`), as the layout stands it, before sway and breath move it;
 * `undefined` for a perch that stands nowhere on this screen.
 */
export function seatAt(
  stand: Stand,
  perch: Perch,
  spot: number,
  kind: InsectKind = 'butterfly',
): Point | undefined {
  return seaterOn(stand, perch)?.(spot, kind);
}

/**
 * The spots in the open air a roaming insect flies between: a grid over the
 * sky and hills, down over the back of the ground by `AIR_BELOW`, its rows and columns one
 * narrowest kind's wingspan apart, so each kind keeps to spots its own span
 * apart (`perchSight`); a butterfly's widest wings stay inside the screen and
 * clear of every control's tap circle. Each is named by its place in the
 * grid, so a resize moves a spot rather than renaming it.
 */
export function airSpots(layout: MeadowLayout): Array<WithId & Point> {
  const { width, height, groundTop } = layout;
  const half = widestOn(layout, 'butterfly') / 2;
  const step = Math.min(...INSECT_KINDS.map((kind) => widestOn(layout, kind)));
  const [left, right] = [half, width - half];
  const ground = height - groundTop;
  const [top, bottom] = [half, Math.max(half, groundTop + AIR_BELOW * ground)];
  const across = Math.max(2, Math.floor((right - left) / step) + 1);
  const down = Math.max(2, Math.floor((bottom - top) / step) + 1);
  const controls = tapCircles(layout);
  return Array.from({ length: across * down }, (_, index) => {
    const [column, row] = [index % across, Math.floor(index / across)];
    return {
      id: `air-${String(column)}-${String(row)}`,
      x: left + ((right - left) * column) / (across - 1),
      y: top + ((bottom - top) * row) / (down - 1),
    };
  }).filter(({ x, y }) =>
    controls.every(
      (control) => Math.hypot(x - control.x, y - control.y) >= control.r + half,
    ),
  );
}

/**
 * Every place an insect's spot may seat it on a perch, as a line through
 * them: straight across a flower's head, curving over a cap's dome, and a
 * single point at a spot in the air.
 */
type Track = readonly Point[];

/** The spots a cap's track is drawn through, enough that its dome's curve between two stays well inside an insect's wings. */
const CAP_SPOTS = [-1, -0.5, 0, 0.5, 1].map((share) => share * PERCH_SPREAD);

/** Where on a perch whose seats `seater` gives an insect of `kind` may sit. */
function trackOf(perch: Perch, seater: Seater, kind: InsectKind): Track {
  const spots =
    perch.kind === 'cap' ? CAP_SPOTS : [-PERCH_SPREAD, PERCH_SPREAD];
  return spots.map((spot) => seater(spot, kind));
}

type Segment = readonly [Point, Point];

function segmentsOf(track: Track): Segment[] {
  return track.flatMap((point, index) => {
    const next = track[index + 1];
    if (next) return [[point, next] as const];
    return track.length === 1 ? [[point, point] as const] : [];
  });
}

/** Which side of the line through `a` and `b` the point `c` lies, by sign. */
const sideOf = (a: Point, b: Point, c: Point) =>
  Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

function segmentsApart([a, b]: Segment, [c, d]: Segment): number {
  const crossing =
    sideOf(a, b, c) * sideOf(a, b, d) < 0 &&
    sideOf(c, d, a) * sideOf(c, d, b) < 0;
  if (crossing) return 0;
  return Math.min(
    distanceToEdge([c, d], a),
    distanceToEdge([c, d], b),
    distanceToEdge([a, b], c),
    distanceToEdge([a, b], d),
  );
}

/** The nearest two seats on `here` and `there` come to each other. */
function tracksApart(here: Track, there: Track): number {
  const others = segmentsOf(there);
  let nearest = Infinity;
  for (const segment of segmentsOf(here)) {
    for (const other of others) {
      nearest = Math.min(nearest, segmentsApart(segment, other));
    }
  }
  return nearest;
}

/**
 * A perch, where an insect of each kind may sit on it, and a circle around
 * every such seat, so two perches far apart are passed over at a glance.
 */
type Seats = {
  perch: Perch;
  tracks: Record<InsectKind, Track>;
  around: Circle;
};

function seatsWith(perch: Perch, tracks: Record<InsectKind, Track>): Seats {
  const points = INSECT_KINDS.flatMap((kind) => tracks[kind]);
  const box = boxAround(points);
  const centre = {
    x: (box.left + box.right) / 2,
    y: (box.top + box.bottom) / 2,
  };
  const r = Math.max(
    ...points.map(({ x, y }) => Math.hypot(x - centre.x, y - centre.y)),
  );
  return { perch, tracks, around: { ...centre, r } };
}

/**
 * Every two of `seated` on which an insect of one kind of a pairing on the
 * first and one of the other on the second could come nearer than `apart`
 * says for those two kinds, wherever their spots put them.
 */
function crowdings(
  seated: readonly Seats[],
  apart: (first: InsectKind, second: InsectKind) => number,
): Crowding[] {
  const farthest = Math.max(
    ...PAIRINGS.map(([first, second]) => apart(first, second)),
  );
  return seated.flatMap(({ perch, tracks, around }, index) =>
    seated.slice(index + 1).flatMap((other) => {
      const gap =
        Math.hypot(around.x - other.around.x, around.y - other.around.y) -
        around.r -
        other.around.r;
      if (gap >= farthest) return [];
      const pairings = PAIRINGS.filter(
        ([first, second]) =>
          tracksApart(tracks[first], other.tracks[second]) <
          apart(first, second),
      );
      return pairings.length > 0
        ? [[perch, other.perch, pairings] as const]
        : [];
    }),
  );
}

/**
 * What the scene sees of the perches in `stand`: the flowers in sight
 * (`flowerInSight`), the spots in the open air (`airSpots`), every two
 * perches on which two insects, the widest of their kinds, could cover more
 * than `MOST_OVERLAP` of the narrower wherever their spots put them, and
 * every two spots in the air on which two insects of their kinds would
 * overlap at all; and where each of them stands (`Places`).
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
  const seatsOf = (perch: Perch): Seats[] => {
    const seater = seaterOn(stand, perch);
    if (!seater) return [];
    const along = (kind: InsectKind) => trackOf(perch, seater, kind);
    const tracks = {
      butterfly: along('butterfly'),
      fly: along('fly'),
      bee: along('bee'),
    };
    return [seatsWith(perch, tracks)];
  };
  const perched = crowdings(
    perches.flatMap((perch) => seatsOf(perch)),
    (first, second) => {
      const [a, b] = [widestOn(layout, first), widestOn(layout, second)];
      return (a + b) / 2 - MOST_OVERLAP * Math.min(a, b);
    },
  );
  const air = airSpots(layout);
  const unit = layout.insectSize;
  const reach = widestOn(layout, 'butterfly');
  const places: Places = Object.fromEntries(
    [
      ...perches.flatMap((perch) => {
        const seat = seatAt(stand, perch, 0);
        return seat ? [[perchName(perch), seat] as const] : [];
      }),
      ...air.map(
        (spot) =>
          [perchName({ kind: 'air', ...pick(spot, 'id') }), spot] as const,
      ),
      ...SIDES.map(
        (side) =>
          [
            perchName({ kind: 'away', side }),
            {
              x: side === 'left' ? -reach : layout.width + reach,
              y: layout.height * AWAY_DOWN,
            },
          ] as const,
      ),
    ].map(([name, { x, y }]) => [name, { x: x / unit, y: y / unit }]),
  );
  const aloft = crowdings(
    air.map((spot) => {
      const track = [pick(spot, 'x', 'y')];
      return seatsWith(
        { kind: 'air', ...pick(spot, 'id') },
        { butterfly: track, fly: track, bee: track },
      );
    }),
    (first, second) => (widestOn(layout, first) + widestOn(layout, second)) / 2,
  );
  return {
    flowers: shown,
    air: air.map(({ id }) => id),
    crowded: [...perched, ...aloft],
    places,
    room: roomFor(stand, shown, covers),
    seededFlowers: flowers.length,
  };
}
