import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Vec3 } from '@/island/shared/globe';
import {
  heightAtSphere,
  openSphereWorld,
  OUR_WORLD,
  sampleSphereField,
} from '@/island/entities/terrain';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** `n` directions spread evenly over the sphere, a Fibonacci lattice. */
function across(n: number): Vec3[] {
  return Array.from({ length: n }, (_, k) => {
    const z = 1 - (2 * (k + 0.5)) / n;
    const ring = Math.sqrt(1 - z * z);
    const turn = GOLDEN_ANGLE * k;
    return [ring * Math.cos(turn), ring * Math.sin(turn), z] as const;
  });
}

/** Our world's coast, its seed, and the lattice's directions over its land. */
async function ourLand() {
  const { field, seed } = await openSphereWorld(OUR_WORLD);
  const coast = (p: Vec3) => sampleSphereField(field, p);
  return { coast, seed, inland: across(1_000_000).filter((p) => coast(p) > 0) };
}

describe('the ground over our world’s coast', () => {
  const land = ourLand();

  it('samples inland ground near the shore and far from it', async () => {
    const { coast, inland } = await land;
    const reach = inland.map((p) => coast(p));
    assert.ok(inland.length > 10_000, `${inland.length}`);
    assert.ok(reach.filter((d) => d < 5000).length > 100);
    assert.ok(reach.some((d) => d > 100_000));
  });

  // A lattice cutting any of these draws no sea inland between its vertices.
  for (const finest of [0, 2, 60, 2000, 60_000]) {
    it(`never sinks below the sea inland, cut at ${String(finest)} m`, async () => {
      const { coast, seed, inland } = await land;
      for (const p of inland) {
        const height = heightAtSphere(coast, seed, p, finest);
        assert.ok(height >= 0, `${String(height)} m at ${p.join(', ')}`);
      }
    });
  }
});
