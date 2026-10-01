/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch an
 * insect sits. A flower is a perch only where an insect on it stays inside
 * the world's edges (`flower-sight.ts`), whatever stands in front of it, so
 * nothing is seen afresh as the eye walks; a perch holds one insect at a time, and none goes to a
 * perch crowded by a taken one for the two kinds' wings, so no two drawn
 * insects cover much of each other. An insect with no perch open roams
 * between spots in the open air over the whole world, inside its edges, as
 * many as the meadow holds insects on every screen,
 * and no two spots nearer than the two kinds' wingspans are held at once, so
 * hovering insects never overlap while the air has room.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import {
  type Perch,
  perchName,
  type Places,
  SIDES,
  type Sight,
} from '../../model/flight';
import type { Onscreen } from '../../model/flight-in';
import { flowerGenes } from '../../model/flower-genes';
import { placedAt, type Point } from '../../model/geometry';
import { project } from '../../model/ground';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { INSECT_LIMITS } from '../../model/insects';
import { phaseOf } from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { placeIn } from './clump-layout';
import { layoutAtRow } from './eye-crop';
import { type StandingFlower, standingFlowers } from './flower-plots';
import {
  coversOn,
  flowerInSight,
  flowerLift,
  PERCH_SPREAD,
  perLayout,
  roomFor,
  type Sighting,
  sightingOf,
  type Stand,
  WIDEST_SPAN,
} from './flower-sight';
import type { MeadowLayout } from './layout';
import {
  crowdings,
  pointCrowdings,
  seatsWith,
  type Track,
} from './perch-crowding';
import type { View } from './view';

/** How much of the narrower of two perched insects' spans the other may cover. */
export const MOST_OVERLAP = 0.25;

/**
 * The widest each kind's open wings span, in units of its own size, whatever
 * its genes: the butterfly's `WIDEST_SPAN`, and a fly's and a bee's.
 */
const WIDEST_SPANS = {
  butterfly: WIDEST_SPAN,
  fly: 1.36,
  bee: 1.2,
} as const satisfies Record<InsectKind, number>;

/** The widest an insect of `kind` spans on `layout`, in CSS px. */
function widestOn(layout: MeadowLayout, kind: InsectKind): number {
  return WIDEST_SPANS[kind] * layout.insectSizes[kind];
}

/** How far the open air reaches down over the back of the ground, as a share of the ground's depth. */
export const AIR_BELOW = 0.15;

/**
 * How far down the screen, as a share of its height, an insect flies in from
 * past the world's side and out to, about: the middle of the view's band for
 * it.
 */
const AWAY_DOWN = 0.34;

/** Where on its perch `insect` sits, from -`PERCH_SPREAD` to `PERCH_SPREAD` of the way out. */
export function perchSpot(insect: Seeded): number {
  return Math.sin(phaseOf(insect) * 5) * PERCH_SPREAD;
}

/**
 * The flower `id` as `stand` stands it on its screen, among its `standing`
 * flowers; `undefined` where it stands nowhere.
 */
function flowerAt(
  stand: Stand,
  id: string,
  standing: readonly StandingFlower[],
): (Sighting & Seeded) | undefined {
  const found = standing.find((flower) => flower.id === id);
  const { layout } = stand;
  return found && { ...sightingOf(found, layout), ...pick(found, 'seed') };
}

/** Where on a perch an insect of `kind` sits, `spot` of the way out (`perchSpot`). */
type Seater = (spot: number, kind: InsectKind) => Point;

/**
 * Where on `perch` an insect sits, as the layout stands it, before sway and
 * breath move it; `undefined` for a perch that stands nowhere on this
 * screen. The perch is looked up once, however many seats are asked of it.
 */
