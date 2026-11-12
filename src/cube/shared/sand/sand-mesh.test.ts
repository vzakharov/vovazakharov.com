import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ringRadius, SAND_MESH, sandIndices } from './sand-mesh';

describe("the sand's mesh", () => {
  const { spokes, rings } = SAND_MESH;
  const indices = sandIndices();

  it('has two triangles per cell and no vertex past the last ring', () => {
    assert.equal(indices.length, (rings - 1) * spokes * 6);
    assert.equal(
      Math.max(...indices.subarray(-spokes * 6)),
      rings * spokes - 1,
    );
    assert.equal(indices[0], 0);
  });

  it('joins the last spoke to the first', () => {
    const last = indices.subarray((spokes - 1) * 6, spokes * 6);
    assert.deepEqual(
      [...last],
      [spokes - 1, 2 * spokes - 1, spokes, spokes - 1, spokes, 0],
    );
  });

  it('is millimetres fine under the eye and reaches past the island', () => {
    assert.equal(ringRadius(0), 0);
    assert.ok(ringRadius(1) < 0.006);
    assert.ok(ringRadius(rings - 1) > 400);
    for (let ring = 1; ring < rings; ring += 1) {
      assert.ok(ringRadius(ring) > ringRadius(ring - 1));
    }
  });
});
