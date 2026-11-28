import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { edgePoints, gather, spread } from './edge-points.ts';

const outline = [[0, 1]] as const;

describe('edgePoints', () => {
  it('puts 3 points at the quarters, weighted 1 - k/4 on the first end', () => {
    const points = edgePoints({ outline }, 3);
    assert.deepEqual([...points.ends], [0, 1, 0, 1, 0, 1]);
    assert.deepEqual([...points.weight], [0.75, 0.5, 0.25]);
  });

  it('adds none at 0', () => {
    assert.equal(edgePoints({ outline }, 0).weight.length, 0);
  });

  it('places each point along its edge and hands its force back by weight', () => {
    const points = edgePoints({ outline }, 3);
    const x = Float64Array.from([0, 0, 0, 4, 0, 0]);
    const xe = new Float64Array(15);
    spread(points, x, xe);
    assert.deepEqual([...xe.subarray(6)], [1, 0, 0, 2, 0, 0, 3, 0, 0]);

    const fe = new Float64Array(15);
    fe[6] = 4;
    const f = new Float64Array(6);
    gather(points, fe, f);
    assert.deepEqual([...f], [3, 0, 0, 1, 0, 0]);
  });
});
