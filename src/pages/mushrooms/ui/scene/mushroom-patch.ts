/**
 * A grown mushroom's own patch: where a finger lands on it and nothing but
 * that mushroom takes the tap, as the scene hit-tests it (`hit-areas.ts`) —
 * the front-most of the mushrooms and the flowers that answer. Growth keeps
 * one for every mushroom (`roomFor`), and the sweeps measure how wide it is.
 * The controls stand on the screen and the world pans under them, so a pan
 * may slide any cap under one: a patch is measured without them, and
 * `roomFor` keeps a new mushroom off them where they stand as it grows.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import {
  type Box,
  boxAround,
  boxesMeet,
  placedAt,
  type Point,
  type WithMiddle,
} from '../../model/geometry';
import {
  type Camera,
  type Ground,
  groundOfPlane,
  type Layered,
  type LayeredPoint,
  planeOf,
  scaleAt,
  type WithCamera,
} from '../../model/ground';
import type { Splayed } from '../../model/mushroom-pose';
import { openingIndex } from '../../model/placement';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import { flowersOf } from './flower-plots';
import { flowerTapReach, type Stand } from './flower-sight';
import type { Placement } from './layout';
import { meadowCamera } from './meadow-camera';
import {
  drawnHolds,
  drawnUnder,
  type FlowerReach,
  flowerTakes,
  type MushroomTarget,
  tapTarget,
} from './mushroom-tap';

/**
 * The least radius, in CSS px, of the disc the opening clump's own patch
 * holds on a tablet held sideways: its back cap is crossed by the front one
 * by design and shows at least `BACK_CAP_SHOWN` of itself, on a short screen
 * under the zoom floor (`floorOn`) a crescent that holds little more.
 */
const CLUMP_PATCH = 12;
/**
 * The least radius, in CSS px, of the disc the patch of each mushroom the
 * forest grows holds on a tablet held sideways, standing as far off as the
 * clump's front foot or nearer, which growth keeps (`roomFor`): the most
 * that still leaves room for six mushrooms in almost every visit
 * (`LEAST_FULL`).
 */
const GROWN_PATCH = 16;
/** The least patch on any screen, at any depth. */
const LEAST_PATCH = 6;
/** The clump's size on the tablet held sideways the patches are set on. */
const TABLET_UNIT = meadowCamera(1180, 820).unit;
/** How far apart the middles of the discs tried for a patch are, in CSS px. */
const TRY_STEP = 3;
/** How many points each of a disc's two rings is tried at, beside its middle. */
const RING_POINTS = 12;

/**
 * The least radius of the patch the mushroom standing on `foot` keeps where
 * `camera` shows it: its patch on a tablet held sideways, shrunk with the
 * size the camera draws the clump at below a tablet's and with how much
 * smaller a mushroom stands drawn farther off than the clump's front foot,
 * down to `LEAST_PATCH`. Neither a bigger screen nor a nearer foot grows it.
 */
function patchFloor(foot: Point, { unit }: Camera): number {
  const tablet = openingIndex(foot) === undefined ? GROWN_PATCH : CLUMP_PATCH;
  const { z } = groundOfPlane(foot);
  const shrunk =
    (Math.min(unit, TABLET_UNIT) / TABLET_UNIT) * Math.min(1, scaleAt(z));
  return Math.max(LEAST_PATCH, tablet * shrunk);
}

/** A flower's head as a tap finds it, on screen (`flowerTakes`), and how near the front it stands. */
type FlowerTap = LayeredPoint & FlowerReach;

/** A mushroom as its patch is sought: how a tap finds it, and where on screen to seek. */
export type PatchTarget = MushroomTarget &
  WithId &
  /** The foot's y, which the scene paints by: the higher, the nearer the front. */
  Layered &
  /** The head's middle on screen, where a patch is sought first. */
  WithMiddle & {
    /** The box round its head on screen, where a patch is sought. */
    box: Box;
    /** The box round all it takes a tap on, stem too, on screen: nothing past it reaches the mushroom. */
    reach: Box;
  };

/** What in the world takes a tap: its flowers and its mushrooms, the last back to front. */
export type Tapped = {
  flowers: readonly FlowerTap[];
  targets: readonly PatchTarget[];
};

