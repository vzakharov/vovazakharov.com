import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { coast } from '@/island/entities/coast';
import { buildCoastField, heightAt } from '@/island/entities/terrain';
import { sampleCoastField } from '@/island/entities/terrain/index.test-only';

import { SEED } from '../lib/tile-protocol';

/** Plane points across the coast's bounding box, `n` by `n`. */
function across(n: number): Array<readonly [number, number]> {
  const points = coast.rings.flat();
  const xs = points.map(([x]) => x * 1000);
  const ys = points.map(([, y]) => y * 1000);
  const [west, east] = [Math.min(...xs), Math.max(...xs)];
  const [south, north] = [Math.min(...ys), Math.max(...ys)];
  return Array.from({ length: n * n }, (_, k) => [
    west + ((east - west) * ((k % n) + 0.5)) / n,
    south + ((north - south) * (Math.floor(k / n) + 0.5)) / n,
  ]);
}

describe('the ground over the island’s coast', () => {
  const field = buildCoastField(coast);
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
        const height = heightAt(field, SEED, x, y, finest);
        assert.ok(height >= 0, `${String(height)} m at (${x}, ${y})`);
      }
    });
  }
});
