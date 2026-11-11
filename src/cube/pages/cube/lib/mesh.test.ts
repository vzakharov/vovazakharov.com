import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Quad } from '@/cube/entities/world';

import { pack, VERTEX_FLOATS } from './mesh';
import { colourOf } from './palette';

const QUAD: Quad = {
  corners: [
    [0, 0, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 0, 0],
  ],
  normal: [0, 1, 0],
  floor: 2,
  surface: 'floor',
};

describe('pack', () => {
  it('lays each quad out as two triangles of position, normal and colour', () => {
    const packed = pack([QUAD, QUAD]);
    assert.equal(packed.length, 2 * 6 * VERTEX_FLOATS);
    const vertex = (i: number) => [
      ...packed.subarray(i * VERTEX_FLOATS, (i + 1) * VERTEX_FLOATS),
    ];
    assert.deepEqual(vertex(2).slice(0, 6), [1, 0, 1, 0, 1, 0]);
    assert.deepEqual(vertex(5).slice(0, 3), [1, 0, 0]);
    assert.deepEqual(vertex(0).slice(6), [
      ...Float32Array.from(colourOf(2, 'floor')),
    ]);
  });
});
