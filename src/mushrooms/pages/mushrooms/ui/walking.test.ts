import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  browRow,
  deepestBob,
  Gait,
  GROUND_BOB,
  OPENING_EYE,
  viewAt,
} from '@/mushrooms/shared/world';
import {
  BOB_SHARE,
  bobAt,
  footfalls,
  gaitOf,
  SHOWN_LEAST,
  STEP_LENGTH,
  STRIDE_CRUISE,
} from '@/mushrooms/shared/world/index.test-only';
import {
  browFloor,
  nearFoot,
} from '@/mushrooms/entities/landscape/index.test-only';
import { VIEWPORTS } from '@/mushrooms/entities/mushroom/index.node-safe';

import { meadowLayout } from './layout';

describe('the footfalls', () => {
  it('lands none until the walk reaches a step', () => {
    assert.deepEqual(footfalls(0, STEP_LENGTH * 0.99), []);
    assert.deepEqual(footfalls(STEP_LENGTH * 1.1, STEP_LENGTH * 1.9), []);
  });

  it('lands one foot each time the walk crosses a step, alternating from the left', () => {
    assert.deepEqual(footfalls(0, STEP_LENGTH), ['left']);
    assert.deepEqual(footfalls(STEP_LENGTH * 1.5, STEP_LENGTH * 2.01), [
      'right',
    ]);
    assert.deepEqual(footfalls(STEP_LENGTH * 2.5, STEP_LENGTH * 3.2), ['left']);
  });

  it('lands every step a long frame crosses, in order', () => {
    assert.deepEqual(footfalls(STEP_LENGTH * 0.5, STEP_LENGTH * 3.5), [
      'left',
      'right',
      'left',
    ]);
  });

  it('counts as many footfalls over a walk, frame by frame, as steps it covers', () => {
    const feet: string[] = [];
    let walked = 0;
    for (let frame = 0; frame < 600; frame++) {
      const next = walked + 1.6 / 60;
      feet.push(...footfalls(walked, next));
      walked = next;
    }
    assert.equal(feet.length, Math.floor(walked / STEP_LENGTH));
    assert.ok(feet.every((foot, index) => foot !== feet[index - 1]));
  });

  it('lands nothing for a walk that stands', () => {
    assert.deepEqual(footfalls(2, 2), []);
  });
});

const HEIGHT = 820;
const A = BOB_SHARE * HEIGHT;

describe('the bob', () => {
  it('stays between -A and 0, at 0 each time a foot lands and lowest between', () => {
    for (let walked = 0; walked < 4; walked += 0.013) {
      const bob = bobAt(walked, HEIGHT, 1);
      assert.ok(bob <= 0 && bob >= -A - 1e-9, String(walked));
    }
    assert.ok(Math.abs(bobAt(STEP_LENGTH * 3, HEIGHT, 1)) < 1e-9);
    assert.ok(Math.abs(bobAt(STEP_LENGTH * 2.5, HEIGHT, 1) + A) < 1e-9);
  });

  it('is 0 at rest, wherever the walk stopped', () => {
    assert.equal(bobAt(STEP_LENGTH * 2.5, HEIGHT, 0), 0);
    assert.equal(gaitOf(0, 1 / 60), 0);
  });

  it('swings whole at a walking pace and in part slower', () => {
    assert.equal(gaitOf(STRIDE_CRUISE / 60, 1 / 60), 1);
    assert.ok(Math.abs(gaitOf(STRIDE_CRUISE / 120, 1 / 60) - 0.5) < 1e-9);
    assert.equal(gaitOf(-STRIDE_CRUISE / 60, 1 / 60), 1);
  });
});

/** How much of the camera's scroll a bed object takes: Phaser's default scroll factor. */
const BED_BOB = 1;

/** Where a row `y` stands on the screen with the camera scrolled `bob` down, for a thing taking `share` of the scroll. */
function onScreenAt(y: number, bob: number, share: number): number {
  return y - share * bob;
}

describe('the bob against the ground', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps a far thing's sliver over the brow and a foot on its ground row mid-step, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const view = viewAt(layout.camera, OPENING_EYE);
      const bob = bobAt(STEP_LENGTH / 2, height, 1);
      assert.ok(Math.abs(bob + deepestBob(height)) < 1e-9);
      // A far flower's head, sunk to show a sliver of SHOWN_LEAST over the brow.
      const x = width * 0.3;
      const brow = browRow(view, x);
      const tall = 20;
      const top = brow - SHOWN_LEAST * tall;
      const sliver = (share: number) =>
        onScreenAt(brow, bob, share) - onScreenAt(top, bob, BED_BOB);
      assert.ok(Math.abs(sliver(GROUND_BOB) - SHOWN_LEAST * tall) < 1e-9);
      // A foot on the ground's top picture row keeps to it.
      const floor = browFloor(layout.camera);
      assert.equal(
        onScreenAt(floor, bob, BED_BOB) - onScreenAt(floor, bob, GROUND_BOB),
        0,
      );
    });

    it(`shows no sky under the bobbing ground, the near range's foot reaching under it, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const view = viewAt(layout.camera, OPENING_EYE);
      const floor = nearFoot(layout.camera);
      const bob = -deepestBob(height);
      const lowest = Math.max(
        onScreenAt(browFloor(layout.camera), bob, GROUND_BOB),
        ...Array.from({ length: 33 }, (_, step) =>
          onScreenAt(browRow(view, (step / 32) * width), bob, GROUND_BOB),
        ),
      );
      assert.ok(floor > lowest, `${String(floor)} ≤ ${String(lowest)}`);
    });
  }
});

describe('a walk frame by frame', () => {
  it('lands a foot each step, alternating, and bobs only while walking', () => {
    const gait = new Gait();
    const frames = 120;
    const feet: string[] = [];
    let lowest = 0;
    for (let frame = 0; frame <= frames; frame++) {
      const now = frame / 60;
      const { feet: landed, bob } = gait.step(now * STRIDE_CRUISE, now, HEIGHT);
      feet.push(...landed);
      lowest = Math.min(lowest, bob);
    }
    assert.deepEqual(feet, ['left', 'right', 'left', 'right']);
    assert.ok(lowest < -A * 0.9);
    const still = gait.step(2 * STRIDE_CRUISE, 2 + 1 / 60, HEIGHT);
    assert.deepEqual(still, { feet: [], bob: 0 });
  });
});
