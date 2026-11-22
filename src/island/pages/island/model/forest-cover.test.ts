import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CubeCell, unit, type Vec3 } from '@/island/shared/globe';
import { fillCubeTile } from '@/island/entities/terrain';

import { SHORE_TOP } from '../lib/land-colour';
import { forestCover, tileCover, TREELINE } from './forest-cover';

const SEED = 20_261_122;

/** Level places a few hundred metres apart along a line across the sphere. */
const places = (count: number): Vec3[] =>
  Array.from({ length: count }, (_, n) =>
    unit([Math.cos(n * 7e-5), Math.sin(n * 7e-5), 0.3 + n * 1e-5]),
  );

const level = (p: Vec3, height: number) =>
  forestCover(SEED, { p, height, upright: 1 });

const meanAt = (height: number) =>
  places(2000).reduce((total, p) => total + level(p, height), 0) / 2000;

describe('forestCover', () => {
  it('stays within 0 and 1 at every height and slope', () => {
    for (const [n, p] of places(400).entries()) {
      const cover = forestCover(SEED, {
        p,
        height: -200 + ((n * 37) % 1800),
        upright: 0.6 + ((n * 13) % 40) / 100,
      });
      assert.ok(cover >= 0 && cover <= 1, `cover ${String(cover)}`);
    }
  });

  it('leaves the sea and the sand bare', () => {
    for (const p of places(200)) {
      assert.equal(level(p, -30), 0);
      assert.equal(level(p, 0), 0);
      assert.equal(level(p, SHORE_TOP), 0);
    }
  });

  it('leaves the peaks bare', () => {
    for (const p of places(200)) {
      assert.equal(level(p, TREELINE + 150), 0);
      assert.equal(level(p, 2400), 0);
    }
  });

  it('leaves steep rock bare', () => {
    for (const p of places(200)) {
      assert.equal(forestCover(SEED, { p, height: 200, upright: 0.7 }), 0);
    }
  });

  it('breaks the lowland into closed forest and open meadow', () => {
    const covers = places(3000).map((p) => level(p, 200));
    const mean = covers.reduce((a, b) => a + b, 0) / covers.length;
    assert.ok(mean > 0.3 && mean < 0.85, `mean ${String(mean)}`);
    assert.ok(covers.includes(0));
    assert.ok(covers.some((cover) => cover > 0.95));
  });

  it('thins the forest up the upland', () => {
    assert.ok(meanAt(300) > meanAt(900));
    assert.ok(meanAt(900) > meanAt(1150));
  });

  it('gives a place the same cover each time, and another world another', () => {
    const [p] = places(1);
    assert.ok(p !== undefined);
    assert.equal(level(p, 200), level(p, 200));
    const other = places(500).some(
      (q) =>
        forestCover(SEED + 1, { p: q, height: 200, upright: 1 }) !==
        level(q, 200),
    );
    assert.ok(other);
  });

  it('softens toward the average where the reader cannot tell patches apart', () => {
    const coarse = places(500).map((p) =>
      forestCover(SEED, { p, height: 200, upright: 1, finest: 100_000 }),
    );
    for (const cover of coarse) assert.ok(cover > 0.2 && cover < 0.9);
  });
});

describe('tileCover', () => {
  const key: CubeCell = { face: 'pz', level: 9, x: 200, y: 300 };
  /** Ground rolling from the sea up past the treeline across the tile. */
  const tile = fillCubeTile(
    key,
    ([x, y]) => 700 + 900 * Math.sin(x * 9000) * Math.cos(y * 7000),
  );
  const cover = tileCover(SEED, tile);

  it('holds one value per vertex of the mesh, skirt included', () => {
    assert.equal(cover.length, tile.heights.length);
    assert.equal(cover.length * 3, tile.positions.length);
  });

  it('is bare under the sea and holds forest somewhere on the land', () => {
    const count = tile.grid * tile.grid;
    for (let v = 0; v < count; v++) {
      const value = cover[v] ?? Number.NaN;
      assert.ok(value >= 0 && value <= 1);
      if ((tile.heights[v] ?? 0) <= SHORE_TOP) assert.equal(value, 0);
    }
    assert.ok(cover.some((value) => value > 0.5));
  });
});