function seaterOn(
  stand: Stand,
  perch: Perch,
  standing?: readonly StandingFlower[],
): Seater | undefined {
  const { layout, mushrooms, flowers, planted } = stand;
  switch (perch.kind) {
    case 'flower': {
      const here =
        standing ?? standingFlowers(layout, flowers, planted, mushrooms);
      const flower = flowerAt(stand, perch.id, here);
      if (!flower) return undefined;
      const { head, place, seed } = flower;
      const disc = flowerGenes({ seed }).centre * place.size;
      const reach = { ...pick(head, 'r'), disc };
      return (spot, kind) => ({
        x: head.x + spot * head.r,
        y: head.y - flowerLift(reach, layout.insectSizes[kind], kind),
      });
    }
    case 'cap': {
      const mushroom = mushrooms.find(({ id }) => id === perch.id);
      const place = mushroom && placeIn(layout.mushrooms, mushroom);
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

/** Every insect the meadow can hold. */
export const EVERY_ONE: readonly InsectKind[] = INSECT_KINDS.flatMap((kind) =>
  Array.from({ length: INSECT_LIMITS[kind] }, () => kind),
);

/**
 * Whether `spots` seat every insect the meadow can hold at once, each clear
 * of the others by their kinds' widest spans, taken widest first.
 */
function seatsEveryOne(layout: MeadowLayout, spots: readonly Point[]): boolean {
  const spans = EVERY_ONE.map((kind) => widestOn(layout, kind)).toSorted(
    (a, b) => b - a,
  );
  const held: Array<Point & { span: number }> = [];
  return spans.every((span) => {
    const spot = spots.find(({ x, y }) =>
      held.every(
        (other) =>
          Math.hypot(x - other.x, y - other.y) >= (span + other.span) / 2,
      ),
    );
    if (spot) held.push({ ...pick(spot, 'x', 'y'), span });
    return spot !== undefined;
  });
}

/**
 * A layout's air (`airSpots`), and every two spots in it on which two
 * insects of their kinds would overlap at all: the costliest part of
 * `perchSight`, and the layout's alone.
 */
const airOf = perLayout((layout) => {
  const narrowest = Math.min(
    ...INSECT_KINDS.map((kind) => widestOn(layout, kind)),
  );
  const grid = airGrid(layout, narrowest);
  const spots = seatsEveryOne(layout, grid)
    ? grid
    : airGrid(layout, narrowest / 2);
  const aloft = pointCrowdings(
    spots.map((spot) => ({
      perch: { kind: 'air', ...pick(spot, 'id') } as const,
      ...pick(spot, 'x', 'y'),
    })),
    (first, second) => (widestOn(layout, first) + widestOn(layout, second)) / 2,
  );
  return { spots, aloft };
});

/**
 * The spots in the open air a roaming insect flies between: a grid over the
 * sky and hills of the whole world, down over the back of the ground by
 * `AIR_BELOW`, its rows and columns one narrowest kind's wingspan apart, or
 * half that where the coarser grid is too small to seat every insect the
 * meadow can hold clear of each other (`seatsEveryOne`), so each kind keeps
 * to spots its own span apart (`perchSight`); a butterfly's widest wings stay
 * inside the world. The controls stand on the screen, not the world, so no
 * spot keeps off them. Each is named by its place in the grid, so a resize
 * moves a spot rather than renaming it.
 */
export function airSpots(layout: MeadowLayout): ReadonlyArray<WithId & Point> {
  return airOf(layout).spots;
}

/** `airSpots`' grid with its rows and columns about `step` px apart. */
function airGrid(layout: MeadowLayout, step: number): Array<WithId & Point> {
  const { camera, height, groundTop } = layout;
  const half = widestOn(layout, 'butterfly') / 2;
  const [left, right] = [half, camera.world - half];
  const ground = height - groundTop;
  const [top, bottom] = [half, Math.max(half, groundTop + AIR_BELOW * ground)];
  const across = Math.max(2, Math.floor((right - left) / step) + 1);
  const down = Math.max(2, Math.floor((bottom - top) / step) + 1);
  return Array.from({ length: across * down }, (_, index) => {
    const [column, row] = [index % across, Math.floor(index / across)];
    return {
      id: `air-${String(column)}-${String(row)}`,
      x: left + ((right - left) * column) / (across - 1),
      y: top + ((bottom - top) * row) / (down - 1),
    };
  });
}

/** The spots a cap's track is drawn through, enough that its dome's curve between two stays well inside an insect's wings. */
const CAP_SPOTS = [-1, -0.5, 0, 0.5, 1].map((share) => share * PERCH_SPREAD);

/** Where on a perch whose seats `seater` gives an insect of `kind` may sit. */
function trackOf(perch: Perch, seater: Seater, kind: InsectKind): Track {
  const spots =
    perch.kind === 'cap' ? CAP_SPOTS : [-PERCH_SPREAD, PERCH_SPREAD];
  return spots.map((spot) => seater(spot, kind));
}

/**
 * What the scene sees of the perches in `stand`: the flowers in sight
 * (`flowerInSight`, against no cover) to a butterfly, and to a bee, whose seat and wings
 * differ, the spots in the open air (`airSpots`), every two
 * perches on which two insects, the widest of their kinds, could cover more
 * than `MOST_OVERLAP` of the narrower wherever their spots put them, and
 * every two spots in the air on which two insects of their kinds would
 * overlap at all; and where each of them stands (`Places`).
 */
export function perchSight(stand: Stand): Sight {
  const { layout, flowers, mushrooms, planted } = stand;
  const covers = coversOn(layout, mushrooms);
  const standing = standingFlowers(layout, flowers, planted, mushrooms);
  const inSightTo = (kind: InsectKind) =>
    standing
      .filter((flower) =>
        flowerInSight(
          layout,
          sightingOf(flower, layout, kind),
          [],
          widestOn(layout, kind),
        ),
      )
      .map(({ id }) => id);
  const [shown, beeFlowers] = [inSightTo('butterfly'), inSightTo('bee')];
  const seen = [...new Set([...shown, ...beeFlowers])];
  const perches: Perch[] = [
    ...mushrooms.map(({ id }) => ({ kind: 'cap', id }) as const),
    ...seen.map((id) => ({ kind: 'flower', id }) as const),
  ];
  const seaters = perches.flatMap((perch) => {
    const seater = seaterOn(stand, perch, standing);
    return seater ? [{ perch, seater }] : [];
  });
  const seated = seaters.map(({ perch, seater }) => {
    const along = (kind: InsectKind) => trackOf(perch, seater, kind);
    const tracks = {
      butterfly: along('butterfly'),
      fly: along('fly'),
      bee: along('bee'),
    };
    return seatsWith(perch, tracks);
  });
  const perched = crowdings(seated, (first, second) => {
    const [a, b] = [widestOn(layout, first), widestOn(layout, second)];
    return (a + b) / 2 - MOST_OVERLAP * Math.min(a, b);
  });
  const { spots: air, aloft } = airOf(layout);
  const unit = layout.insectSize;
  const reach = widestOn(layout, 'butterfly');
  const places: Places = Object.fromEntries(
    [
      ...seaters.map(
        ({ perch, seater }) =>
          [perchName(perch), seater(0, 'butterfly')] as const,
      ),
      ...air.map(
        (spot) =>
          [perchName({ kind: 'air', ...pick(spot, 'id') }), spot] as const,
      ),
      ...SIDES.map(
        (side) =>
          [
            perchName({ kind: 'away', side }),
            {
              x: side === 'left' ? -reach : layout.camera.world + reach,
              y: layout.height * AWAY_DOWN,
            },
          ] as const,
      ),
    ].map(([name, { x, y }]) => [name, { x: x / unit, y: y / unit }]),
  );
  return {
    flowers: shown,
    beeFlowers,
    air: air.map(({ id }) => id),
    crowded: [...perched, ...aloft],
    places,
    room: roomFor(stand, beeFlowers, covers),
  };
}

/** The ground row, in world px down the screen, each perch stands over, by its name (`perchName`). */
export type FootRows = ReadonlyMap<string, number>;

/** The row the opening clump stands on, in world px: what an insect in the air is drawn standing over. */
export function clumpRow({ camera }: MeadowLayout): number {
  return project(camera, { x: 0, z: 0 }).y;
}

/** The ground row each cap's and standing flower's foot stands on in `stand`, and the clump's under every spot in the air. */
export function footRows(stand: Stand): FootRows {
  const { layout, flowers, mushrooms, planted } = stand;
  const caps = mushrooms.flatMap((mushroom) => {
    const place = placeIn(layout.mushrooms, mushroom);
    return place
      ? [
          [
            perchName({ kind: 'cap', ...pick(mushroom, 'id') }),
            place.y,
          ] as const,
        ]
      : [];
  });
  const heads = standingFlowers(layout, flowers, planted, mushrooms).map(
    ({ id, place }) => [perchName({ kind: 'flower', id }), place.y] as const,
  );
  const air = airSpots(layout).map(
    ({ id }) => [perchName({ kind: 'air', id }), clumpRow(layout)] as const,
  );
  return new Map([...caps, ...heads, ...air]);
}

/** How many columns across the screen `onscreenOf` follows to the ground's rows. */
const COLUMNS = 32;

/**
 * What `view` shows of the world on `layout`, in the units of `Places`: the
 * stretch across the layout the screen's columns reach on both the screen's
 * foot row and the seam's, the rows the perches' feet stand between, so a
 * perch standing over any row between counts as shown only where it is; a
 * perch counts as shown half the widest butterfly's wings inside either
 * edge, so one seated there is wholly in view. Kept inside the world's
 * strip; `undefined` where the screen shows none of it.
 */
export function onscreenOf(
  layout: MeadowLayout,
  view: View | undefined,
): Onscreen | undefined {
  if (!view) return undefined;
  const { width, height, groundTop, camera, insectSize: unit } = layout;
  const reaches = [height, groundTop].map((row) => {
    const across = Array.from({ length: COLUMNS + 1 }, (_, column) =>
      layoutAtRow(view, { x: (width * column) / COLUMNS, y: row }, row),
    ).flatMap((point) => (point ? [point.x] : []));
    return across.length > 0
      ? { left: Math.min(...across), right: Math.max(...across) }
      : undefined;
  });
  const left = Math.max(0, ...reaches.map((reach) => reach?.left ?? Infinity));
  const right = Math.min(
    camera.world,
    ...reaches.map((reach) => reach?.right ?? -Infinity),
  );
  if (left >= right) return undefined;
  return {
    left: left / unit,
    right: right / unit,
    inset: widestOn(layout, 'butterfly') / 2 / unit,
  };
}
