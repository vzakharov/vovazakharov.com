import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  nextLevel,
  type Pace,
  paced,
  pixelRatio,
  QUALITIES,
  UNPACED,
} from './quality';

describe('pixelRatio', () => {
  it('draws at the screen ratio at high', () => {
    assert.equal(pixelRatio('high', 2), 2);
  });

  it('draws three quarters and a half of it at medium and low', () => {
    assert.equal(pixelRatio('medium', 2), 1.5);
    assert.equal(pixelRatio('low', 2), 1);
  });
});

describe('nextLevel', () => {
  it('cycles high, medium, low and back', () => {
    assert.deepEqual(
      QUALITIES.map((level) => nextLevel(level)),
      ['medium', 'low', 'high'],
    );
  });
});

/** `count` frames `gap` ms apart from `from`, drawing the outside or not. */
type Run = { from: number; gap: number; count: number; indoors?: boolean };

const run = (pace: Pace, { from, gap, count, indoors = false }: Run): Pace => {
  let next = pace;
  for (let k = 0; k < count; k += 1) {
    next = paced(next, from + k * gap, !indoors);
  }
  return next;
};

describe('paced', () => {
  it('reads 60 frames a second as not slow', () => {
    const pace = run(UNPACED, { from: 0, gap: 1000 / 60, count: 200 });
    assert.equal(pace.slow, false);
  });

  it('reads 30 frames a second as slow once two seconds have passed', () => {
    const early = run(UNPACED, { from: 0, gap: 1000 / 30, count: 30 });
    assert.equal(early.slow, false);
    const late = run(early, { from: 1000, gap: 1000 / 30, count: 40 });
    assert.equal(late.slow, true);
  });

  it('gives a new verdict each window', () => {
    const slow = run(UNPACED, { from: 0, gap: 1000 / 30, count: 80 });
    assert.equal(slow.slow, true);
    const fast = run(slow, { from: 2700, gap: 1000 / 60, count: 300 });
    assert.equal(fast.slow, false);
  });

  it('counts no gap that frames inside break', () => {
    const slow = run(UNPACED, { from: 0, gap: 1000 / 30, count: 80 });
    const inside = run(slow, {
      from: 3000,
      gap: 100,
      count: 50,
      indoors: true,
    });
    assert.deepEqual(inside, { ...slow, last: null });
    const back = paced(inside, 9000, true);
    assert.equal(back.frames, slow.frames);
  });

  it('counts a pause, a hidden tab, as no frame', () => {
    const fast = run(UNPACED, { from: 0, gap: 1000 / 60, count: 60 });
    const after = paced(fast, 60_000, true);
    assert.equal(after.frames, fast.frames);
    assert.equal(after.spent, fast.spent);
  });
});
