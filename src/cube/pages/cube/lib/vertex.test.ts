import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { offsetOf, VERTEX, VERTEX_LAYOUT, VERTEX_WORDS } from './vertex';

describe('the vertex', () => {
  it('lays its fields end to end', () => {
    assert.equal(offsetOf('position'), 0);
    assert.equal(offsetOf('normal'), 3);
    assert.equal(offsetOf('tex'), 9);
    assert.equal(offsetOf('cell'), VERTEX_WORDS - 1);
    assert.equal(VERTEX_LAYOUT.arrayStride, VERTEX_WORDS * 4);
  });

  it('gives the pipeline one attribute per field, in order', () => {
    const attributes = [...VERTEX_LAYOUT.attributes];
    assert.deepEqual(
      attributes.map(({ shaderLocation }) => shaderLocation),
      attributes.map((_, index) => index),
    );
    assert.equal(attributes.at(-1)?.offset, (VERTEX_WORDS - 1) * 4);
    assert.equal(attributes.at(-1)?.format, 'uint32');
  });

  it('passes whole numbers to the fragment unblended', () => {
    assert.match(VERTEX.listing, /@location\(4\) kind: u32,/);
    assert.match(
      VERTEX.listing,
      /@location\(4\) @interpolate\(flat\) kind: u32,/,
    );
    assert.doesNotMatch(VERTEX.listing, /@interpolate\(flat\) position/);
  });
});
