import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tileId, type TileKey } from '@/island/entities/terrain';

import { coverOf, distanceTo, nearestFirst } from './tile-cover';

const key = (level: number, x: number, y: number): TileKey => ({ level, x, y });
const ids = (keys: readonly TileKey[]) => keys.map((k) => tileId(k)).toSorted();
const holding =
  (...keys: TileKey[]) =>
  (id: string) =>
    keys.some((k) => tileId(k) === id);

describe('coverOf', () => {
  const selected = [key(4, 0, 0), key(4, 1, 0), key(4, 0, 1), key(4, 1, 1)];

  it('draws a selection fully in hand as it is', () => {
    assert.deepEqual(ids(coverOf(selected, holding(...selected))), ids(selected));
  });

  it('covers missing children by their parent, which hides the loaded ones', () => {
    const has = holding(key(3, 0, 0), key(4, 0, 0), key(4, 1, 0));
    assert.deepEqual(ids(coverOf(selected, has)), ['3/0/0']);
  });

  it('reaches past a missing parent to the nearest ancestor in hand', () => {
    const deep = [key(6, 5, 5), key(4, 2, 2)];
    assert.deepEqual(ids(coverOf(deep, holding(key(3, 0, 0), key(3, 1, 1)))), [
      '3/0/0',
      '3/1/1',
    ]);
  });

  it('keeps one stand-in when two nest', () => {
    const has = holding(key(3, 0, 0), key(5, 0, 0));
    assert.deepEqual(ids(coverOf([key(6, 0, 0), key(6, 3, 3)], has)), [
      '3/0/0',
    ]);
  });

  it('leaves out a tile with nothing above it in hand', () => {
    assert.deepEqual(coverOf([key(4, 0, 0)], holding()), []);
  });
});

describe('nearestFirst', () => {
  it('orders by distance to the tile, then coarser first', () => {
    const [far, near, inside, around] = [
      key(3, 7, 7),
      key(3, 4, 3),
      key(4, 8, 8),
      key(3, 4, 4),
    ];
    assert.deepEqual(
      nearestFirst([far, near, inside, around], 1, 1).map((k) => tileId(k)),
      ['3/4/4', '4/8/8', '3/4/3', '3/7/7'],
    );
    assert.equal(distanceTo(around, 1, 1), 0);
  });
});
