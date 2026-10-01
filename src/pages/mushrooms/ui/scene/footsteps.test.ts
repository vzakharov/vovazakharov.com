import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { STEP_LENGTH } from '../../model/stride';
import { footfalls } from './footsteps';

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
