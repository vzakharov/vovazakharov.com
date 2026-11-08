import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildWorldField,
  heightAt,
  SQUARE,
  worldSeed,
} from '@/island/entities/terrain';
import { sampleCoastField } from '@/island/entities/terrain/index.test-only';

import { OUR_WORLD } from '../lib/world-hash';

/** Plane points across the world's square, `n` by `n`. */
function across(n: number): Array<readonly [number, number]> {
  const west = SQUARE.centreX - SQUARE.side / 2;
  const south = SQUARE.centreY - SQUARE.side / 2;
  return Array.from({ length: n * n }, (_, k) => [
    west + (SQUARE.side * ((k % n) + 0.5)) / n,
    south + (SQUARE.side * (Math.floor(k / n) + 0.5)) / n,
  ]);
}

describe('the ground over our world’s coast', () => {
  const field = buildWorldField(OUR_WORLD);
  const seed = worldSeed(OUR_WORLD);
  const inland = across(500).filter(
    ([x, y]) => sampleCoastField(field, x, y) > 0,
  );

  it('samples inland ground near the shore and far from it', () => {
    const reach = inland.map(([x, y]) => sampleCoastField(field, x, y));
    assert.ok(inland.length > 10_000, `${inland.length}`);
    assert.ok(reach.filter((d) => d < 5000).length > 100);
  });

  // A lattice cutting any of these draws no sea inland between its vertices.
  for (const finest of [0, 2, 60, 2000, 60_000]) {
    it(`never sinks below the sea inland, cut at ${String(finest)} m`, () => {
      for (const [x, y] of inland) {
        const height = heightAt(field, seed, x, y, finest);
        assert.ok(height >= 0, `${String(height)} m at (${x}, ${y})`);
      }
    });
  }
});
