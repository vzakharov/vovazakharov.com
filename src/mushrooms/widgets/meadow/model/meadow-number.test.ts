import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowHash, meadowNumber } from './meadow-number';

describe('meadowNumber', () => {
  it('opens a kept meadow its number names', () => {
    assert.deepEqual(meadowNumber('#2', [1, 2, 3]), {
      number: 2,
      fresh: false,
    });
  });

  it('opens a fresh meadow under a number none is kept as', () => {
    assert.deepEqual(meadowNumber('#7', [1, 2]), { number: 7, fresh: true });
    assert.deepEqual(meadowNumber('#1', []), { number: 1, fresh: true });
  });

  it('opens a fresh meadow past the highest for #new', () => {
    assert.deepEqual(meadowNumber('#new', [3, 1]), { number: 4, fresh: true });
    assert.deepEqual(meadowNumber('#new', []), { number: 1, fresh: true });
  });

  it('reopens the highest kept for any other hash', () => {
    for (const hash of ['', '#', '#0', '#abc', '#-2', '#1.5', '#01', '#NEW']) {
      assert.deepEqual(meadowNumber(hash, [2, 5, 3]), {
        number: 5,
        fresh: false,
      });
    }
  });

  it('opens a fresh 1 for any other hash when none is kept', () => {
    for (const hash of ['', '#', '#0', '#abc', '#99999999999999999999']) {
      assert.deepEqual(meadowNumber(hash, []), { number: 1, fresh: true });
    }
  });
});

describe('meadowHash', () => {
  it('names a meadow as meadowNumber reads it back', () => {
    for (const number of [1, 4, 120]) {
      assert.equal(meadowHash(number), `#${String(number)}`);
      assert.deepEqual(meadowNumber(meadowHash(number), [number]), {
        number,
        fresh: false,
      });
    }
  });
});
