import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SURFACES } from '@/cube/shared/lib/surface';
import type { Quad, Room } from '@/cube/entities/world';

import { pack, type RoomLook } from './mesh';
import { offsetOf, VERTEX_WORDS } from './vertex';

const quad = (n: number, surface: Quad['surface'], paint?: number): Quad => ({
  corners: [
    [2, 0, 4],
    [2, 0, 5],
    [3, 0, 5],
    [3, 0, 4],
  ],
  normal: [0, 1, 0],
  room: { n, x: 3n, y: 1n },
  surface,
  ...(paint === undefined ? {} : { paint }),
});

const lookOf = ({ n }: Room): RoomLook => ({
  origin: [2, 0, 4],
  side: 2,
  seed: 0xde_ad_be_ef,
  flags: n,
  cell: 0x01_03,
});

describe('pack', () => {
  const { data, ranges } = pack(
    [quad(3, 'floor'), quad(2, 'wall', 0xff_80_00), quad(3, 'ceiling')],
    lookOf,
  );
  const floats = new Float32Array(data);
  const words = new Uint32Array(data);
  const field = (
    vertex: number,
    name: Parameters<typeof offsetOf>[0],
    length: number,
  ) => {
    const at = vertex * VERTEX_WORDS + offsetOf(name);
    return [...floats.subarray(at, at + length)];
  };
  const word = (vertex: number, name: Parameters<typeof offsetOf>[0]) =>
    words[vertex * VERTEX_WORDS + offsetOf(name)];

  it('lays each quad out as two triangles', () => {
    assert.equal(data.byteLength, 3 * 6 * VERTEX_WORDS * 4);
    assert.deepEqual(field(2, 'position', 3), [3, 0, 5]);
    assert.deepEqual(field(5, 'position', 3), [3, 0, 4]);
    assert.deepEqual(field(2, 'normal', 3), [0, 1, 0]);
  });

  it('runs the floors from the top, each floor’s quads in the order given', () => {
    assert.deepEqual(ranges, [
      { n: 2, first: 0, count: 6 },
      { n: 3, first: 6, count: 12 },
    ]);
    assert.equal(word(0, 'kind'), SURFACES.indexOf('wall'));
    assert.equal(word(6, 'kind'), SURFACES.indexOf('floor'));
    assert.equal(word(12, 'kind'), SURFACES.indexOf('ceiling'));
  });

  it('places a vertex in its room’s own sides', () => {
    assert.deepEqual(field(2, 'local', 3), [0.5, 0, 0.5]);
    assert.deepEqual(field(0, 'local', 3), [0, 0, 0]);
  });

  it('maps a face’s first corner to its texture’s bottom left', () => {
    assert.deepEqual(field(0, 'tex', 2), [0, 1]);
    assert.deepEqual(field(2, 'tex', 2), [1, 0]);
    assert.deepEqual(field(5, 'tex', 2), [0, 0]);
  });

  it('carries the room’s word, flags and cell, and the face’s paint', () => {
    assert.equal(word(0, 'seed'), 0xde_ad_be_ef);
    assert.equal(word(0, 'flags'), 2);
    assert.equal(word(6, 'flags'), 3);
    assert.equal(word(0, 'cell'), 0x01_03);
    assert.equal(word(0, 'paint'), 0xff_80_00);
    assert.equal(word(6, 'paint'), 0);
  });
});
