import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bedClosing,
  CLOSING_STEPS,
  closingsDue,
  closingStep,
  meanClosing,
} from './flower-closing';

describe('bedClosing', () => {
  it('shuts the bed as far as the rain or the dusk, whichever is further on', () => {
    assert.equal(bedClosing(0, 0), 0);
    assert.equal(bedClosing(0.3, 0.8), 0.8);
    assert.equal(bedClosing(1, 0.2), 1);
  });
});

describe('closingStep', () => {
  it('rounds to the nearest of the steps', () => {
    assert.equal(closingStep(0), 0);
    assert.equal(closingStep(1), 1);
    assert.equal(closingStep(0.5), 0.5);
    assert.equal(closingStep(0.49 / CLOSING_STEPS), 0);
    assert.equal(closingStep(0.51 / CLOSING_STEPS), 1 / CLOSING_STEPS);
  });

  it('takes as many distinct values across a shower as there are steps, and one more', () => {
    const steps = new Set(
      Array.from({ length: 1001 }, (_, index) => closingStep(index / 1000)),
    );
    assert.equal(steps.size, CLOSING_STEPS + 1);
  });

  it('clamps outside 0–1', () => {
    assert.equal(closingStep(-0.2), 0);
    assert.equal(closingStep(1.3), 1);
  });
});

const flower = (closing: number, ahead: number, hidden = false) => ({
  closing,
  stands: { ahead, drawn: !hidden },
});

describe('meanClosing', () => {
  it('averages how far shut the flowers are, 0 with none', () => {
    assert.equal(meanClosing([]), 0);
    assert.equal(meanClosing([{ closing: 0.25 }, { closing: 0.75 }]), 0.5);
  });
});

describe('closingsDue', () => {
  it('skips the flowers already painted at the step', () => {
    const due = closingsDue([flower(0.5, 1), flower(0, 2)], 0.5);
    assert.deepEqual(due, [flower(0, 2)]);
  });

  it('takes the drawn ones first, the nearest first, up to `most`', () => {
    const hidden = flower(0, 0.5, true);
    const near = flower(0, 1);
    const far = flower(0, 3);
    assert.deepEqual(closingsDue([far, hidden, near], 1, 2), [near, far]);
    assert.deepEqual(closingsDue([far, hidden, near], 1), [near, far, hidden]);
  });
});
