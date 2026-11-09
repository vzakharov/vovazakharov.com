import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  dot,
  faceToSphere,
  planeToWorld,
  R,
  scaled,
  sub,
  unit,
  worldToPlane,
} from '@/island/shared/globe';

import {
  capGap,
  CUBE_MAX_LEVEL,
  CUBE_MIN_LEVEL,
  type CubeTileKey,
  cubeTileId,
  tileCap,
} from '../../tile';
import { selectCubeTiles } from './cube-quadtree';
import {
  arc,
  assertCubeBalanced,
  assertCubeDisjoint,
  DISC_RADIUS,
  disc,
  eyeOver,
  holds,
  PLACES,
} from './cube-quadtree.test-kit';
import { frustumOf } from './view';

const flat = () => 0;

const HEIGHTS = [
  ['orbit', 20_000_000],
  ['1 000 km', 1_000_000],
  ['10 km', 10_000],
  ['100 m', 100],
  ['2 m', 2],
] as const;

describe('selectCubeTiles', () => {
  it('draws a handful of root tiles from orbit', () => {
    const tiles = selectCubeTiles(eyeOver(CENTRE, 20_000_000));
    assert.ok(tiles.length <= 64, `${tiles.length}`);
    assert.ok(tiles.every((key) => key.level === CUBE_MIN_LEVEL));
  });

  for (const [name, height] of HEIGHTS) {
    for (const [place, direction] of PLACES) {
      it(`stays bounded, balanced and disjoint at ${name} over ${place}`, () => {
        const tiles = selectCubeTiles(eyeOver(direction, height));
        assert.ok(tiles.length > 0 && tiles.length <= 600, `${tiles.length}`);
        assertCubeBalanced(tiles);
        assertCubeDisjoint(tiles);
      });
    }
  }

  for (const [place, direction] of PLACES.slice(1, 3)) {
    it(`balances across face edges low over ${place}`, () => {
      const tiles = selectCubeTiles(eyeOver(direction, 2));
      const faces = new Set(
        tiles.filter((key) => key.level > 10).map((key) => key.face),
      );
      // The finest tiles lie on more than one face, so the balance crossed.
      assert.ok(faces.size >= 2, [...faces].join());
      assert.ok(assertCubeBalanced(tiles) > 0);
    });
  }

  for (const [place, direction] of PLACES) {
    it(`goes to the deepest level under the eye at 2 m over ${place}`, () => {
      const tiles = selectCubeTiles(eyeOver(direction, 2));
      const under = tiles.filter((key) => holds(key, direction));
      assert.ok(under.length > 0);
      assert.ok(under.every((key) => key.level === CUBE_MAX_LEVEL));
      assert.ok(Math.min(...tiles.map((key) => key.level)) <= 7);
    });
  }

  it('drops tiles past the horizon', () => {
    const eye = eyeOver(CENTRE, 2);
    for (const key of selectCubeTiles(eye)) {
      const near = capGap(tileCap(key), eye) * R;
      assert.ok(near < 400_000, `${cubeTileId(key)} at ${near} m`);
    }
  });

  it('orders by level, then face, then y, then x, the same every time', () => {
    const eye = eyeOver(faceToSphere('py', 0.999, -0.4), 500);
    const tiles = selectCubeTiles(eye);
    assert.deepEqual(selectCubeTiles(eye), tiles);
    const order = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    for (const [i, b] of tiles.entries()) {
      const a = tiles[i - 1];
      if (a) {
        const face = order.indexOf(a.face) - order.indexOf(b.face);
        assert.ok((a.level - b.level || face || a.y - b.y || a.x - b.x) < 0);
      }
    }
  });

  it('splits finer astride a coast, and not inland', () => {
    const eye = eyeOver(CENTRE, 300_000);
    const plain = selectCubeTiles(eye);
    const tiles = selectCubeTiles(eye, { coast: disc });
    assert.ok(tiles.length <= 700, `${tiles.length}`);
    assertCubeBalanced(tiles);
    assertCubeDisjoint(tiles);
    const shore = (key: CubeTileKey) => {
      const radii = tileCap(key)
        .border.slice(0, 4)
        .map((p) => R * arc(p, CENTRE));
      return (
        Math.min(...radii) < DISC_RADIUS && Math.max(...radii) > DISC_RADIUS
      );
    };
    const levels = (keys: CubeTileKey[]) =>
      keys.filter((key) => shore(key)).map((key) => key.level);
    assert.ok(Math.min(...levels(tiles)) > Math.min(...levels(plain)));
    assert.ok(Math.max(...levels(tiles)) > Math.max(...levels(plain)));
    const inland = (keys: CubeTileKey[]) =>
      keys.filter((key) => {
        const cap = tileCap(key);
        return R * (arc(cap.centre, CENTRE) + cap.radius) < 0.4 * DISC_RADIUS;
      });
    assert.ok(inland(plain).length > 0);
    assert.deepEqual(inland(tiles), inland(plain));
  });

  describe('in a view', () => {
    const eye = eyeOver(CENTRE, 100);
    const up = unit(eye);
    const ahead = sub(planeToWorld(0, 1000, 100), eye);
    const forward = unit(sub(ahead, scaled(up, dot(ahead, up))));
    const frustum = frustumOf(forward, up, (50 * Math.PI) / 180, 16 / 9);
    const tiles = selectCubeTiles(eye, { frustum, ground: flat });
    /** The tile's northmost border point's plane `y`. */
    const north = (key: CubeTileKey) =>
      Math.max(
        ...tileCap(key).border.map((p) => worldToPlane(scaled(p, R)).y),
      );
    const at = (x: number, y: number) => unit(planeToWorld(x, y));

    it('drops the tiles behind the eye and keeps those ahead', () => {
      const all = selectCubeTiles(eye, { ground: flat });
      assert.ok(tiles.length < all.length, `${tiles.length} of ${all.length}`);
      assert.ok(all.some((key) => north(key) < -10_000));
      for (const key of tiles) assert.ok(north(key) > -10_000, cubeTileId(key));
      assert.ok(tiles.some((key) => holds(key, at(0, 5000))));
      assert.ok(tiles.some((key) => holds(key, at(0, 30_000))));
      assertCubeBalanced(tiles);
      assertCubeDisjoint(tiles);
    });

    it('drops a tile ahead past the horizon', () => {
      // From 100 m the highest ground shows over the sea's horizon to ~250 km.
      assert.ok(!tiles.some((key) => holds(key, at(0, 1_000_000))));
      assert.ok(tiles.some((key) => holds(key, at(0, 200_000))));
    });
  });

  it('draws the far side of the planet from over it', () => {
    const antipode = scaled(CENTRE, -1);
    const tiles = selectCubeTiles(eyeOver(antipode, 100));
    assert.ok(tiles.some((key) => holds(key, antipode)));
    assert.ok(!tiles.some((key) => holds(key, CENTRE)));
  });
});
