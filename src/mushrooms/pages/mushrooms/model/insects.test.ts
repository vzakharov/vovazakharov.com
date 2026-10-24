import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstFlight, flightAway } from './flight';
import { INSECT_KINDS, type InsectKind } from './insect-genes';
import {
  caughtAloft,
  evicted,
  isShying,
  released,
  startled,
  type Swarm,
  ticked,
} from './insects';

const PERCHES = {
  caps: ['mushroom-1', 'mushroom-2'],
  flowers: ['flower-1'],
  air: [],
  crowded: [],
  spotted: [],
  room: [],
};
/** Two kinds, as the meadow will hold once a second one flies. */
const LIMITS = { butterfly: 2, fly: 3 } as const;
type Kind = keyof typeof LIMITS;

function flier(kind: Kind, seed: number) {
  return { kind, seed, ...firstFlight({ seed, kind }, PERCHES, 0) };
}

describe('evicted', () => {
  it('sends away nothing below the kind’s limit', () => {
    const meadow = [flier('butterfly', 1), flier('fly', 2), flier('fly', 3)];
    assert.equal(evicted(meadow, 'butterfly', LIMITS), undefined);
    assert.equal(evicted(meadow, 'fly', LIMITS), undefined);
  });

  it('at one kind’s limit picks its oldest, never the other kind', () => {
    const meadow = [
      flier('fly', 1),
      flier('butterfly', 2),
      flier('fly', 3),
      flier('butterfly', 4),
    ];
    assert.equal(evicted(meadow, 'butterfly', LIMITS), meadow[1]);
    assert.equal(evicted(meadow, 'fly', LIMITS), undefined);
  });

  it('skips one already leaving', () => {
    const [first, ...rest] = [
      flier('butterfly', 1),
      flier('butterfly', 2),
      flier('butterfly', 3),
    ];
    const leaving = { ...first, ...flightAway(first, 10) };
    const meadow = [leaving, ...rest];
    assert.equal(evicted(meadow, 'butterfly', LIMITS), rest[0]);
  });
});

const SIGHT = { ...PERCHES, flowers: ['flower-1', 'flower-2', 'flower-3'] };

/** A swarm of one `kind` released at 0, and its flier. */
function swarmOf(kind: InsectKind, seed = 7) {
  const empty: Swarm = { insects: [], planted: [] };
  const swarm = released(empty, { id: `${kind}-1`, seed, kind }, SIGHT, 0);
  const [one] = swarm.insects;
  assert.ok(one);
  return { swarm, one };
}

describe('startled', () => {
  it('shies one caught in flight onto a leg from now, darting on it alone', () => {
    for (const kind of INSECT_KINDS) {
      const { swarm, one } = swarmOf(kind);
      const now = (one.leg.departs + one.leg.arrives) / 2;
      assert.ok(caughtAloft(one, now));
      const [shy] = startled(swarm, one.id, SIGHT, now).insects;
      assert.ok(shy);
      assert.equal(shy.leg.departs, now);
      assert.equal(shy.legs, one.legs + 1);
      assert.notDeepEqual(shy.leg.to, one.leg.to);
      assert.ok(isShying(shy));
      const after = ticked({ ...swarm, insects: [shy] }, SIGHT, shy.leg.leaves);
      const [next] = after.insects;
      assert.ok(next);
      assert.equal(next.legs, shy.legs + 1);
      assert.equal(isShying(next), false);
    }
  });

  it('takes one at rest off without a dart', () => {
    const { swarm, one } = swarmOf('butterfly');
    const now = one.leg.arrives + 1;
    assert.equal(caughtAloft(one, now), false);
    const [off] = startled(swarm, one.id, SIGHT, now).insects;
    assert.ok(off);
    assert.equal(off.leg.departs, now);
    assert.equal(isShying(off), false);
  });

  it('leaves one flying away, or none by that id, as it was', () => {
    const { swarm, one } = swarmOf('fly');
    const leaving = { ...one, ...flightAway(one, 10) };
    const away = { ...swarm, insects: [leaving] };
    assert.equal(caughtAloft(leaving, 20), false);
    assert.equal(startled(away, one.id, SIGHT, 20), away);
    assert.equal(startled(swarm, 'fly-9', SIGHT, 20), swarm);
  });

  it('draws a shy leg off the flier’s own stream, the same every time', () => {
    const { swarm, one } = swarmOf('bee', 11);
    const now = one.leg.departs + 100;
    assert.deepEqual(
      startled(swarm, one.id, SIGHT, now),
      startled(swarm, one.id, SIGHT, now),
    );
  });
});
