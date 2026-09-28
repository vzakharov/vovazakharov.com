import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowerGenes } from '../../model/flower-genes';
import {
  type Box,
  boxAround,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { geneBounds } from '../../model/mushroom-genes';
import { standingAt } from './door-sight';
import { FLOWER_SWAY, FOOT_CLEARANCE, MOST_SHADED } from './flower-layout';
import { type StandingFlower, standingFlowers } from './flower-plots';
import { type MeadowLayout, meadowLayout } from './layout';
import { standingControls } from './sky-layout';
import { VIEWPORTS, VISITS } from './viewports';
import { type Opened, opened } from './visit-play';

/** The least number of seeded flowers the average visit keeps, on every screen. */
const LEAST_FLOWERS = 6.5;
/** How many points across a flower's head its share hidden is read at. */
const HEAD_STEPS = 9;

/** Each way a screen `width` by `height` may be held: as named, and turned. */
function heldEitherWay(
  width: number,
  height: number,
): Array<[string, number, number]> {
  return [
    ['as it opens', width, height],
    ['turned', height, width],
  ];
}

/**
 * Every visit opened on a screen `width` by `height` as the scene opens it,
 * opened once for every test of that screen that reads it; a screen's tests
 * run one after another, so only the latest two screens' are kept.
 */
const openedOn = new Map<string, Opened[]>();
function visitsOn(width: number, height: number): Opened[] {
  const key = `${String(width)} ${String(height)}`;
  const known =
    openedOn.get(key) ??
    VISITS.map((seed) => opened(seed, width, height, false));
  openedOn.set(key, known);
  for (const oldest of openedOn.keys()) {
    if (openedOn.size <= 2) break;
    openedOn.delete(oldest);
  }
  return known;
}

/** Every head of `flower` as drawn: at rest, and leant either way by the breeze. */
function headsOf({ seed, place }: StandingFlower): Circle[] {
  const { stemBend, petalLength } = flowerGenes({ seed });
  return [-FLOWER_SWAY, 0, FLOWER_SWAY].map((sway) => ({
    x:
      place.x +
      stemBend * place.size * Math.cos(sway) +
      place.size * Math.sin(sway),
    y:
      place.y +
      stemBend * place.size * Math.sin(sway) -
      place.size * Math.cos(sway),
    r: petalLength * place.size,
  }));
}

/** Points evenly spread over `head`, as a grid its box holds. */
function headPoints({ x, y, r }: Circle): Point[] {
  const step = (2 * r) / HEAD_STEPS;
  return Array.from({ length: HEAD_STEPS ** 2 }, (_, index) => ({
    x: x - r + ((index % HEAD_STEPS) + 0.5) * step,
    y: y - r + (Math.floor(index / HEAD_STEPS) + 0.5) * step,
  })).filter((point) => Math.hypot(point.x - x, point.y - y) <= r);
}

/** Each control's circle as drawn, the pickers' included. */
const drawnControls = (layout: MeadowLayout): Circle[] => [
  ...standingControls(layout),
  ...layout.picker,
  ...layout.housePicker,
];

/** Whether `point` lies inside `box`, edges included. */
const inBox = ({ left, right, top, bottom }: Box, { x, y }: Point) =>
  x >= left && x <= right && y >= top && y <= bottom;

describe('the seeded flowers', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keep off every foot the meadow stands, as many on the screen turned, on a ${name} screen`, (t) => {
      let least = Infinity;
      let placed = 0;
      const [heres, turneds] = heldEitherWay(width, height).map(([, w, h]) =>
        visitsOn(w, h),
      );
      for (const [index, seed] of VISITS.entries()) {
        const here = heres?.[index]?.layout;
        const turned = turneds?.[index]?.layout;
        assert.ok(here && turned);
        assert.equal(
          turned.flowers.length,
          here.flowers.length,
          `visit ${seed}: a turn shows or hides a flower`,
        );
        placed += here.flowers.length;
        for (const { flowers, mushrooms } of [here, turned]) {
          for (const flower of flowers) {
            for (const mushroom of mushrooms) {
              for (const y of [flower.y, flower.y - flower.size]) {
                least = Math.min(
                  least,
                  Math.hypot(flower.x - mushroom.x, y - mushroom.y) /
                    (mushroom.size * FOOT_CLEARANCE),
                );
              }
            }
          }
        }
      }
      const perVisit = placed / VISITS.length;
      t.diagnostic(
        `least clearance off a foot ${least.toFixed(3)}, ${perVisit.toFixed(2)} flowers a visit`,
      );
      assert.ok(
        least >= 1,
        `a flower on a foot, clearance ${least.toFixed(3)}`,
      );
      // Moving flowers where they are seen must not leave the meadow bare.
      assert.ok(perVisit >= LEAST_FLOWERS, `${perVisit.toFixed(2)} a visit`);
    });

    it(`keep every head off every control, however the breeze leans it, on a ${name} screen held either way`, (t) => {
      let nearest = Infinity;
      for (const [held, w, h] of heldEitherWay(width, height)) {
        for (const [index, visit] of visitsOn(w, h).entries()) {
          const controls = drawnControls(visit.layout);
          for (const flower of standingFlowers(
            visit.layout,
            visit.flowers,
            [],
          )) {
            for (const head of headsOf(flower)) {
              for (const control of controls) {
                const gap =
                  Math.hypot(head.x - control.x, head.y - control.y) -
                  control.r -
                  head.r;
                nearest = Math.min(nearest, gap);
                assert.ok(
                  gap >= 0,
                  `visit ${String(VISITS[index])}, ${held}: ${flower.id}'s head under a control`,
                );
              }
            }
          }
        }
      }
      t.diagnostic(
        `nearest a head comes to a control: ${nearest.toFixed(1)} px`,
      );
    });

    it(`keep every head at least half in sight past the clump the visit opens with, on a ${name} screen held either way`, (t) => {
      let most = 0;
      let behind = 0;
      let flowers = 0;
      for (const [held, w, h] of heldEitherWay(width, height)) {
        for (const [index, visit] of visitsOn(w, h).entries()) {
          const clump = visit.meadow.mushrooms.flatMap((mushroom) => {
            const place = visit.layout.mushrooms[mushroom.slot];
            if (!place) return [];
            const drawn = standingAt(place, mushroom).drawn.map((outline) => ({
              outline,
              box: boxAround(outline),
            }));
            return [{ depth: place.y, drawn }];
          });
          const standing = standingFlowers(visit.layout, visit.flowers, []);
          flowers += standing.length;
          for (const flower of standing) {
            const nearer = clump
              .filter(({ depth }) => depth > flower.place.y)
              .flatMap(({ drawn }) => drawn);
            let hidden = 0;
            for (const head of headsOf(flower)) {
              const points = headPoints(head);
              const shaded = points.filter((point) =>
                nearer.some(
                  ({ outline, box }) =>
                    inBox(box, point) && containsPoint(outline, point),
                ),
              ).length;
              hidden = Math.max(hidden, shaded / points.length);
            }
            most = Math.max(most, hidden);
            if (hidden > 0) behind += 1;
            assert.ok(
              hidden <= MOST_SHADED,
              `visit ${String(VISITS[index])}, ${held}: ${flower.id} ${(hidden * 100).toFixed(0)}% hidden by the clump`,
            );
          }
        }
      }
      t.diagnostic(
        `most of a head hidden ${(most * 100).toFixed(0)}%, ${((behind / flowers) * 100).toFixed(1)}% of flowers partly behind the clump`,
      );
    });

    it(`keep every flower shorter than the clump's stems on a ${name} screen`, () => {
      const { flowers, mushrooms } = meadowLayout(width, height, 1);
      const stem = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * geneBounds('stemHeight')[0]),
      );
      for (const flower of flowers) assert.ok(flower.size < stem);
    });

    it(`keep where the visit opened them across a resize and a turn on a ${name} screen`, () => {
      const turned = visitsOn(height, width);
      for (const [index, visit] of visitsOn(width, height)
        .slice(0, 50)
        .entries()) {
        const seed = (VISITS[index] ?? 0) ^ 0xf1_0e_25;
        const opening = {
          screen: { width, height },
          openers: visit.meadow.mushrooms,
        };
        const before = visit.layout;
        const after = meadowLayout(width * 1.25, height * 1.1, seed, opening);
        assert.equal(after.flowers.length, before.flowers.length);
        for (const [at, flower] of before.flowers.entries()) {
          const moved = after.flowers[at];
          assert.ok(moved);
          assert.ok(Math.abs(moved.x / 1.25 - flower.x) < 1e-6);
          assert.ok(
            Math.abs(
              (moved.y - after.groundTop) / 1.1 - (flower.y - before.groundTop),
            ) < 1e-6,
          );
        }
        // Turned, they stand where a visit opened on the screen turned has them.
        assert.deepEqual(
          meadowLayout(height, width, seed, opening).flowers,
          turned[index]?.layout.flowers,
        );
      }
    });
  }
});
