import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Quad } from '@/cube/entities/world';

import { pack, packSigns, SIGN_VERTEX_FLOATS, VERTEX_FLOATS } from './mesh';
import { colourOf } from './palette';

const QUAD: Quad = {
  corners: [
    [0, 0, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 0, 0],
  ],
  normal: [0, 1, 0],
  n: 2,
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

describe('packSigns', () => {
  it('maps the bottom-left corner to the texture’s bottom left, top right to top right', () => {
    const packed = packSigns([QUAD]);
    assert.equal(packed.length, 6 * SIGN_VERTEX_FLOATS);
    const uv = (i: number) => [
      ...packed.subarray(
        i * SIGN_VERTEX_FLOATS + 6,
        (i + 1) * SIGN_VERTEX_FLOATS,
      ),
    ];
    assert.deepEqual(uv(0), [0, 1]);
    assert.deepEqual(uv(2), [1, 0]);
    assert.deepEqual(uv(5), [0, 0]);
  });
});
