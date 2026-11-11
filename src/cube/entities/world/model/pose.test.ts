import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Pose, rebase } from './pose';

const at = (pose: Partial<Pose>): Pose => ({
  n: 3,
  x: 1n,
  y: 1n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  yaw: 0,
  elevation: 0,
  ...pose,
});

describe('rebase', () => {
  it('leaves an eye inside its room alone', () => {
    assert.deepEqual(rebase(at({})), at({}));
  });

  it('carries whole rooms into the index, either way', () => {
    const moved = rebase(at({ u: 2.25, v: -0.75 }));
    assert.equal(moved.x, 3n);
    assert.equal(moved.u, 0.25);
    assert.equal(moved.y, 0n);
    assert.equal(moved.v, 0.25);
  });

  it('keeps the eye inside the cube', () => {
    const west = rebase(at({ x: 0n, u: -0.5 }));
    assert.equal(west.x, 0n);
    assert.equal(west.u, 0);
    const south = rebase(at({ y: 3n, v: 1.5 }));
    assert.equal(south.y, 3n);
    assert.ok(south.v < 1);
  });
});
