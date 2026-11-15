import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sampleSphereField, type SphereField } from '@/island/entities/terrain';

import { adoptRequest, poolSize } from './tile-pool';

describe('poolSize', () => {
  it('takes 2 where the browser says neither', () => {
    assert.equal(poolSize(undefined, undefined), 2);
  });

  it('leaves the main thread a core, and keeps at least one worker', () => {
    assert.equal(poolSize(1, undefined), 1);
    assert.equal(poolSize(2, undefined), 1);
    assert.equal(poolSize(4, undefined), 3);
  });

  it('stops at 4', () => {
    assert.equal(poolSize(8, undefined), 4);
    assert.equal(poolSize(16, 32), 4);
  });

  it('buys one worker per doubling of memory', () => {
    assert.equal(poolSize(8, 0.5), 1);
    assert.equal(poolSize(8, 1), 1);
    assert.equal(poolSize(8, 2), 2);
    assert.equal(poolSize(8, 3), 2);
    assert.equal(poolSize(8, 4), 3);
    assert.equal(poolSize(8, 8), 4);
  });

  it('lets the cores cap a pool memory would allow', () => {
    assert.equal(poolSize(2, 8), 1);
    assert.equal(poolSize(undefined, 8), 2);
    assert.equal(poolSize(undefined, 1), 1);
  });
});

describe('adoptRequest', () => {
  const rows = 4;
  const columns = 8;
  const field: SphereField = {
    rows,
    columns,
    theta: Float64Array.from(
      { length: rows },
      (_, ring) => ((ring + 0.5) * Math.PI) / rows,
    ),
    distance: Float32Array.from(
      { length: rows * columns },
      (_, node) => (node % 7) * 1000 - 3000,
    ),
    poles: Float64Array.of(-2500, 1500),
  };
  const points: ReadonlyArray<readonly [number, number, number]> = [
    [1, 0, 0],
    [0, 0.6, 0.8],
    [-0.36, 0.48, -0.8],
    [0, 0, 1],
  ];

  it('survives the clone postMessage makes, sampling as the field it copies', () => {
    const request = structuredClone(adoptRequest({ field, seed: 7 }));
    assert.equal(request.kind, 'adopt');
    assert.equal(request.seed, 7);
    assert.notEqual(request.field.distance.buffer, field.distance.buffer);
    for (const p of points)
      assert.equal(
        sampleSphereField(request.field, p),
        sampleSphereField(field, p),
      );
  });
});
