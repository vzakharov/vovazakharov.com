import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { planted } from '@/cube/entities/world';

import { FIRST_LOOK, gazeOf, glimpse, type Look, looks, spanOf } from './look';
import { SHRINK_TIME } from './shrink';

const lookOf = looks(planted.seed);

/** The looks of a hundred rooms of floor `n`. */
const sample = (n: number): Look[] =>
  Array.from({ length: 100 }, (_, index) =>
    lookOf({ n, x: BigInt(index % 10), y: BigInt(Math.floor(index / 10)) }),
  );

describe('looks', () => {
  it('gives every room of floor 1 the first look, hands and all', () => {
    assert.equal(lookOf({ n: 1, x: 0n, y: 0n }), FIRST_LOOK);
    assert.equal(FIRST_LOOK.moment, 'first-shrink');
    assert.ok(FIRST_LOOK.hands > 0 && FIRST_LOOK.glance > 0 && FIRST_LOOK.turn);
    assert.ok(spanOf(FIRST_LOOK) > SHRINK_TIME);
  });

  it('rolls a deeper room a shorter look of its own, the same each time', () => {
    const rolled = sample(7);
    assert.deepEqual(rolled, sample(7));
    assert.notDeepEqual(rolled, sample(8));
    for (const look of rolled) {
      assert.equal(look.moment, 'shrink');
      assert.ok(spanOf(look) < spanOf(FIRST_LOOK));
      assert.ok(look.sayAt < SHRINK_TIME);
    }
    const count = (test: (look: Look) => boolean) =>
      rolled.filter((look) => test(look)).length;
    for (const some of [
      count(({ hands }) => hands > 0),
      count(({ glance }) => glance > 0),
      count(({ turn }) => turn),
      count(({ side }) => side === 1),
      count((look) => spanOf(look) === 0),
    ]) {
      assert.ok(some > 10 && some < 90, `${some} of 100`);
    }
  });
});

/** Floor 1's look `t` seconds in. */
const at = (t: number) => glimpse(FIRST_LOOK, t);

describe('glimpse', () => {
  const all: Look[] = [FIRST_LOOK, ...sample(5)];

  it('starts and ends on the resting gaze with the hands down', () => {
    for (const look of all) {
      for (const t of [0, spanOf(look), spanOf(look) + 1]) {
        const seen = glimpse(look, t);
        assert.ok(Math.abs(seen.aside) < 1e-12);
        assert.equal(seen.toHands, 0);
        assert.equal(seen.handsUp, 0);
        assert.deepEqual(gazeOf({ ...seen, aside: 0 }, 1.5, -0.2), {
          yaw: 1.5,
          elevation: -0.2,
        });
      }
    }
  });

  it('moves smoothly: no jump between frames', () => {
    for (const look of all) {
      let last = glimpse(look, 0);
      for (let t = 0; t <= spanOf(look) + 0.1; t += 1 / 60) {
        const seen = glimpse(look, t);
        for (const part of ['aside', 'toHands', 'handsUp', 'turned'] as const) {
          assert.ok(Math.abs(seen[part] - last[part]) < 0.1, part);
          assert.ok(Number.isFinite(seen[part]));
        }
        assert.ok(seen.toHands >= 0 && seen.toHands <= 1);
        assert.ok(seen.handsUp >= 0 && seen.handsUp <= 1);
        last = seen;
      }
    }
  });

  it('looks down at the hands, raises and turns them, then to both sides', () => {
    assert.equal(at(1.8).toHands, 1);
    assert.equal(at(1.8).handsUp, 1);
    assert.equal(at(1.8).turned, 0);
    assert.equal(at(2.9).turned, 1);
    assert.ok(gazeOf(at(1.8), 0, 0.3).elevation < -0.9);
    const yaws = Array.from(
      { length: 100 },
      (_, i) => at(3.7 + i * 0.015).aside,
    );
    assert.ok(Math.min(...yaws) < -0.7 && Math.max(...yaws) > 0.7);
    assert.ok(yaws.findIndex((y) => y < -0.7) < yaws.findIndex((y) => y > 0.7));
  });
});
