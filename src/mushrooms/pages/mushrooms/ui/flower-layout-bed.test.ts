import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import {
  CLUMP_DISTANCE,
  downOf,
  gathered,
  groundFootOf,
  standingOn,
} from '@/mushrooms/shared/world';
import {
  FAR_BAND,
  laidFlower,
  NEAR_BAND,
  seededBed,
} from '@/mushrooms/entities/flower/index.node-safe';
import { bandSlots } from '@/mushrooms/entities/flower/index.test-only';
import { VISITS } from '@/mushrooms/entities/mushroom/index.node-safe';

import { SAME_GROUND } from './flower-layout.test-kit';
import { meadowLayout } from './layout';
import { opened } from './visit-play';

describe('laidFlower', () => {
  it('lays a flower out so that, drawn as far ahead as it stands, it is the size the opening eye stands it at', () => {
    const { layout } = opened(1, 1180, 820, false);
    for (const [x, y] of [
      [0, 5],
      [-3, 7.5],
      [4, 12],
      [1, 18],
    ] as const) {
      const foot = { x, y, size: 0.4 };
      const drawn =
        (laidFlower(layout.camera, foot).size * CLUMP_DISTANCE) /
        gathered(foot).y;
      const stood = standingOn(layout.camera, foot).size;
      assert.ok(
        Math.abs(drawn - stood) < 1e-9 * stood,
        `${String(x)}, ${String(y)}`,
      );
    }
  });
});

describe('seededBed', () => {
  it('keeps every slot’s entry, in its own band, where slots find no spot', () => {
    const { camera, mushrooms } = meadowLayout(1180, 820, 1);
    const bands = [NEAR_BAND, FAR_BAND];
    const slots = bands.flatMap((band) =>
      Array.from({ length: bandSlots(band) }, () => band),
    );
    // A control as wide as the world over the ground below its top row
    // leaves the near band's slots out, and none of the far band's.
    const reach = 1e6;
    const opening = {
      ...pick(
        camera,
        'width',
        'height',
        'groundTop',
        'ground',
        'world',
        'unit',
      ),
      ...pick(mushrooms, 'frame'),
      controls: [
        { x: camera.world / 2, y: camera.groundTop + reach, r: reach },
      ],
      clump: [],
    };
    let out = 0;
    let after = 0;
    for (const seed of VISITS.slice(0, 20)) {
      const bed = seededBed(opening, seed, bands);
      assert.equal(bed.length, slots.length);
      for (const [slot, foot] of bed.entries()) {
        if (!foot) {
          out += 1;
          continue;
        }
        if (out > 0) after += 1;
        const [top, bottom] = slots[slot]?.down ?? [Number.NaN, Number.NaN];
        const down = downOf(groundFootOf(foot).z);
        assert.ok(
          down >= top - SAME_GROUND && down <= bottom + SAME_GROUND,
          `visit ${String(seed)}: slot ${String(slot)} off its band`,
        );
      }
    }
    assert.ok(
      out > 0 && after > 0,
      `${String(out)} out, ${String(after)} after`,
    );
  });
});
