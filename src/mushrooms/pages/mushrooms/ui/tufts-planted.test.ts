import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import { mulberry32, nextSeed } from '@/mushrooms/shared/lib/random';
import { FLOWER_SIZE, OPENING_EYE } from '@/mushrooms/shared/world';
import {
  flowerGenes,
  flowerHead,
  flowersOf,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  cellOf,
  cellTufts,
  type Tuft,
} from '@/mushrooms/entities/landscape/index.node-safe';
import {
  takesFlower,
  tendTufts,
} from '@/mushrooms/features/plant-flower/index.node-safe';
import { leaveTufts } from '@/mushrooms/features/plant-flower/index.test-only';

import type { MeadowLayout } from './layout';
import {
  grassOf,
  lawnOf,
  type MeadowStand,
  plantedOn,
  SCREENS,
  seedOf,
  tendedOn,
  tuftingOf,
  VISITS,
} from './tufts.test-kit';
import { opened, relaidOn } from './visit-play';

/** How many visits each screen pulls every seeded flower of, one at a time. */
const PULLED_VISITS = 6;

/** Each pulled flower's cell's tufts, on a visit of `seed`'s lawn on `layout`. */
const grownAtOf = (layout: MeadowLayout, seed: number) => (foot: Point) =>
  cellTufts(lawnOf(layout, seed), cellOf(foot));

