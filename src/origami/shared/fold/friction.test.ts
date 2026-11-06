import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { rub, type Weights } from './friction.ts';

/** A unit right triangle in z = 0 and a vertex 3 above it. */
const x = Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0, 0.5, 0.25, 0.01]);
const corners = [0, 1, 2] as const;
/** The vertex's foot, 0.1 along x from where it first landed. */
const foot: Weights = [0.25, 0.5, 0.25];
const landed = (): Weights => [0.35, 0.4, 0.25];

describe('rub', () => {
  it('sticks under the cap, pulling the foot back to its anchor', () => {
    const anchor = landed();
    const f = new Float64Array(12);
    assert.equal(rub(x, f, 3, corners, foot, anchor, 10, 2), false);
    assert.ok(Math.abs((f[9] ?? 0) + 1) < 1e-12);
    assert.deepEqual(anchor, landed());
    // The triangle takes the pull back: no net force.
    const net = [0, 1, 2].map((axis) =>
      [0, 1, 2, 3].reduce((sum, v) => sum + (f[3 * v + axis] ?? 0), 0),
    );
    for (const component of net) assert.ok(Math.abs(component) < 1e-12);
  });

  it('slips past the cap, the pull held at it and the anchor dragged along', () => {
    const anchor = landed();
    const f = new Float64Array(12);
    assert.equal(rub(x, f, 3, corners, foot, anchor, 10, 0.5), true);
    assert.ok(Math.abs((f[9] ?? 0) + 0.5) < 1e-12);
    // Left where the spring holds the cap: 0.05 behind the foot.
    assert.ok(Math.abs(anchor[0] - 0.3) < 1e-12);
    assert.ok(Math.abs(anchor[1] - 0.45) < 1e-12);
  });
});
