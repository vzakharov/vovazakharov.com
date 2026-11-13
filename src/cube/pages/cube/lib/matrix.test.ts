import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { viewProjection } from './camera';
import { inverse, multiply } from './matrix';

describe('inverse', () => {
  it('undoes a camera’s view-projection', () => {
    const matrix = viewProjection(
      { yaw: 0.7, elevation: -0.2 },
      [0.4, 0.3, 0.6],
      16 / 9,
      1,
    );
    const identity = multiply(matrix, inverse(matrix));
    for (const [index, value] of identity.entries()) {
      const expected = index % 5 === 0 ? 1 : 0;
      assert.ok(
        Math.abs(value - expected) < 1e-3,
        `entry ${String(index)} is ${String(value)}`,
      );
    }
  });

  it('refuses a singular matrix', () => {
    assert.throws(() => inverse(new Float32Array(16)), /singular/);
  });
});
