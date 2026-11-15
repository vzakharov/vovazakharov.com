import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { R } from '@/island/shared/globe';

import { cloudClockAt } from './clouds';

describe('cloudClockAt', () => {
  it('stands still at the clock`s start', () => {
    assert.deepEqual(cloudClockAt(0), { drift: 0, growth: 0 });
  });

  it('drifts ten metres a second along the equator', () => {
    const { drift } = cloudClockAt(600);
    assert.ok(Math.abs(drift * R - 6000) < 1e-3);
  });

  it('comes round after the field`s own day, with no step back', () => {
    const turn = (2 * Math.PI * R) / 10;
    const before = cloudClockAt(turn - 1);
    assert.ok(before.drift < 2 * Math.PI && before.drift > 6.28);
    assert.ok(cloudClockAt(turn + 5).drift < 1e-5);
    assert.ok(cloudClockAt(-5).drift > 6.28);
  });
});