describe('the ground’s grass', () => {
  it('keeps the head of every flower the child plants apart from every other head, on the screen it opened on and turned', () => {
    for (const [, width, height] of SCREENS) {
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = seedOf(visit);
        let stand: MeadowStand = opened(seed, width, height, visit % 2 === 1);
        const choosing = mulberry32(seed);
        const [grown, first] = grassOf(stand, seed);
        let sprouts = first;
        for (let planting = 0; planting < 5; planting++) {
          const next = sprouts[Math.floor(choosing() * sprouts.length)];
          if (!next) break;
          stand = plantedOn(stand, next, nextSeed(choosing));
          sprouts = tendTufts(stand, grown, OPENING_EYE);
        }
        const own = new Set(stand.planted.map(({ id }) => id));
        for (const [across, down] of [
          [width, height],
          [height, width],
        ] as const) {
          const layout = relaidOn(stand, seed, across, down);
          const heads = flowersOf({ ...stand, layout }).map(
            ({ id, seed: grownFrom, place }) => {
              const head = flowerHead(
                flowerGenes({ seed: grownFrom }),
                place.size,
              );
              return {
                id,
                ...pick(head, 'r'),
                x: place.x + head.x,
                y: place.y + head.y,
              };
            },
          );
          for (const head of heads.filter(({ id }) => own.has(id))) {
            for (const other of heads) {
              if (other === head) continue;
              assert.ok(
                Math.hypot(head.x - other.x, head.y - other.y) >=
                  head.r + other.r,
                `visit ${String(seed)}: ${head.id}'s head meets ${other.id}'s on ${String(across)}×${String(down)}`,
              );
            }
          }
        }
      }
    }
  });

  it('takes no second flower on a tuft planted, and stands nowhere once the world has no room, well past fourteen flowers', () => {
    const seed = 3;
    let stand: MeadowStand = opened(seed, 1180, 820, false);
    const [grown, first] = grassOf(stand, seed);
    let sprouts = first;
    const [tuft] = sprouts;
    assert.ok(tuft);
    const once = plantedOn(stand, tuft, 11);
    assert.equal(takesFlower(once, tuft.foot, OPENING_EYE), false);
    assert.ok(!tendTufts(once, grown, OPENING_EYE).includes(tuft));
    // Each planting takes a tuft's room, so the world fills well within this many.
    for (let planting = 0; planting < 400 && sprouts.length > 0; planting++) {
      const [next] = sprouts;
      assert.ok(next);
      stand = plantedOn(stand, next, stand.planted.length + 20);
      sprouts = tendTufts(stand, grown, OPENING_EYE);
    }
    assert.deepEqual(sprouts, []);
    assert.ok(stand.flowers.length + stand.planted.length > 14);
  });

  it('keeps every flower planted on a tuft through a turn and back, and no tuft standing at its root', () => {
    for (const [, width, height] of SCREENS) {
      const seed = 17;
      let stand: MeadowStand = opened(seed, width, height, false);
      let grown = tendedOn(stand.layout, seed);
      let sprouts = tendTufts(stand, grown, OPENING_EYE);
      for (let planting = 0; planting < 4; planting++) {
        const [next] = sprouts;
        if (!next) break;
        stand = plantedOn(stand, next, stand.planted.length + 40);
        sprouts = tendTufts(stand, grown, OPENING_EYE);
      }
      assert.ok(stand.planted.length > 0);
      for (const [across, down] of [
        [width, height],
        [height, width],
        [width, height],
      ] as const) {
        const layout = relaidOn(stand, seed, across, down);
        grown = tendedOn(layout, seed);
        const drawn: Tuft[] = tendTufts(
          { ...stand, layout },
          grown,
          OPENING_EYE,
        ).map(({ tuft }) => tuft);
        const standing = flowersOf({ ...stand, layout });
        for (const { id } of stand.planted) {
          const flower = standing.find((each) => each.id === id);
          assert.ok(flower, `${id} gone on ${String(across)}×${String(down)}`);
          // A tuft's blades spread about its size round its root.
          for (const tuft of drawn) {
            assert.ok(
              Math.hypot(tuft.x - flower.place.x, tuft.y - flower.place.y) >
                tuft.size,
              `a tuft drawn at ${id}'s root on ${String(across)}×${String(down)}`,
            );
          }
        }
      }
    }
  });

  it('leaves a tuft where a seeded flower pulled up stood, which takes a flower as any tuft does, and comes back once that one is pulled too', () => {
    for (const [name, width, height] of SCREENS) {
      let left = 0;
      let tried = 0;
      for (let visit = 0; visit < PULLED_VISITS; visit++) {
        const seed = seedOf(visit);
        const stand = opened(seed, width, height, visit % 2 === 1);
        const [grown, standing] = grassOf(stand, seed);
        for (const flower of flowersOf(stand)) {
          const at = `${name}, visit ${String(seed)}, ${flower.id}`;
          const pulled = { ...stand, pulled: [flower.id] };
          const tufting = tuftingOf(seed + 1);
          const grownAt = grownAtOf(stand.layout, seed);
          const leaving = leaveTufts(pulled, grownAt, [], tufting);
          assert.equal(leaving.length, 1, at);
          const [spot] = leaving;
          assert.ok(spot);
          assert.deepEqual(spot.foot, {
            ...pick(flower.foot, 'x', 'y'),
            size: FLOWER_SIZE,
          });
          const back = tendTufts(pulled, [...grown, ...leaving], OPENING_EYE);
          tried += 1;
          if (!back.includes(spot)) continue;
          left += 1;
          assert.ok(back.length > standing.length, at);
          const replanted = plantedOn(pulled, spot, seed + 2);
          assert.equal(
            leaveTufts(replanted, grownAt, leaving, tufting),
            leaving,
            at,
          );
          assert.ok(
            !tendTufts(replanted, [...grown, ...leaving], OPENING_EYE).includes(
              spot,
            ),
            at,
          );
          const newest = replanted.planted.at(-1);
          assert.ok(newest);
          const repulled = {
            ...replanted,
            pulled: [...replanted.pulled, newest.id],
          };
          assert.equal(
            leaveTufts(repulled, grownAt, leaving, tufting),
            leaving,
            at,
          );
          assert.ok(
            tendTufts(repulled, [...grown, ...leaving], OPENING_EYE).includes(
              spot,
            ),
            at,
          );
        }
      }
      // A spot stands only where a flower fits and a finger finds it bare, as
      // every tuft does; a mushroom's cap over it keeps some away.
      assert.ok(
        left > tried / 2,
        `${String(left)} of ${String(tried)} seeded flowers on the ${name} left a tuft standing`,
      );
    }
  });
});
