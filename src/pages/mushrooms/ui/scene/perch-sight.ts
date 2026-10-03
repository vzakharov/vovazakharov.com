/**
 * What the scene sees of the perches (`Sight` in `model/flight.ts`), as a
 * pure function of the layout and what stands in it, and where on a perch an
 * insect sits. A flower is a perch only where an insect on it stays inside
 * the world's edges (`flower-sight.ts`), whatever stands in front of it, so
 * nothing is seen afresh as the eye walks. A perch holds one insect at a
 * time, and none goes to a perch crowded by a taken one for the two kinds'
 * wings, so no two drawn insects cover much of each other. An insect with no
 * perch open roams between spots in the open air round the eye
 * (`air-spots.ts`), no two held at once nearer than the two kinds' wingspans
 * where the eye draws them, so hovering insects never overlap while the air
 * has room.
 */

import { pick } from '@/shared/lib/collections';

import {
  type Perch,
  perchName,
  type Place,
  type Sight,
} from '../../model/flight';
import type { Onscreen } from '../../model/flight-in';
import { flowerGenes } from '../../model/flower-genes';
import type { Planted } from '../../model/game';
import { distanceBetween, placedAt, type Point } from '../../model/geometry';
import { D_SEE, OPENING_EYE, planeOf, scaleAt } from '../../model/ground';
import {
  INSECT_KINDS,
  type InsectKind,
  type Kinded,
} from '../../model/insect-genes';
import { phaseOf } from '../../model/motion';
import {
  hasTrumpet,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { capUnder, toCanvas } from '../../model/mushroom-outline';
import { capSeat, splayed } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { SHELTER_SEATS, type ShelterSeat } from '../../model/shelter';
import { sproutScale } from '../../model/sprouting';
import { airOf, airSpots, clumpRow } from './air-spots';
import { placeIn } from './clump-layout';
import { flowersOf, type StandingFlower } from './flower-plots';
import { flowerLift } from './flower-seat';
import {
  type Cover,
  coversOn,
  flowerInSight,
  PERCH_SPREAD,
  roomFor,
  screenSides,
  type Sighting,
  sightingOf,
  type Stand,
} from './flower-sight';
import { awayPlaces, releasedAway, wayOutOf } from './insect-away';
import type { MeadowLayout } from './layout';
import { MEADOW_FRAME } from './meadow-camera';
import { crowdings, seatsWith, type Track } from './perch-crowding';
import { discCovered } from './shelter-cover';
import { rowAt, type View, viewAt } from './view';
import { widestOn } from './widest-spans';

/** How much of the narrower of two perched insects' spans the other may cover. */
export const MOST_OVERLAP = 0.25;

/**
 * How far on the plane from the eye the stand is judged at a perch may stand
 * and still be offered: as far as the brow, what the child sees by turning
 * round where he stands, or the world's frame's far corner where that stands
 * farther, so every perch the opening eye offers is offered.
 */
export const PERCH_REACH = Math.max(
  D_SEE,
  distanceBetween(
    OPENING_EYE,
    planeOf({
      x: MEADOW_FRAME.across / scaleAt(MEADOW_FRAME.far),
      z: MEADOW_FRAME.far,
    }),
  ),
);

/** Whether `foot`, on the plane of a stand judged at `eye`, stands within `PERCH_REACH` of it: a flower's at `OPENING_EYE`, its foot moved there (`anchoredStand`), a mushroom's at its ground's anchor, its foot stored. */
function inReach(foot: Point, eye: Point = OPENING_EYE): boolean {
  return distanceBetween(eye, foot) <= PERCH_REACH;
}

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
 * How far below the lowest edge a cap draws under itself (`capUnder`) a
 * sheltering insect's middle hangs, in its own size: about half its painted
 * height, so its head touches the gills or the band and it reads as hanging
 * from them.
 */
const UNDER_DROP = {
  butterfly: 0.45,
  fly: 0.35,
  bee: 0.4,
} as const satisfies Record<InsectKind, number>;

/** How far below a cap's lowest edge an insect of `kind`, `sizes` to its unit drawn at `zoom`, hangs sheltering there, in px. */
export function shelterDrop(
  sizes: Readonly<Record<InsectKind, number>>,
  kind: InsectKind,
  zoom = 1,
): number {
  return UNDER_DROP[kind] * sizes[kind] * zoom;
}

/** `at` moved `by` px down the screen. */
export function dropped<At extends Point>(at: At, by: number): At {
  return { ...at, y: at.y + by };
}

/**
 * Where `stand` stands the point `local` puts in the mushroom `id`'s own
 * frame, from its genes as it stands; `undefined` where it stands nowhere.
 */
function capAt(
  stand: Stand,
  id: string,
): ((local: (genes: MushroomGenes) => Point) => Point) | undefined {
  const mushroom = stand.mushrooms.find((each) => each.id === id);
  const place = mushroom && placeIn(stand.layout.mushrooms, mushroom);
  if (!mushroom || !place) return undefined;
  const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
  const toPlace = toCanvas(place.size);
  return (local) => placedAt(place, turn, toPlace(local(genes)));
}

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
  const { layout } = stand;
  switch (perch.kind) {
    case 'flower': {
      const here = standing ?? flowersOf(stand);
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
      const seat = capAt(stand, perch.id);
      return seat && ((spot) => seat((genes) => capSeat(genes, spot)));
    }
    case 'shelter': {
      const under = capAt(
        stand,
        perch.id,
      )?.((genes) => capUnder(genes, perch.seat));
      return (
        under &&
        ((_, kind) => dropped(under, shelterDrop(layout.insectSizes, kind)))
      );
    }
    case 'air': {
      const air = airSpots(layout, layout.mushrooms.anchor);
      const found = air.find(({ id }) => id === perch.id);
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

/** The spots a cap's track is drawn through, enough that its dome's curve between two stays well inside an insect's wings. */
const CAP_SPOTS = [-1, -0.5, 0, 0.5, 1].map((share) => share * PERCH_SPREAD);

/** Where on a perch whose seats `seater` gives an insect of `kind` may sit. */
function trackOf(perch: Perch, seater: Seater, kind: InsectKind): Track {
  return spotsOn(perch).map((spot) => seater(spot, kind));
}

/** The spots a perch's track is drawn through: a shelter's one seat, a cap's dome, a flower's head across. */
function spotsOn({ kind }: Perch): readonly number[] {
  if (kind === 'shelter') return [0];
  return kind === 'cap' ? CAP_SPOTS : [-PERCH_SPREAD, PERCH_SPREAD];
}

/**
 * The seats under each of `caps` (`capUnder`) whose dome `layout` draws at
 * least as wide as the widest butterfly's wings, judged at its size at `now`
 * (`sproutScale`), full-grown without one: a cap too small to hide one, a
 * sprout still small among them, offers none, and a funnel none at all.
 */
function sheltersUnder(
  layout: MeadowLayout,
  caps: readonly Planted[],
  now = Infinity,
): ShelterSeat[] {
  const span = widestOn(layout, 'butterfly');
  return caps.flatMap((mushroom) => {
    const genes = mushroomGenes(mushroom);
    const place = placeIn(layout.mushrooms, mushroom);
    const drawn = (place?.size ?? 0) * sproutScale(mushroom.sprout, now);
    return !hasTrumpet(genes) && genes.capWidth * drawn >= span
      ? SHELTER_SEATS.map((seat) => ({ ...pick(mushroom, 'id'), seat }))
      : [];
  });
}

/**
 * How far round its middle an insect sheltering is judged drawn, in its
 * kind's widest wingspan: as far as its wings reach.
 */
const SHELTER_REACH = 0.5;

/**
 * Whether a mushroom of `covers` nearer the front than `seat`'s cap is drawn
 * over an insect of any kind sheltering there (`discCovered`), as far round
 * its middle as `SHELTER_REACH` says.
 */
function shelterCovered(
  stand: Stand,
  seat: ShelterSeat,
  covers: readonly Cover[],
): boolean {
  const { layout, mushrooms } = stand;
  const seater = seaterOn(stand, { kind: 'shelter', ...seat });
  const mushroom = mushrooms.find(({ id }) => id === seat.id);
  const place = mushroom && placeIn(layout.mushrooms, mushroom);
  if (!seater || !place) return false;
  return INSECT_KINDS.some((kind) =>
    discCovered(
      seater(0, kind),
      SHELTER_REACH * widestOn(layout, kind),
      place.y,
      covers,
    ),
  );
}

/**
 * What the scene sees of the perches in `stand` at `now`, judged from
 * `OPENING_EYE` (a stand anchored at the eye, `anchoredStand`): the caps and
 * the flowers within `PERCH_REACH`, the seats under those caps wide enough
 * (`sheltersUnder`), sent even when none is, the flowers among them in sight
 * (`flowerInSight`, against no cover) to a butterfly, and to a bee, whose
 * seat and wings differ, the spots in the open air round the eye the stand
 * is anchored at (`airOf`), every two
 * perches on which two insects, the widest of their kinds, could cover more
 * than `MOST_OVERLAP` of the narrower wherever their spots put them, and
 * every two spots in the air on which two insects of their kinds would
 * overlap at all; and where each of them stands (`Places`).
 */
export function perchSight(stand: Stand, now?: number): Sight {
  const { layout, mushrooms } = stand;
  const covers = coversOn(layout, mushrooms);
  const standing = flowersOf(stand);
  const inSightTo = (kind: InsectKind) =>
    standing
      .filter(
        (flower) =>
          inReach(flower.foot) &&
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
  const caps = mushrooms.filter(({ foot }) =>
    inReach(foot, layout.mushrooms.anchor),
  );
  const shelters = sheltersUnder(layout, caps, now).filter(
    (seat) => !shelterCovered(stand, seat, covers),
  );
  const perches: Perch[] = [
    ...caps.map(({ id }) => ({ kind: 'cap', id }) as const),
    ...shelters.map((seat) => ({ kind: 'shelter', ...seat }) as const),
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
  const air = airOf(layout, layout.mushrooms.anchor);
  const unit = layout.insectSize;
  const rows = footRows(stand, standing);
  const aloftRow = clumpRow(layout.camera);
  // Entered one by one, the air's hundreds of keys costing several times as
  // much spread or through `Object.fromEntries` (`airOf`).
  const places: Record<string, Place> = {};
  for (const { perch, seater } of seaters) {
    const name = perchName(perch);
    const { x, y } = seater(0, 'butterfly');
    const fromEye = perchDistanceAtOpening(layout, rows.get(name) ?? aloftRow);
    places[name] = { x: x / unit, y: y / unit, fromEye };
  }
  for (const [name, place] of Object.entries(air.places)) places[name] = place;
  const aways = awayPlaces(layout, viewAt(layout.camera, OPENING_EYE));
  for (const [name, place] of Object.entries(aways)) places[name] = place;
  return {
    flowers: shown,
    beeFlowers,
    air: air.spots.map(({ id }) => id),
    crowded: [...perched, ...air.aloft],
    places,
    room: roomFor(stand, beeFlowers, covers),
    shelters,
  };
}

/** The ground row, in world px down the screen, each perch stands over, by its name (`perchName`). */
export type FootRows = ReadonlyMap<string, number>;

/**
 * How far from the opening eye, the eye the layout is laid out for, a perch
 * standing over the ground row `row` is, in the clump's size: what
 * `perchSight` measures `Place`'s `fromEye` by, and what `perchDistance`
 * measures at the opening eye.
 */
function perchDistanceAtOpening(layout: MeadowLayout, row: number): number {
  return rowAt(layout.camera, row).opening;
}

/** The ground row each cap's and standing flower's foot stands on in `stand`, among its `standing` flowers. */
export function footRows(
  stand: Stand,
  standing: readonly StandingFlower[] = flowersOf(stand),
): FootRows {
  const { layout, mushrooms } = stand;
  const caps = mushrooms.flatMap((mushroom) => {
    const place = placeIn(layout.mushrooms, mushroom);
    const id = pick(mushroom, 'id');
    const under = SHELTER_SEATS.map((seat) =>
      perchName({ kind: 'shelter', ...id, seat }),
    );
    return place
      ? [perchName({ kind: 'cap', ...id }), ...under].map(
          (name) => [name, place.y] as const,
        )
      : [];
  });
  const heads = standing.map(
    ({ id, place }) => [perchName({ kind: 'flower', id }), place.y] as const,
  );
  return new Map([...caps, ...heads]);
}

/**
 * What `view` shows of the world on `layout`, in the units of `Places`, which
 * stand every perch in the frame turned to the eye's heading
 * (`placeOfAloft`): the stretch of that frame between the screen's sides
 * (`screenSides`) and above its foot, out to
 * the brow (`D_SEE`), inset half the widest butterfly's wings so one seated
 * there is wholly in view; and the release's
 * way out of view (`wayOutOf`), past the edge where `view` draws the
 * `released` insect standing away (`releasedAway`).
 */
export function onscreenOf(
  layout: MeadowLayout,
  view: View | undefined,
  released?: Seeded & Kinded,
): Onscreen | undefined {
  if (!view) return undefined;
  const unit = layout.insectSize;
  const { left, right } = screenSides(view);
  return {
    left: left / unit,
    right: right / unit,
    downTo: view.height / unit,
    far: D_SEE,
    inset: widestOn(layout, 'butterfly') / 2 / unit,
    ...wayOutOf(layout, view, released && releasedAway(layout, view, released)),
  };
}
