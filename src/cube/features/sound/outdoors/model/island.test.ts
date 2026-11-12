import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WAKE_AT } from '@/cube/shared/outside';
import type { Pose } from '@/cube/entities/world';

import { heardFrom, ISLAND } from './island';
import { type Ears, OPEN_AIR } from './mix';

const both = ({ leftEar, rightEar }: Ears): number =>
  Math.hypot(leftEar, rightEar);

/** An eye in the middle of a room on floor `n`, facing `yaw`. */
const inside = (n: number, yaw = 0, u = 0.5): Pose => ({
  n,
  x: 0n,
  y: 0n,
  u,
  v: 0.5,
  yaw,
  elevation: 0,
  scale: 1,
  eyeAbove: 0.4,
});

/** An eye over the waking spot, facing `yaw`. */
const awake = (yaw: number) => ({
  eye: [WAKE_AT[0], 1.6, WAKE_AT[2]] as const,
  yaw,
  elevation: 0,
  roll: 0,
});

describe('the island', () => {
  it('has a shore all the way round the cube', () => {
    assert.equal(ISLAND.coast.shore.length, 32);
    assert.ok(ISLAND.coast.swing.atShore > 1e-3);
  });
});

describe('heardFrom', () => {
  it('is the open air on the beach, the surf loud and the hum faint', () => {
    const mix = heardFrom(ISLAND, awake(0), 100);
    assert.ok(mix);
    assert.equal(mix.muffle, OPEN_AIR);
    assert.ok(both(mix.layers.hum) > 0);
    assert.ok(both(mix.layers.hum) < 0.1);
  });

  it('comes through the doorway on floor 1, from the doorway’s side', () => {
    // The doorway is in the east wall: on the left of an eye facing south.
    const south = heardFrom(ISLAND, inside(1, Math.PI / 2), 100);
    assert.ok(south);
    assert.ok(south.muffle < OPEN_AIR);
    assert.ok(south.layers.wash.leftEar > 1.2 * south.layers.wash.rightEar);
    const north = heardFrom(ISLAND, inside(1, -Math.PI / 2), 100);
    assert.ok(north);
    assert.ok(north.layers.wash.rightEar > 1.2 * north.layers.wash.leftEar);
  });

  it('is louder at the doorway than across the room', () => {
    const near = heardFrom(ISLAND, inside(1, 0, 0.95), 100);
    const far = heardFrom(ISLAND, inside(1, 0, 0.05), 100);
    assert.ok(near && far);
    assert.ok(both(near.layers.wash) > 1.5 * both(far.layers.wash));
  });

  it('fades floor by floor and is gone below the fourth', () => {
    const levels = [1, 2, 3, 4].map((n) => {
      const mix = heardFrom(ISLAND, inside(n), 100);
      assert.ok(mix);
      return both(mix.layers.wash);
    });
    for (const [n, level] of levels.entries()) {
      if (n > 0) assert.ok(level < (levels[n - 1] ?? 0));
    }
    assert.equal(heardFrom(ISLAND, inside(5), 100), null);
  });
});
