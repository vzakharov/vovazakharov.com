import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { punch, sinceHit } from './hits';
import { KICKS } from './kick-data';
import { sectionAt } from './sections';

const HITS = [1, 2, 4];

describe('sinceHit', () => {
  it('counts from the latest hit at or before the time', () => {
    assert.equal(sinceHit(HITS, 1), 0);
    assert.equal(sinceHit(HITS, 3.5), 1.5);
    assert.equal(sinceHit(HITS, 10), 6);
  });

  it('is Infinity before the first hit', () => {
    assert.equal(sinceHit(HITS, 0.5), Infinity);
    assert.equal(sinceHit([], 3), Infinity);
  });
});

describe('punch', () => {
  it('is 1 on a hit, 1/e a decay later, 0 before the first', () => {
    assert.equal(punch(HITS, 2), 1);
    assert.ok(Math.abs(punch(HITS, 2.2, 0.2) - Math.exp(-1)) < 1e-12);
    assert.equal(punch(HITS, 0), 0);
  });
});

describe('KICKS', () => {
  it('are sorted', () => {
    for (const [n, kick] of KICKS.entries()) {
      const next = KICKS[n + 1];
      if (next !== undefined) assert.ok(next > kick, String(next));
    }
  });

  it('land four to the bar in the verse’s first half', () => {
    const verse = sectionAt(32);
    assert.equal(verse.feel, 'four-on-floor');
    const bars = (verse.to - verse.from) / ((60 / verse.bpm) * 4);
    const count = KICKS.filter((t) => t >= verse.from && t < verse.to).length;
    assert.ok(Math.abs(count / bars - 4) < 0.6, String(count / bars));
  });
});
