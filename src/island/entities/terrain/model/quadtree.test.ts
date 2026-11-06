import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { planeToWorld } from '@/island/shared/globe';

import { selectTiles } from './quadtree';
import { MAX_LEVEL, tileId, type TileKey, tileRect } from './tile';

/** Each tile and every same-level edge neighbour's covering tile. */
function assertBalanced(tiles: TileKey[]) {
  const ids = new Map(tiles.map((key) => [tileId(key), key]));
  for (const key of tiles) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      for (let up = key.level; up >= 0; up--) {
        const shift = key.level - up;
        const coarse = ids.get(
          tileId({
            level: up,
            x: (key.x + dx) >> shift,
            y: (key.y + dy) >> shift,
          }),
        );
        if (coarse) {
          assert.ok(
            key.level - coarse.level <= 1,
            `${tileId(key)} beside ${tileId(coarse)}`,
          );
          break;
        }
      }
    }
  }
}

/** No two tiles overlap: none is an ancestor of another. */
function assertDisjoint(tiles: TileKey[]) {
  const ids = new Set(tiles.map((key) => tileId(key)));
  for (const key of tiles) {
    for (let up = key.level - 1; up >= 0; up--) {
      const shift = key.level - up;
      assert.ok(
        !ids.has(tileId({ level: up, x: key.x >> shift, y: key.y >> shift })),
      );
    }
  }
}

const HEIGHTS = [
  ['orbit', 20_000_000],
  ['1 000 km', 1_000_000],
  ['10 km', 10_000],
  ['100 m', 100],
  ['2 m', 2],
] as const;

describe('selectTiles', () => {
  it('draws a handful of coarse tiles from orbit', () => {
    const tiles = selectTiles(planeToWorld(0, 0, 20_000_000));
    assert.ok(tiles.length <= 16, `${tiles.length}`);
    assert.ok(tiles.every((key) => key.level <= 2));
  });

  for (const [name, height] of HEIGHTS) {
    for (const [x, y] of [
      [0, 0],
      [1_234_567, -765_432],
    ] as const) {
      it(`stays bounded, balanced and disjoint at ${name} over (${x}, ${y})`, () => {
        const tiles = selectTiles(planeToWorld(x, y, height));
        assert.ok(tiles.length > 0 && tiles.length <= 400, `${tiles.length}`);
        assertBalanced(tiles);
        assertDisjoint(tiles);
      });
    }
  }

  it('goes to the deepest level under the eye at 2 m and stays coarse far off', () => {
    const tiles = selectTiles(planeToWorld(0, 0, 2));
    const under = tiles.filter((key) => {
      const { west, south, east, north } = tileRect(key);
      return west <= 0 && east >= 0 && south <= 0 && north >= 0;
    });
    assert.ok(under.length > 0);
    assert.ok(under.every((key) => key.level === MAX_LEVEL));
    assert.ok(Math.min(...tiles.map((key) => key.level)) <= 7);
  });

  it('drops tiles past the horizon', () => {
    const tiles = selectTiles(planeToWorld(0, 0, 2));
    for (const key of tiles) {
      const { west, south, east, north } = tileRect(key);
      const near = Math.hypot(
        Math.max(west, 0, -east),
        Math.max(south, 0, -north),
      );
      assert.ok(near < 400_000, `${tileId(key)} at ${near} m`);
    }
  });

  it('orders by level, then y, then x, the same every time', () => {
    const eye = planeToWorld(321_000, 45_000, 500);
    const tiles = selectTiles(eye);
    assert.deepEqual(selectTiles(eye), tiles);
    for (const [i, b] of tiles.entries()) {
      const a = tiles[i - 1];
      if (a) assert.ok((a.level - b.level || a.y - b.y || a.x - b.x) < 0);
    }
  });

  it('draws nothing from the far side of the planet', () => {
    const [x, y, z] = planeToWorld(0, 0, 100);
    assert.deepEqual(selectTiles([-x, -y, -z]), []);
  });
});
