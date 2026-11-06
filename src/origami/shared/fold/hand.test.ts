import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fitAxis, rodrigues, turnSense } from './hand.ts';
import type { Vec3 } from './space.ts';

const close = (actual: Vec3, expected: Vec3, within = 1e-9) => {
  for (const [c, value] of actual.entries()) {
    assert.ok(
      Math.abs(value - (expected[c] ?? 0)) < within,
      `${actual.join(',')} is not ${expected.join(',')}`,
    );
  }
};

describe('fitAxis', () => {
  it('finds the line through noisy collinear points', () => {
    const along: Vec3 = [2 / 3, 2 / 3, 1 / 3];
    // Deterministic jitter off the line, well under the spread along it.
    const points = Array.from({ length: 11 }, (_, k): Vec3 => {
      const s = k / 10 - 0.5;
      const jitter = 1e-3 * Math.sin(7 * k);
      return [
        1 + s * along[0] + jitter,
        2 + s * along[1] - jitter,
        3 + s * along[2] + jitter / 2,
      ];
    });
    const { centre, direction } = fitAxis(points);
    close(centre, [1, 2, 3], 1e-3);
    // Seeded last − first, so it points the way the points run.
    close(direction, along, 1e-2);
    assert.ok(Math.abs(Math.hypot(...direction) - 1) < 1e-12);
  });

  it('needs two points', () => {
    assert.throws(() => fitAxis([[0, 0, 0]]), /two points/);
  });
});

describe('turnSense', () => {
  // Turning +θ about z carries a flap on +x toward +y.
  const z: Vec3 = [0, 0, 1];
  const flap: Vec3 = [1, 0, 0];

  it('turns positive when that lifts the flap toward up', () => {
    assert.equal(turnSense(z, flap, [0, 1, 0], 1), 1);
    assert.equal(turnSense(z, flap, [0, -1, 0], 1), -1);
  });

  it('flips with the sense, a mountain lifting off the bottom', () => {
    assert.equal(turnSense(z, flap, [0, 1, 0], -1), -1);
    assert.equal(turnSense(z, flap, [0, -1, 0], -1), 1);
  });
});

describe('rodrigues', () => {
  it('turns a point a quarter about an axis', () => {
    close(rodrigues([1, 0, 0], [0, 0, 1], Math.PI / 2), [0, 1, 0]);
    // A component along the axis stays.
    close(rodrigues([0, 1, 5], [1, 0, 0], Math.PI / 2), [0, -5, 1]);
  });

  it('turns about an oblique axis without moving the axis', () => {
    const axis: Vec3 = [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0];
    close(rodrigues([2, 2, 0], axis, Math.PI / 2), [2, 2, 0]);
    close(rodrigues([0, 0, 1], axis, Math.PI / 2), [
      1 / Math.sqrt(2),
      -1 / Math.sqrt(2),
      0,
    ]);
  });
});
