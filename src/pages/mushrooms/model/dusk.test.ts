import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUSK_MS, duskness, dusky, FULL_DAY, FULL_DUSK, turned } from './dusk';

const START = 5000;

describe('duskness', () => {
  it('holds full day and full dusk at any moment', () => {
    for (const now of [0, START, START * 100]) {
      assert.equal(duskness(FULL_DAY, now), 0);
      assert.equal(duskness(FULL_DUSK, now), 1);
    }
  });

  it('eases from day to dusk over DUSK_MS, rising all the way', () => {
    const dusk = turned(FULL_DAY, START);
    assert.equal(duskness(dusk, START), 0);
    let last = 0;
    for (let ms = 250; ms < DUSK_MS; ms += 250) {
      const level = duskness(dusk, START + ms);
      assert.ok(level > last && level < 1, `${ms} ms: ${level}`);
      last = level;
    }
    assert.equal(duskness(dusk, START + DUSK_MS), 1);
    assert.equal(duskness(dusk, START + DUSK_MS * 3), 1);
  });

  it('turns back from where it stood midway, without a jump', () => {
    const dusk = turned(FULL_DAY, START);
    const midway = START + DUSK_MS / 2;
    const level = duskness(dusk, midway);
    const day = turned(dusk, midway);
    assert.equal(day.toward, 'day');
    assert.equal(duskness(day, midway), level);
    assert.ok(duskness(day, midway + 100) < level);
    // Half the way back takes half the time.
    assert.equal(duskness(day, midway + level * DUSK_MS), 0);
  });

  it('turns dusk back to day', () => {
    const day = turned(FULL_DUSK, START);
    assert.equal(duskness(day, START), 1);
    assert.equal(duskness(day, START + DUSK_MS), 0);
  });
});

describe('dusky', () => {
  it('is dusky only past half way', () => {
    const dusk = turned(FULL_DAY, START);
    assert.equal(dusky(FULL_DAY, START), false);
    assert.equal(dusky(dusk, START + DUSK_MS * 0.25), false);
    assert.equal(dusky(dusk, START + DUSK_MS * 0.75), true);
    assert.equal(dusky(FULL_DUSK, START), true);
  });
});
