import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstFlight, flightAway } from './flight';
import { evicted } from './insects';

const PERCHES = {
  caps: ['mushroom-1', 'mushroom-2'],
  flowers: ['flower-1'],
  air: [],
  crowded: [],
  spotted: [],
  room: [],
  seededFlowers: 0,
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
