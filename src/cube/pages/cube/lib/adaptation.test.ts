import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { DOORWAY, toRoom, yawToRoom } from '@/cube/shared/outside';
import type { Outside, Pose } from '@/cube/entities/world';

import { adapted, lensAdapted, settled } from './adaptation';

const DOORWAY_V = (DOORWAY.from + DOORWAY.to) / 2 / ROOM_METRES;

/**
 * A pose told as the shell has it — `east` and `south` of the cube's
 * north-west corner, the doorway in the east face, yaw 0 looking out of it —
 * in the room, which is turned inside the shell.
 */
function within(east: number, south: number, yaw: number, n = 1): Pose {
  const [u, , v] = toRoom([east, 0, south]);
  return {
    n,
    x: 0n,
    y: 0n,
    u,
    v,
    eyeAbove: 0.32,
    scale: 1,
    yaw: yawToRoom(yaw),
    elevation: 0,
  };
}

const ASHORE: Outside = { eye: [-20, 1.6, 20], yaw: 0, elevation: 0, roll: 0 };

describe("the eye's adaptation", () => {
  it('settles to daylight outside and on the sill looking out', () => {
    assert.equal(settled(ASHORE), 0);
    assert.equal(settled(within(0.97, DOORWAY_V, 0)), 0);
  });

  it('settles to the room with its back to the doorway, and on other floors', () => {
    assert.equal(settled(within(0.5, 0.5, Math.PI)), 1);
    assert.equal(settled(within(0.97, DOORWAY_V, 0, 2)), 1);
  });

  it('goes by what the eye looks at, not by where it stands', () => {
    const toDoorway = Math.atan2(DOORWAY_V - 0.7, 0.9);
    const across = settled(within(0.1, 0.7, toDoorway));
    assert.ok(across < 0.3, String(across));
    assert.equal(settled(within(0.1, 0.7, toDoorway + Math.PI / 2)), 1);
    const beside = settled(within(0.9, DOORWAY_V, Math.PI / 2));
    assert.ok(beside > 0.9, String(beside));
  });

  it('gets used to the light faster than to the dark', () => {
    const toLight = adapted(1, ASHORE, 0.5);
    const toDark = adapted(0, within(0.5, 0.5, Math.PI), 0.5);
    assert.ok(toLight < 0.4 && toDark < 0.2);
    assert.ok(1 - toLight > 2 * toDark);
  });

  it('gets there the same in one step or in many', () => {
    let stepped = 1;
    for (let frame = 0; frame < 60; frame += 1) {
      stepped = adapted(stepped, ASHORE, 1 / 60);
    }
    assert.ok(Math.abs(stepped - adapted(1, ASHORE, 1)) < 1e-9);
  });

  it('keeps the lens it is given but for how far indoors the eye is', () => {
    assert.deepEqual(lensAdapted(0.25, { exposure: 0.6, eyelids: 0.5 }), {
      exposure: 0.6,
      eyelids: 0.5,
      indoors: 0.25,
    });
  });
});