/** The mushroom `id`, `stood` as the scene stands it in `place`, as its patch is sought. */
export function patchTarget(
  id: string,
  place: Placement,
  { genes, turn }: Splayed,
): PatchTarget {
  const target = tapTarget(genes, place.size, place, turn);
  const { cap, gills, stem } = target.area;
  const head = boxAround([...cap, ...gills]);
  const onScreen = (points: readonly Point[]) =>
    points.map((point) => placedAt(place, turn, point));
  const headCorners = onScreen([...cap, ...gills]);
  return {
    ...target,
    id,
    depth: place.y,
    middle: placedAt(place, turn, {
      x: (head.left + head.right) / 2,
      y: (head.top + head.bottom) / 2,
    }),
    box: boxAround(headCorners),
    reach: boxAround([...headCorners, ...onScreen(stem)]),
  };
}

/** What takes a tap in `stand`'s world: its flowers and its mushrooms. */
export function tappedIn(stand: Stand): Tapped {
  const { layout, mushrooms } = stand;
  return {
    flowers: flowerTaps(stand),
    targets: mushrooms
      .flatMap((mushroom) => {
        const place = placeIn(layout.mushrooms, mushroom);
        return place
          ? [patchTarget(mushroom.id, place, standingAt(place, mushroom))]
          : [];
      })
      .toSorted((a, b) => a.depth - b.depth),
  };
}

/**
 * The id of each of `stand`'s mushrooms keeping no patch (`patchOf`) as
 * wide as `least` asks of the mushroom standing on its foot, `patchFloor`
 * by default (`tappedIn`).
 */
export function patchlessIn(
  stand: Stand,
  least: (foot: Point) => number = (foot) =>
    patchFloor(foot, stand.layout.camera),
): string[] {
  const tapped = tappedIn(stand);
  return tapped.targets.flatMap((target) => {
    const mushroom = stand.mushrooms.find(({ id }) => id === target.id);
    if (!mushroom) throw new Error(`${target.id} stands in no meadow`);
    return patchOf(target, tapped, least(mushroom.foot)) ? [] : [target.id];
  });
}

/** Every flower standing in `stand`, as a tap finds its head. */
function flowerTaps(stand: Stand): FlowerTap[] {
  return flowersOf(stand).map(({ place, seed }) => {
    const head = flowerHead(flowerGenes({ seed }), place.size);
    return {
      x: place.x + head.x,
      y: place.y + head.y,
      petals: head.r,
      tap: flowerTapReach(head.r),
      depth: place.y,
    };
  });
}

/** The box `r` either side of `point`, across and down. */
function boxRound({ x, y }: Point, r: number): Box {
  return { left: x - r, right: x + r, top: y - r, bottom: y + r };
}

/** Whether `box` holds `at`. */
function boxHolds({ left, right, top, bottom }: Box, { x, y }: Point): boolean {
  return x >= left && x <= right && y >= top && y <= bottom;
}

/** The id a tap on a flower goes to. */
const FLOWER = 'a flower';

/**
 * What a tap at `at` goes to: of the mushrooms whose drawn parts hold it and
 * the flowers that take it (`flowerTakes`), the nearest the front, a
 * mushroom winning a tie.
 */
export function takerAt(
  at: Point,
  { flowers, targets }: Tapped,
): string | undefined {
  // Past its `reach` a mushroom takes no part in a tap.
  const near = targets.filter((target) => boxHolds(target.reach, at));
  let front: { id: string; depth: number } | undefined;
  for (const target of near) {
    const answers = drawnHolds(target.area, target.local(at));
    if (answers && (!front || target.depth >= front.depth)) front = target;
  }
  let under: boolean | undefined;
  const underDrawn = () => (under ??= drawnUnder(at, near));
  for (const flower of flowers) {
    const takes = flowerTakes(
      Math.hypot(flower.x - at.x, flower.y - at.y),
      flower,
      underDrawn,
    );
    if (takes && (!front || flower.depth > front.depth)) {
      front = { id: FLOWER, ...pick(flower, 'depth') };
    }
  }
  return front?.id;
}

