import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CubeCell } from '@/island/shared/globe';
import { cubeTileId } from '@/island/entities/terrain';

import { STAND_IN_DEPTH, standInsOf } from './tile-cover';

const key = (level: number, x: number, y: number): CubeCell => ({
  face: 'nx',
  level,
  x,
  y,
});

const parent = ({ face, level, x, y }: CubeCell): CubeCell => ({
  face,
  level: level - 1,
  x: Math.floor(x / 2),
  y: Math.floor(y / 2),
});

describe('standInsOf', () => {
  it('holds each selected tile’s ancestor STAND_IN_DEPTH levels up, once', () => {
    const selected = [key(10, 800, 333), key(10, 807, 335), key(11, 1602, 667)];
    const ids = standInsOf(selected).map((tile) => cubeTileId(tile));
    assert.deepEqual(ids, [
      cubeTileId(key(10 - STAND_IN_DEPTH, 100, 41)),
      cubeTileId(key(11 - STAND_IN_DEPTH, 200, 83)),
    ]);
  });

  it('leaves out ancestors at or above the always-held roots', () => {
    assert.deepEqual(
      standInsOf([key(5, 3, 1), key(4, 1, 1), key(2, 0, 0)]),
      [],
    );
    assert.equal(standInsOf([key(6, 63, 2)]).length, 1);
  });

  it('gives the tile’s parent’s parent’s parent', () => {
    for (const tile of [key(9, 511, 0), key(14, 12_345, 6789)]) {
      assert.deepEqual(standInsOf([tile]), [parent(parent(parent(tile)))]);
    }
  });
});
