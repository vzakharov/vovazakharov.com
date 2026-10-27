import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { INSECT_LIMITS } from '@/mushrooms/features/insects-fly/index.node-safe';

import { type Action, type Meadow, reduce } from './game';
import { FLOWERS, grow, opening, run, SIGHT } from './game.test-kit';

const release = (seed: number, now: number): Action => ({
  kind: 'release',
  insect: 'butterfly',
  seed,
  now,
  ...SIGHT,
});
const startle = (now: number, id = 'butterfly-1'): Action => ({
  kind: 'startle',
  id,
  now,
  ...SIGHT,
});
const tick = (now: number): Action => ({ kind: 'tick', now, ...SIGHT });
const flier = (meadow: Meadow, id: string) =>
  meadow.insects.find((insect) => insect.id === id);

describe('the butterflies', () => {
  it('opens with none', () => {
    assert.deepEqual(opening().insects, []);
  });

  it('flies a release in from off screen, each under a new id', () => {
    const meadow = run(opening(), [release(1, 0), release(2, 10)]);
    assert.deepEqual(
      meadow.insects.map(({ id, kind }) => [id, kind]),
      [
        ['butterfly-1', 'butterfly'],
        ['butterfly-2', 'butterfly'],
      ],
    );
    for (const { leg } of meadow.insects) {
      assert.equal(leg.from.kind, 'away');
      assert.notEqual(leg.to.kind, 'away');
    }
  });

  it('at INSECT_LIMITS.butterfly still flies one in, and sends the oldest away', () => {
    const four = run(
      opening(),
      [1, 2, 3, 4].map((seed) => release(seed, seed)),
    );
    const five = reduce(four, release(5, 100));
    assert.equal(five.insects.length, INSECT_LIMITS.butterfly + 1);
    const first = flier(five, 'butterfly-1');
    assert.ok(first);
    assert.equal(first.leg.to.kind, 'away');
    assert.equal(first.leg.departs, 100);
    const six = reduce(five, release(6, 200));
    assert.equal(flier(six, 'butterfly-1')?.leg.departs, 100);
    assert.equal(flier(six, 'butterfly-2')?.leg.to.kind, 'away');
    assert.equal(
      six.insects.filter(({ leg }) => leg.to.kind !== 'away').length,
      INSECT_LIMITS.butterfly,
    );
  });

  it('removes one flying away once it has gone', () => {
    const five = run(
      opening(),
      [1, 2, 3, 4, 5].map((seed) => release(seed, 0)),
    );
    const gone = flier(five, 'butterfly-1');
    assert.ok(gone);
    const still = reduce(five, tick(gone.leg.arrives - 1));
    assert.ok(flier(still, 'butterfly-1'));
    const after = reduce(still, tick(gone.leg.arrives));
    assert.equal(flier(after, 'butterfly-1'), undefined);
    assert.equal(after.insects.length, INSECT_LIMITS.butterfly);
  });

  it('takes the next leg once the stay is over, and not before', () => {
    const meadow = reduce(opening(), release(1, 0));
    const [butterfly] = meadow.insects;
    assert.ok(butterfly);
    const { leaves, to } = butterfly.leg;
    assert.equal(reduce(meadow, tick(leaves - 1)), meadow);
    const moved = reduce(meadow, tick(leaves));
    const [next] = moved.insects;
    assert.ok(next);
    assert.equal(next.legs, 2);
    assert.equal(next.leg.departs, leaves);
    assert.deepEqual(next.leg.from, to);
  });

  it('startles one into a leg from now, at rest or caught in the air', () => {
    const meadow = reduce(opening(), release(1, 0));
    const [butterfly] = meadow.insects;
    assert.ok(butterfly);
    const { arrives } = butterfly.leg;
    for (const now of [arrives - 1, arrives + 1]) {
      const [startled] = reduce(meadow, startle(now)).insects;
      assert.ok(startled);
      assert.equal(startled.leg.departs, now);
      assert.equal(startled.legs, 2);
    }
    assert.equal(reduce(meadow, startle(0, 'butterfly-9')), meadow);
  });

  it('flies one off a cap that is gone, at the next tick', () => {
    // Enough releases that one heads for a cap; each takes off afresh.
    const flown = run(
      opening(),
      Array.from({ length: 40 }, (_, seed) => release(seed, 0)),
    );
    const onCap = flown.insects.find(({ leg }) => leg.to.kind === 'cap');
    assert.ok(onCap);
    const target = onCap.leg.to.kind === 'cap' ? onCap.leg.to.id : '';
    const thinned = run(flown, [
      { kind: 'select', id: target },
      { kind: 'remove' },
    ]);
    assert.deepEqual(flier(thinned, onCap.id), onCap);
    const now = onCap.leg.arrives + 1;
    const ticked = reduce(thinned, tick(now));
    const moved = flier(ticked, onCap.id);
    assert.ok(moved);
    assert.equal(moved.leg.departs, now);
    assert.notDeepEqual(moved.leg.to, onCap.leg.to);
  });

  it('never sends two butterflies to one perch', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      let meadow = run(
        opening(),
        [0, 1, 2, 3].map((index) => release(seed * 10 + index, index * 500)),
      );
      for (let now = 2000; now < 60_000; now += 100) {
        meadow = reduce(meadow, tick(now));
        if (now % 7000 === 0) meadow = reduce(meadow, startle(now));
        const perches = meadow.insects
          .filter(({ leg }) => leg.to.kind !== 'away')
          .map(({ leg: { to } }) => JSON.stringify(to));
        assert.equal(new Set(perches).size, perches.length, perches.join(' '));
      }
    }
  });

  it('flies one off a flower once it is out of sight, and sends none there', () => {
    const flown = run(
      opening(),
      Array.from({ length: 4 }, (_, seed) => release(seed, 0)),
    );
    const onFlower = flown.insects.find(({ leg }) => leg.to.kind === 'flower');
    assert.ok(onFlower);
    const hidden = onFlower.leg.to.kind === 'flower' ? onFlower.leg.to.id : '';
    const now = onFlower.leg.arrives + 1;
    const sight = FLOWERS.filter((id) => id !== hidden);
    const after = reduce(flown, {
      kind: 'tick',
      now,
      flowers: sight,
      air: [],
      crowded: [],
      room: [],
    });
    const moved = flier(after, onFlower.id);
    assert.ok(moved);
    assert.equal(moved.leg.departs, now);
    for (const { leg } of after.insects) {
      assert.notDeepEqual(leg.to, { kind: 'flower', id: hidden });
    }
  });

  it('leaves the butterflies alone through the mushroom actions', () => {
    const meadow = reduce(opening(), release(1, 0));
    const after = run(meadow, [
      { kind: 'pick' },
      grow(3),
      { kind: 'house' },
      { kind: 'deselect' },
    ]);
    assert.equal(after.insects, meadow.insects);
  });
});
