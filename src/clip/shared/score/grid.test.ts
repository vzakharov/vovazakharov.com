import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BAR,
  barAt,
  barTime,
  BEAT,
  beatAt,
  beatTime,
  GRID,
  pulse,
  sinceBeat,
} from './grid';

const near = (actual: number, expected: number) => {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${String(actual)} is not ${String(expected)}`,
  );
};

describe('the beat grid', () => {
  it('places beat 0 at the first beat and spaces beats by the tempo', () => {
    near(beatTime(0), GRID.firstBeat);
    near(beatTime(4) - beatTime(3), 60 / GRID.bpm);
    near(BAR, 4 * BEAT);
  });

  it('reads a beat back off its own time, fraction included', () => {
    near(beatAt(beatTime(37)), 37);
    near(beatAt(beatTime(10) + BEAT / 2), 10.5);
  });

  it('opens bar 0 on the downbeat and reads bars back', () => {
    near(barTime(0), beatTime(GRID.downbeat));
    near(barAt(barTime(13)), 13);
    near(barTime(1) - barTime(0), BAR);
  });

  it('runs on before the first beat', () => {
    assert.ok(beatAt(0) < 0);
  });
});

describe('sinceBeat', () => {
  it('is 0 on a beat, even one computed a rounding error short', () => {
    assert.equal(sinceBeat(beatTime(55)), 0);
    near(sinceBeat(beatTime(55) - 1e-12), 0);
  });

  it('counts up through the beat and starts over on the next', () => {
    near(sinceBeat(beatTime(8) + 0.1), 0.1);
    near(sinceBeat(beatTime(9) + 0.05), 0.05);
  });
});

describe('pulse', () => {
  it('is 1 on the beat and 1/e one decay after it', () => {
    near(pulse(beatTime(20)), 1);
    near(pulse(beatTime(20) + 0.2, 0.2), Math.exp(-1));
  });

  it('falls through the beat', () => {
    assert.ok(pulse(beatTime(20) + 0.1) > pulse(beatTime(20) + 0.3));
  });
});
