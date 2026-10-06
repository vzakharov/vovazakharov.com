import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tappedFirefly } from './firefly-tap';
import type { TapTarget } from './insect-tap';

/** Two fireflies near each other, their reaches overlapping, the first drawn under the second. */
const PAIR: readonly TapTarget[] = [
  { id: '0', x: 100, y: 100, r: 32 },
  { id: '1', x: 130, y: 100, r: 32 },
];

const bare = () => false;
const covered = () => true;

describe('a tap among fireflies', () => {
  it('takes a tap within a reach where nothing else answers', () => {
    assert.equal(tappedFirefly({ x: 75, y: 100 }, PAIR, bare), '0');
    assert.equal(tappedFirefly({ x: 130, y: 128 }, PAIR, bare), '1');
  });

  it('yields every tap, even on its body, to whatever else answers it', () => {
    assert.equal(tappedFirefly({ x: 100, y: 100 }, PAIR, covered), undefined);
    assert.equal(tappedFirefly({ x: 75, y: 100 }, PAIR, covered), undefined);
  });

  it('hands a tap to the nearer, not the one drawn on top', () => {
    assert.equal(tappedFirefly({ x: 112, y: 100 }, PAIR, bare), '0');
    assert.equal(tappedFirefly({ x: 118, y: 100 }, PAIR, bare), '1');
  });

  it('asks what else is under the finger only within a reach', () => {
    let asked = 0;
    const counting = () => {
      asked += 1;
      return false;
    };
    tappedFirefly({ x: 300, y: 300 }, PAIR, counting);
    assert.equal(asked, 0);
    tappedFirefly({ x: 75, y: 100 }, PAIR, counting);
    assert.equal(asked, 1);
  });

  it('takes no tap beyond every reach', () => {
    assert.equal(tappedFirefly({ x: 200, y: 100 }, PAIR, bare), undefined);
  });
});
