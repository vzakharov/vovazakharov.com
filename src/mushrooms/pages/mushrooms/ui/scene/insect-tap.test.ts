import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tappedInsect, type TapTarget } from './insect-tap';

/** Two fliers crossing, their reaches overlapping, the fly drawn under the bee. */
const CROSSING: readonly TapTarget[] = [
  { id: 'fly', x: 100, y: 100, r: 32 },
  { id: 'bee', x: 130, y: 100, r: 32 },
];

describe('a tap on insects', () => {
  it('reaches the body nearest the finger, not the one drawn on top', () => {
    assert.equal(tappedInsect({ x: 104, y: 98 }, CROSSING), 'fly');
    assert.equal(tappedInsect({ x: 126, y: 102 }, CROSSING), 'bee');
  });

  it('reaches an insect under another wherever it is nearer', () => {
    // Every point along the line between the two bodies goes to the nearer.
    for (let x = 100; x <= 130; x += 1) {
      assert.equal(
        tappedInsect({ x, y: 100 }, CROSSING),
        x < 115 ? 'fly' : 'bee',
        `at x = ${String(x)}`,
      );
    }
  });

  it('never reaches a body nearer the finger whose reach does not hold it', () => {
    const small: readonly TapTarget[] = [
      { id: 'far', x: 0, y: 0, r: 60 },
      { id: 'near', x: 40, y: 0, r: 10 },
    ];
    assert.equal(tappedInsect({ x: 25, y: 0 }, small), 'far');
  });

  it('gives a tie to the one on top', () => {
    assert.equal(tappedInsect({ x: 115, y: 100 }, CROSSING), 'bee');
  });

  it('reaches nothing outside every reach', () => {
    assert.equal(tappedInsect({ x: 300, y: 300 }, CROSSING), undefined);
    assert.equal(tappedInsect({ x: 0, y: 0 }, []), undefined);
  });
});
