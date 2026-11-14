import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { repeatsOf, stampOf, UNREPEATED } from './slowdown';

describe('repeatsOf', () => {
  it('encodes a frame once with no slowdown', () => {
    assert.deepEqual(repeatsOf(1), [UNREPEATED]);
  });

  it('puts the part first, then the whole encodings', () => {
    assert.deepEqual(repeatsOf(2.25), [
      { coverage: 0.25, first: true, last: false },
      { coverage: 1, first: false, last: false },
      { coverage: 1, first: false, last: true },
    ]);
  });

  it('adds no part for a whole number', () => {
    assert.equal(repeatsOf(4).length, 4);
    assert.ok(repeatsOf(4).every(({ coverage }) => coverage === 1));
  });
});

describe('stampOf', () => {
  // A stand-in: stampOf only hands the query set on.
  const querySet: GPUQuerySet = {
    __brand: 'GPUQuerySet',
    label: '',
    type: 'timestamp',
    count: 2,
    destroy: () => {
      throw new Error('A stand-in holds no queries to destroy');
    },
  };
  const stamp = {
    querySet,
    beginningOfPassWriteIndex: 0,
    endOfPassWriteIndex: 1,
  };

  it('keeps the whole stamp on a single encoding', () => {
    assert.equal(stampOf(stamp, UNREPEATED), stamp);
  });

  it('splits the start and end across the first and last', () => {
    const [first, middle, last] = repeatsOf(3);
    assert.ok(first && middle && last);
    assert.deepEqual(stampOf(stamp, first), {
      querySet,
      beginningOfPassWriteIndex: 0,
    });
    assert.equal(stampOf(stamp, middle), undefined);
    assert.deepEqual(stampOf(stamp, last), {
      querySet,
      endOfPassWriteIndex: 1,
    });
  });
});
