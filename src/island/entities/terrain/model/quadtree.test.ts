import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Coast,
  dot,
  planeToWorld,
  scaled,
  sub,
  unit,
} from '@/island/shared/globe';

import { buildCoastField } from './coast-field';
import { selectTiles } from './quadtree';
import { MAX_LEVEL, tileId, type TileKey, tileRect } from './tile';
import { frustumOf } from './view';

const flat = () => 0;
const holds = (key: TileKey, x: number, y: number) => {
  const { west, south, east, north } = tileRect(key);
  return west <= x && x <= east && south <= y && y <= north;
};

/** A disc of radius 1 000 km around the centre, in plane metres. */
const DISC_RADIUS = 1_000_000;
const DISC: Coast = {
  kmPerPixel: 4,
  rings: [
    Array.from({ length: 720 }, (_, k): [number, number] => {
      const angle = (2 * Math.PI * k) / 720;
      return [1000 * Math.cos(angle), 1000 * Math.sin(angle)];
    }),
  ],
};

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
    assert.ok(tiles.length <= 64, `${tiles.length}`);
    assert.ok(tiles.every((key) => key.level <= 3));
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

  it('splits finer astride a coast, and not inland', () => {
    const coast = buildCoastField(DISC);
    const eye = planeToWorld(0, 0, 1_000_000);
    const plain = selectTiles(eye);
    const tiles = selectTiles(eye, { coast });
    assert.ok(tiles.length <= 500, `${tiles.length}`);
    assertBalanced(tiles);
    assertDisjoint(tiles);
    const shore = (key: TileKey) => {
      const { west, south, east, north } = tileRect(key);
      const corners = [
        [west, south],
        [east, south],
        [west, north],
        [east, north],
      ] as const;
      const radii = corners.map(([x, y]) => Math.hypot(x, y));
      return (
        Math.min(...radii) < DISC_RADIUS && Math.max(...radii) > DISC_RADIUS
      );
    };
    const levels = (keys: TileKey[]) =>
      keys.filter((key) => shore(key)).map((key) => key.level);
    assert.ok(Math.min(...levels(tiles)) > Math.min(...levels(plain)));
    assert.ok(Math.max(...levels(tiles)) > Math.max(...levels(plain)));
    const inland = (keys: TileKey[]) =>
      keys.filter((key) => {
        const { west, east, south, north } = tileRect(key);
        return (
          Math.max(Math.abs(west), Math.abs(east)) < DISC_RADIUS / 3 &&
          Math.max(Math.abs(south), Math.abs(north)) < DISC_RADIUS / 3
        );
      });
    assert.deepEqual(inland(tiles), inland(plain));
  });

  describe('in a view', () => {
    const eye = planeToWorld(0, 0, 100);
    const up = unit(eye);
    const north = planeToWorld(0, 1000, 100);
    const ahead = sub(north, eye);
    const forward = unit(sub(ahead, scaled(up, dot(ahead, up))));
    const frustum = frustumOf(forward, up, (50 * Math.PI) / 180, 16 / 9);
    const tiles = selectTiles(eye, { frustum, ground: flat });

    it('drops the tiles behind the eye and keeps those ahead', () => {
      const all = selectTiles(eye, { ground: flat });
      assert.ok(tiles.length < all.length, `${tiles.length} of ${all.length}`);
      assert.ok(all.some((key) => tileRect(key).north < -10_000));
      for (const key of tiles) {
        assert.ok(tileRect(key).north > -10_000, tileId(key));
      }
      assert.ok(tiles.some((key) => holds(key, 0, 5000)));
      assert.ok(tiles.some((key) => holds(key, 0, 30_000)));
      assertBalanced(tiles);
      assertDisjoint(tiles);
    });

    it('drops a tile ahead past the horizon', () => {
      // From 100 m the highest ground shows over the sea's horizon to ~250 km.
      assert.ok(!tiles.some((key) => holds(key, 0, 1_000_000)));
      assert.ok(tiles.some((key) => holds(key, 0, 200_000)));
    });
  });

  it('draws nothing from the far side of the planet', () => {
    const [x, y, z] = planeToWorld(0, 0, 100);
    assert.deepEqual(selectTiles([-x, -y, -z]), []);
  });
});