/** The points a disc `radius` round its middle is tried at: its middle, and two rings round it. */
function discOf(radius: number): Point[] {
  return [
    { x: 0, y: 0 },
    ...[0.5, 1].flatMap((share) =>
      Array.from({ length: RING_POINTS }, (_, index) => {
        const angle = (index * 2 * Math.PI) / RING_POINTS + share;
        return {
          x: share * radius * Math.cos(angle),
          y: share * radius * Math.sin(angle),
        };
      }),
    ),
  ];
}

/**
 * The middle of a disc `radius` round, within `target`'s box, that only
 * `target` takes a tap in, nearest its head's middle; `undefined` where
 * none is.
 */
function patchOf(
  target: PatchTarget,
  tapped: Tapped,
  radius: number,
): Point | undefined {
  const disc = discOf(radius);
  const { box, reach, middle, id } = target;
  const { left, right, top, bottom } = box;
  // Only what reaches a disc round the box takes part in a tap on it.
  const zone = {
    left: left - radius,
    right: right + radius,
    top: top - radius,
    bottom: bottom + radius,
  };
  const reaches = (point: Point, r: number) =>
    boxesMeet(zone, boxRound(point, r));
  const near: Tapped = {
    flowers: tapped.flowers.filter((flower) =>
      reaches(flower, Math.max(flower.petals, flower.tap)),
    ),
    targets: tapped.targets.filter((each) => boxesMeet(zone, each.reach)),
  };
  // A disc the mushroom alone takes lies inside all it takes a tap on.
  const held = (x: number, y: number) =>
    x - radius >= reach.left &&
    x + radius <= reach.right &&
    y - radius >= reach.top &&
    y + radius <= reach.bottom;
  const tries: Array<Point & { away: number }> = [];
  for (let x = left; x <= right; x += TRY_STEP) {
    for (let y = top; y <= bottom; y += TRY_STEP) {
      if (!held(x, y)) continue;
      const away = Math.hypot(x - middle.x, y - middle.y);
      tries.push({ x, y, away });
    }
  }
  return tries
    .toSorted((a, b) => a.away - b.away)
    .find((at) =>
      disc.every(
        ({ x, y }) => takerAt({ x: at.x + x, y: at.y + y }, near) === id,
      ),
    );
}

/**
 * One of the meadow's mushrooms as a tap finds it, the least patch it keeps
 * (`patchFloor`), and the middle of the patch it keeps before a new one
 * grows: `undefined` where it keeps none.
 */
type Held = { target: PatchTarget; floor: number; patch: Point | undefined };

/**
 * What takes a tap on a meadow a new mushroom is tried on, the patch each of
 * its mushrooms keeps, and the camera that sets the least a new one keeps
 * (`patchFloor`).
 */
export type Around = WithCamera & { tapped: Tapped; held: readonly Held[] };

/** `stand` as a new mushroom is tried on it (`keepsPatches`). */
export function patchesAround(stand: Stand): Around {
  const tapped = tappedIn(stand);
  const { camera } = stand.layout;
  const floors = new Map(
    stand.mushrooms.map(({ id, foot }) => [id, patchFloor(foot, camera)]),
  );
  return {
    tapped,
    camera,
    held: tapped.targets.map((target) => {
      const floor = floors.get(target.id);
      if (floor === undefined) throw new Error(`${target.id} has no foot`);
      return { target, floor, patch: patchOf(target, tapped, floor) };
    }),
  };
}

/**
 * Whether `own`, grown on `foot` among what takes a tap `around` it, keeps a
 * patch of its own as wide as one there keeps (`patchFloor`), and leaves
 * every mushroom there the patch it kept. A new mushroom takes a tap only
 * within its `reach`, so a patch clear of it is kept as it was, and one that
 * kept none before is not asked for one.
 */
export function keepsPatches(
  own: PatchTarget,
  foot: Ground,
  { tapped, held, camera }: Around,
): boolean {
  const among = {
    ...tapped,
    targets: [...tapped.targets, own].toSorted((a, b) => a.depth - b.depth),
  };
  return (
    patchOf(own, among, patchFloor(planeOf(foot), camera)) !== undefined &&
    held.every(
      ({ target, floor, patch }) =>
        !patch ||
        !boxesMeet(own.reach, boxRound(patch, floor)) ||
        patchOf(target, among, floor) !== undefined,
    )
  );
}
