import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pulse } from './pulse';
import { beatSeconds, type Section } from './sections';

const near = (actual: number, expected: number) => {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${String(actual)} ≠ ${String(expected)}`,
  );
};

/** 120 BPM: a beat of 0.5 s, a bar of 2 s, the grid's bar lines on the even seconds. */
const at120 = { bpm: 120, downbeat: 0 };
const SECTIONS_HERE: readonly Section[] = [
  { name: 'a', feel: 'straight', from: 0, to: 4, ...at120 },
  { name: 'b', feel: 'half', from: 4, to: 8, ...at120 },
  { name: 'c', feel: 'quarter', from: 8, to: 12, ...at120 },
  { name: 'd', feel: 'breakdown', from: 12, to: 16, ...at120 },
];
const HITS = [1, 12.5, 13, 14.5];

const pulseHere = (t: number) => pulse(t, SECTIONS_HERE, HITS);

describe('pulse', () => {
  it('beats once a beat in straight time, counted from the section', () => {
    const { index, fraction, seconds } = pulseHere(1.25);
    assert.equal(index, 2);
    near(fraction, 0.5);
    near(seconds, beatSeconds(at120));
  });

  it('beats every two beats in half time, every bar in quarter time', () => {
    assert.equal(pulseHere(5.1).index, 1);
    near(pulseHere(5.1).seconds, 1);
    assert.equal(pulseHere(10.5).index, 1);
    near(pulseHere(10.5).seconds, 2);
  });

  it('opens a pulse exactly on its own start', () => {
    const { index, fraction } = pulseHere(4 + 0.5 * 2);
    assert.equal(index, 1);
    assert.equal(fraction, 0);
  });

  it('beats on each hit inside a breakdown, from its start', () => {
    assert.equal(pulseHere(12.2).index, 0);
    near(pulseHere(12.2).seconds, 0.5);
    assert.equal(pulseHere(13.5).index, 2);
    near(pulseHere(13.5).fraction, 0.5 / 1.5);
    near(pulseHere(15).seconds, 1.5);
  });

  it('keeps its fraction in [0, 1]', () => {
    for (let t = -1; t < 17; t += 0.07) {
      const { fraction } = pulseHere(t);
      assert.ok(fraction >= 0 && fraction <= 1, String(t));
    }
  });

  it('reads the song by default', () => {
    assert.ok(pulse(50).seconds > 0);
  });
});
