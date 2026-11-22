import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CubeCell, unit, type Vec3 } from '@/island/shared/globe';
import { fillCubeTile } from '@/island/entities/terrain';

import { forestCover, tileCover, tileSand, TREELINE } from './forest-cover';

const SEED = 20_261_122;

/** Level places a few hundred metres apart along a line across the sphere. */
const places = (count: number): Vec3[] =>
  Array.from({ length: count }, (_, n) =>
    unit([Math.cos(n * 7e-5), Math.sin(n * 7e-5), 0.3 + n * 1e-5]),
  );

/** Level ground free of sand at `p`, `height` metres up. */
const site = (p: Vec3, height: number) => ({ p, height, upright: 1, sand: 0 });

const level = (p: Vec3, height: number) => forestCover(SEED, site(p, height));

const meanAt = (height: number) =>
  places(2000).reduce((total, p) => total + level(p, height), 0) / 2000;

describe('forestCover', () => {
  it('stays within 0 and 1 at every height and slope', () => {
    for (const [n, p] of places(400).entries()) {
      const cover = forestCover(SEED, {
        p,
        height: -200 + ((n * 37) % 1800),
        upright: 0.6 + ((n * 13) % 40) / 100,
        sand: ((n * 7) % 11) / 10,
      });
      assert.ok(cover >= 0 && cover <= 1, `cover ${String(cover)}`);
    }
  });

  it('leaves the sea and the sand bare', () => {
    for (const p of places(200)) {
      assert.equal(level(p, -30), 0);
      assert.equal(level(p, 0), 0);
      assert.equal(forestCover(SEED, { ...site(p, 40), sand: 1 }), 0);
    }
  });

  it('thins over sandy ground', () => {
    const sandy = places(2000).reduce(
      (total, p) => total + forestCover(SEED, { ...site(p, 200), sand: 0.45 }),
      0,
    );
    assert.ok(sandy > 0 && sandy / 2000 < meanAt(200));
  });

  it('leaves the peaks bare', () => {
    for (const p of places(200)) {
      assert.equal(level(p, TREELINE + 150), 0);
      assert.equal(level(p, 2400), 0);
    }
  });

  it('leaves steep rock bare', () => {
    for (const p of places(200)) {
      assert.equal(forestCover(SEED, { ...site(p, 200), upright: 0.7 }), 0);
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
      (q) => forestCover(SEED + 1, site(q, 200)) !== level(q, 200),
    );
    assert.ok(other);
  });

  it('softens toward the average where the reader cannot tell patches apart', () => {
    const coarse = places(500).map((p) =>
      forestCover(SEED, { ...site(p, 200), finest: 100_000 }),
    );
    for (const cover of coarse) assert.ok(cover > 0.2 && cover < 0.9);
  });

  it('reads nearly the same at cells twice as wide, whatever their width', () => {
    for (let finest = 2; finest < 20_000; finest *= 2) {
      const apart = places(1500).map((p) =>
        Math.abs(
          forestCover(SEED, { ...site(p, 200), finest }) -
            forestCover(SEED, { ...site(p, 200), finest: 2 * finest }),
        ),
      );
      const mean = apart.reduce((a, b) => a + b, 0) / apart.length;
      assert.ok(mean < 0.08, `${String(finest)} m: mean ${String(mean)}`);
      assert.ok(Math.max(...apart) < 0.6, `${String(finest)} m: a patch apart`);
    }
  });
});

describe('tileCover', () => {
  const key: CubeCell = { face: 'pz', level: 9, x: 200, y: 300 };
  /** Ground rolling from the sea up past the treeline across the tile. */
  const tile = fillCubeTile(
    key,
    ([x, y]) => 700 + 900 * Math.sin(x * 9000) * Math.cos(y * 7000),
  );
  /** A coast 3 km off everywhere: no sand this high. */
  const sand = tileSand(() => 3000, tile);
  const cover = tileCover(SEED, tile, sand);
  const beach = tileCover(
    SEED,
    tile,
    tileSand(() => 100, { ...tile, heights: tile.heights.map(() => 5) }),
  );

  it('holds one value per vertex of the mesh, skirt included', () => {
    assert.equal(cover.length, tile.heights.length);
    assert.equal(cover.length * 3, tile.positions.length);
  });

  it('is bare under the sea and holds forest somewhere on the land', () => {
    const count = tile.grid * tile.grid;
    for (let v = 0; v < count; v++) {
      const value = cover[v] ?? Number.NaN;
      assert.ok(value >= 0 && value <= 1);
      if ((tile.heights[v] ?? 0) <= 0) assert.equal(value, 0);
    }
    assert.ok(cover.some((value) => value > 0.5));
  });

  it('is bare where the tile is sand', () => {
    assert.ok(sand.every((value) => value === 0));
    assert.ok(beach.every((value) => value === 0));
  });
});
