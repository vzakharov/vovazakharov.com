import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Pose } from '@/cube/entities/world';

import { canPress } from './press';

/** The sign on the east wall of its room, facing west. */
const SIGN = { at: { u: 1, v: 0.5 }, facing: { u: -1, v: 0 } };

const pose = (u: number, v: number, yaw: number): Pose => ({
  n: 2,
  x: 1n,
  y: 1n,
  u,
  v,
  eyeAbove: 0.32,
  scale: 1,
  yaw,
  elevation: 0,
});

describe('canPress', () => {
  it('presses a sign within reach and in front', () => {
    assert.equal(canPress(pose(0.7, 0.5, 0), SIGN), true);
    assert.equal(canPress(pose(0.7, 0.6, 0.3), SIGN), true);
  });

  it('does not press a sign out of reach', () => {
    assert.equal(canPress(pose(0.4, 0.5, 0), SIGN), false);
  });

  it('does not press a sign the eye looks away from', () => {
    assert.equal(canPress(pose(0.7, 0.5, Math.PI), SIGN), false);
    assert.equal(canPress(pose(0.7, 0.5, Math.PI / 2), SIGN), false);
  });
});
