import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { viewProjection } from './camera';
import { inverse } from './matrix';

function multiply(a: Float32Array, b: Float32Array): number[] {
  return Array.from({ length: 16 }, (_, index) => {
    const column = Math.floor(index / 4);
    const row = index % 4;
    let sum = 0;
    for (let k = 0; k < 4; k += 1) {
      sum += (a[k * 4 + row] ?? 0) * (b[column * 4 + k] ?? 0);
    }
    return sum;
  });
}

describe('inverse', () => {
  it('undoes a camera’s view-projection', () => {
    const matrix = viewProjection(
      {
        n: 1,
        x: 0n,
        y: 0n,
        u: 0.5,
        v: 0.5,
        eyeAbove: 0.32,
        scale: 1,
        yaw: 0.7,
        elevation: -0.2,
      },
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
