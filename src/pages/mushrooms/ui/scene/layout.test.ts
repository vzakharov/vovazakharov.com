import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MUSHROOM_SLOTS } from '../../model/game';
import type { Circle } from '../../model/geometry';
import {
  CAP_KINDS,
  GENE_RANGES,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { capReach, splayed } from '../../model/mushroom-pose';
import { mulberry32, nextSeed } from '../../model/random';
import {
  EDGE_MARGIN,
  FOOT_CLEARANCE,
  meadowLayout,
  SUN_GLOW_REACH,
  TAP_RADIUS,
  tapReach,
} from './layout';

const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
const onScreen = ({ x, y, r }: Circle, width: number, height: number) =>
  x - r >= 0 && x + r <= width && y - r >= 0 && y + r <= height;

const VIEWPORTS = [
  ['tablet', 1180, 820],
  ['tablet portrait', 820, 1180],
  ['phone', 390, 844],
  ['small phone', 320, 568],
  ['desktop', 1920, 1080],
] as const;
const VISITS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

describe('meadowLayout', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every cap in every slot on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      assert.equal(layout.mushrooms.length, MUSHROOM_SLOTS);
      for (const seed of VISITS) {
        const random = mulberry32(seed);
        for (const [slot, place] of layout.mushrooms.entries()) {
          const mushroom = {
            id: `mushroom-${slot}`,
            seed: nextSeed(random),
            cap: CAP_KINDS[slot % CAP_KINDS.length] ?? 'spotted',
          };
          const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
          const { left, right } = capReach(genes, turn);
          assert.ok(
            place.x - left * place.size >= EDGE_MARGIN &&
              place.x + right * place.size <= width - EDGE_MARGIN,
            `visit ${seed}: ${mushroom.id} past the edge`,
          );
        }
      }
    });

    it(`keeps the sun's glow on a ${name} screen`, () => {
      const { sun } = meadowLayout(width, height, 1);
      const glow = sun.r * SUN_GLOW_REACH;
      assert.ok(sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9);
    });

    it(`keeps every flower off every slot's foot on a ${name} screen`, () => {
      let placed = 0;
      for (const seed of VISITS) {
        const { flowers, mushrooms } = meadowLayout(width, height, seed);
        placed += flowers.length;
        for (const flower of flowers) {
          for (const mushroom of mushrooms) {
            const clear = mushroom.size * FOOT_CLEARANCE;
            for (const y of [flower.y, flower.y - flower.size]) {
              assert.ok(
                Math.hypot(flower.x - mushroom.x, y - mushroom.y) >= clear,
                `visit ${seed}: a flower on a mushroom's foot`,
              );
            }
          }
        }
      }
      // Moving flowers off the feet must not leave the meadow bare.
      assert.ok(placed / VISITS.length >= 4.5);
    });

    it(`keeps every flower shorter than the clump's stems on a ${name} screen`, () => {
      const { flowers, mushrooms } = meadowLayout(width, height, 1);
      const stem = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * GENE_RANGES.stemHeight[0]),
      );
      for (const flower of flowers) assert.ok(flower.size < stem);
    });

    it(`keeps the forest's back rows smaller and hazier on a ${name} screen`, () => {
      const { mushrooms } = meadowLayout(width, height, 1);
      const [nearest] = mushrooms;
      assert.ok(nearest);
      for (const place of mushrooms) {
        if (place.y < nearest.y) continue;
        assert.equal(place.haze, 0);
      }
      const back = mushrooms.filter(({ haze }) => haze > 0);
      assert.ok(back.length >= 2);
      for (const place of back) assert.ok(place.size < nearest.size);
    });

    it(`gives every control a finger's reach, apart, on a ${name} screen`, () => {
      const { mute, plus, minus, picker } = meadowLayout(width, height, 1);
      assert.equal(picker.length, CAP_KINDS.length);
      for (const drawn of [plus, minus, ...picker]) {
        assert.ok(drawn.r >= TAP_RADIUS);
      }
      // Each as its hit area, which the mute's small drawing reaches past.
      const controls = [mute, plus, minus, ...picker].map((control) => ({
        ...control,
        r: tapReach(control.r),
      }));
      for (const [index, control] of controls.entries()) {
        assert.ok(onScreen(control, width, height), `control ${index} off`);
        for (const other of controls.slice(index + 1)) {
          assert.ok(apart(control, other), `control ${index} overlaps`);
        }
      }
    });

    it(`keeps the flowers where they were across a resize on a ${name} screen`, () => {
      const before = meadowLayout(width, height, 7).flowers;
      const after = meadowLayout(width * 1.25, height * 1.25, 7).flowers;
      assert.equal(after.length, before.length);
      for (const [index, flower] of before.entries()) {
        assert.ok(Math.abs((after[index]?.x ?? 0) / 1.25 - flower.x) < 1e-6);
      }
    });
  }
});
