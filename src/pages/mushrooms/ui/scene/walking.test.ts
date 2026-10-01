import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { STEP_LENGTH, STRIDE_CRUISE } from '../../model/stride';
import { BOB_SHARE, bobAt, Gait, gaitOf } from './walking';

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
