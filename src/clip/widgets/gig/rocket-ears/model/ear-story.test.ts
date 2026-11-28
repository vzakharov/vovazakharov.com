import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SECTIONS, SONG_SECONDS } from '@/clip/shared/score';

import { momentAt, progressAt, STORY_SECONDS } from './ear-story';

const named = (name: string) => {
  const found = SECTIONS.find((each) => each.name === name);
  assert.ok(found, name);
  return found;
};

describe('momentAt', () => {
  it('runs the flight clock forward and holds it past either end', () => {
    let last = -Infinity;
    for (let s = 0; s <= STORY_SECONDS; s += 0.25) {
      const { flight } = momentAt(s);
      assert.ok(flight >= last, `flight steps back at ${s}`);
      last = flight;
    }
    assert.deepEqual(momentAt(-3), momentAt(0));
    assert.deepEqual(momentAt(STORY_SECONDS + 3), momentAt(STORY_SECONDS));
  });

  it('has the ears on their heads at the start and in the air at the end', () => {
    assert.ok(momentAt(0).flight < 0);
    assert.ok(momentAt(STORY_SECONDS).flight > 0);
  });
});

describe('progressAt', () => {
  it('moves on through each return and holds between them', () => {
    const double = named('double time');
    const chorus = named('chorus');
    assert.equal(progressAt(0), 0);
    assert.ok(progressAt((double.from + double.to) / 2) > 0);
    assert.equal(progressAt(double.to), progressAt(chorus.from));
    assert.ok(progressAt(chorus.to) > progressAt(chorus.from));
    assert.equal(progressAt(SONG_SECONDS), 1);
  });

  it('never goes back', () => {
    let last = 0;
    for (let t = 0; t <= SONG_SECONDS; t += 0.5) {
      const p = progressAt(t);
      assert.ok(p >= last, `progress steps back at ${t}`);
      last = p;
    }
  });
});
