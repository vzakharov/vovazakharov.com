import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import {
  boxAround,
  type Circle,
  placedAt,
  type Point,
} from '../../model/geometry';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import { standingFlowers } from './flower-plots';
import { flowerTapReach } from './flower-sight';
import {
  drawnHolds,
  drawnUnder,
  fingerPad,
  type FlowerReach,
  flowerTakes,
  type MushroomTarget,
  tappedMushroom,
} from './mushroom-tap';
import { standingControls, tapReach } from './sky-layout';
import { VIEWPORTS, VISITS } from './viewports';
import { type Opened, opened, tapTarget } from './visit-play';

/**
 * The least disc, in CSS px round its middle, a grown mushroom's own patch
 * holds: where a finger lands and nothing but that mushroom takes the tap.
 * A lone mushroom's head is drawn a finger wide and half a finger's reach
 * deep, or padded to a finger's reach (`fingerPad`); among the forest, the
 * nearer ones may hide a quarter of its cap (`MOST_HIDDEN`), which leaves
 * this much, not a whole `TAP_RADIUS`.
 */
const LEAST_PATCH = 12;
/** How many visits each screen grows a forest for, and tries at every size up to the cap. */
const FORESTS = 40;
/** How far apart the middles of the discs tried for a patch are, in CSS px. */
const TRY_STEP = 3;
/** The points a disc is tried at: its middle, and two rings round it. */
const DISC = [
  { x: 0, y: 0 },
  ...[0.5, 1].flatMap((share) =>
    Array.from({ length: 12 }, (_, index) => {
      const angle = (index * Math.PI) / 6 + share;
      return {
        x: share * LEAST_PATCH * Math.cos(angle),
        y: share * LEAST_PATCH * Math.sin(angle),
      };
    }),
  ),
];

/** What on a screen takes a tap: its controls, its flowers and its mushrooms. */
type Tapped = {
  controls: readonly Circle[];
  flowers: readonly Flower[];
  targets: readonly Target[];
};

/** A flower's head as a tap finds it, on screen (`flowerTakes`), and how near the front it stands. */
type Flower = Point & FlowerReach & { depth: number };

type Target = MushroomTarget & {
  id: string;
  /** The foot's y, which the scene paints by: the higher, the nearer the front. */
  depth: number;
  /** Where to try discs from: the head's middle on screen, and the box round its head and pad. */
  middle: Point;
  box: { left: number; right: number; top: number; bottom: number };
};

/** `stand`'s mushrooms as the scene stands them and a tap finds them, back to front. */
function targetsOf({ layout, mushrooms }: Opened): Target[] {
  return mushrooms
    .flatMap((mushroom) => {
      const place = placeIn(layout.mushrooms, mushroom);
      if (!place) return [];
      // Splayed as the bed stands it, which leans the cap.
      const { genes, turn } = standingAt(place, mushroom);
      const target = tapTarget(genes, place.size, place, turn);
      const { cap, gills } = target.area;
      const head = boxAround([...cap, ...gills]);
      const pad = fingerPad(target.area);
      const corners = [
        ...cap,
        ...gills,
        ...(pad
          ? [-1, 1].flatMap((dx) =>
              [-1, 1].map((dy) => ({
                x: pad.x + dx * pad.r,
                y: pad.y + dy * pad.r,
              })),
            )
          : []),
      ].map((point) => placedAt(place, turn, point));
      return [
        {
          ...target,
          ...pick(mushroom, 'id'),
          depth: place.y,
          middle: placedAt(place, turn, {
            x: (head.left + head.right) / 2,
            y: (head.top + head.bottom) / 2,
          }),
          box: boxAround(corners),
        },
      ];
    })
    .toSorted((a, b) => a.depth - b.depth);
}

/**
 * What a tap at `at` goes to, as the scene hit-tests it: a control over
 * everything; else, of the mushrooms that answer it — whose drawn parts hold
 * it, or whose pad takes it (`tappedMushroom`) — and the flowers that take
 * it (`flowerTakes`), the nearest the front.
 */
function takerAt(
  at: Point,
  { controls, flowers, targets }: Tapped,
): string | undefined {
  const within = (circle: Circle) =>
    Math.hypot(circle.x - at.x, circle.y - at.y) <= circle.r;
  if (controls.some((control) => within(control))) return 'a control';
  const padded = tappedMushroom(at, targets);
  let front: { id: string; depth: number } | undefined;
  for (const target of targets) {
    const answers =
      drawnHolds(target.area, target.local(at)) ||
      (padded === target && fingerPad(target.area) !== undefined);
    if (answers && (!front || target.depth >= front.depth)) front = target;
  }
  for (const flower of flowers) {
    const takes = flowerTakes(
      Math.hypot(flower.x - at.x, flower.y - at.y),
      flower,
      () => drawnUnder(at, targets),
    );
    if (takes && (!front || flower.depth > front.depth)) {
      front = { id: 'a flower', ...pick(flower, 'depth') };
    }
  }
  return front?.id;
}

/** The middle of a `LEAST_PATCH` disc only `target` takes a tap in, nearest its head's middle; `undefined` where none is. */
function patchOf(target: Target, tapped: Tapped): Point | undefined {
  const { left, right, top, bottom } = target.box;
  const tries: Point[] = [];
  for (let x = left; x <= right; x += TRY_STEP) {
    for (let y = top; y <= bottom; y += TRY_STEP) tries.push({ x, y });
  }
  const away = ({ x, y }: Point) =>
    Math.hypot(x - target.middle.x, y - target.middle.y);
  return tries
    .toSorted((a, b) => away(a) - away(b))
    .find((middle) =>
      DISC.every(
        ({ x, y }) =>
          takerAt({ x: middle.x + x, y: middle.y + y }, tapped) === target.id,
      ),
    );
}

describe('a grown forest’s taps', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`leave every mushroom a patch of its own, at every size up to the cap, on a ${name} screen`, (t) => {
      let tried = 0;
      for (const seed of VISITS.slice(0, FORESTS)) {
        const forest = opened(seed, width, height, true);
        // Closed, the pickers take no tap.
        const controls = standingControls(forest.layout).map((control) => ({
          ...control,
          r: tapReach(control.r),
        }));
        for (let size = 1; size <= forest.mushrooms.length; size += 1) {
          const stand = {
            ...forest,
            mushrooms: forest.mushrooms.slice(0, size),
          };
          const flowers = standingFlowers(
            stand.layout,
            stand.flowers,
            stand.planted,
            stand.mushrooms,
          ).map(({ place, seed: own }) => {
            const head = flowerHead(flowerGenes({ seed: own }), place.size);
            return {
              x: place.x + head.x,
              y: place.y + head.y,
              petals: head.r,
              tap: flowerTapReach(head.r),
              depth: place.y,
            };
          });
          const targets = targetsOf(stand);
          const tapped = { controls, flowers, targets };
          for (const target of targets) {
            tried += 1;
            assert.ok(
              patchOf(target, tapped),
              `visit ${String(seed)}, ${String(size)} grown: ${target.id} keeps no patch ${String(2 * LEAST_PATCH)} px across of its own`,
            );
          }
        }
      }
      t.diagnostic(`${String(tried)} mushrooms each kept a patch`);
    });
  }
});
