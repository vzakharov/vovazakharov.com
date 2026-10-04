import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bedClosing,
  BUD,
  CLOSING_STEPS,
  closingsDue,
  closingStep,
  folding,
  meanClosing,
  OPEN,
  petalPose,
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

describe('folding', () => {
  it('leaves an open head as it is', () => {
    assert.deepEqual(OPEN, { closing: 0, disc: 1, width: 1 });
  });

  it('hides the centre under the petals and widens them as the head closes', () => {
    const half = folding(0.5);
    const shut = folding(1);
    assert.ok(half.disc < OPEN.disc && shut.disc === 0);
    assert.ok(OPEN.width < half.width && half.width < shut.width);
    assert.equal(folding(1.4).closing, 1);
  });
});

function close(one: number, other: number): void {
  assert.ok(Math.abs(one - other) < 1e-9, `${one} ≉ ${other}`);
}

describe('petalPose', () => {
  const span = [3, 20] as const;

  it('leaves an open petal where it points, from its start out', () => {
    const [foot, angle, [, length]] = petalPose(0.7, span, 0);
    close(angle, 0.7);
    close(length, 17);
    close(Math.hypot(foot.x, foot.y), 3);
  });

  it('stands every petal of a shut head up into a bud about two-thirds the open head high', () => {
    const tips = Array.from({ length: 5 }, (_, index) => {
      const [foot, angle, [, length]] = petalPose(
        (index * Math.PI * 2) / 5,
        span,
        1,
      );
      assert.ok(Math.sin(angle) < -0.8, 'points up');
      close(foot.y, BUD.foot * 20);
      return foot.y + Math.sin(angle) * length;
    });
    for (const tip of tips) close(tip, -BUD.tip * 20);
    const height = (BUD.foot + BUD.tip) * 20;
    assert.ok(height > 0.6 * 40 && height < 0.75 * 40);
  });

  it('turns a petal the short way round', () => {
    const left = petalPose(Math.PI, span, 0.5)[1];
    assert.ok(left > Math.PI && left < (Math.PI * 3) / 2, `${left}`);
    const right = petalPose(0, span, 0.5)[1];
    assert.ok(right < 0 && right > -Math.PI / 2, `${right}`);
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
