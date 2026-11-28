import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CUBE_METRES,
  QUARTER_TURNS,
  toRoom,
  toShell,
  turnedToShell,
  yawToRoom,
  yawToShell,
} from '@/cube/shared/cube-boundary';
import { ROOM_HEIGHT } from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { f32 } from '@/cube/shared/shader';

import { islandHeight } from './island-height';
import {
  CUBE_AT,
  CUBE_BOX,
  DOORWAY_BOX,
  toCube,
  toWorld,
  WAKE_AT,
  WORLD,
} from './place';

const close = (a: number, b: number, within = 1e-9): void => {
  assert.ok(Math.abs(a - b) <= within, `${String(a)} is not ${String(b)}`);
};

/** The float literals of `listing`, as numbers. */
const literals = (listing: string): number[] =>
  [...listing.matchAll(/-?\d+\.\d+(?:e-?\d+)?|-?\d+e-?\d+/g)].map(([text]) =>
    Number(text),
  );

describe('the world frame', () => {
  it('hangs the cube 1.1 m over the sand beneath its middle', () => {
    const [x, , z] = toWorld([0.5, 0, 0.5]);
    close(CUBE_BOX.min[1] - islandHeight([x, z]), 1.1);
    close(CUBE_BOX.max[1] - CUBE_BOX.min[1], CUBE_METRES);
  });

  it('takes a point to the world and back', () => {
    const c: Vec3 = [0.2, -ROOM_HEIGHT, 0.9];
    for (const [axis, value] of toCube(toWorld(c)).entries()) {
      close(value, c[axis] ?? Number.NaN);
    }
  });

  it("turns the interior in its shell about the cube's middle, the shell staying the world's", () => {
    const middle = toWorld([0.5, 0, 0.5]);
    close(middle[0], CUBE_AT[0] + CUBE_METRES / 2);
    close(middle[2], CUBE_AT[2] + CUBE_METRES / 2);
    // A corner of the room is a corner of the shell, and up is up.
    const corner = toWorld([0, 1, 0]);
    close(Math.abs(corner[0] - middle[0]), CUBE_METRES / 2);
    close(Math.abs(corner[2] - middle[2]), CUBE_METRES / 2);
    close(corner[1], CUBE_AT[1] + CUBE_METRES);
    for (const turn of QUARTER_TURNS) {
      const there = toRoom(toShell([0.2, 0.3, 0.9], 1, turn), 1, turn);
      for (const [axis, value] of [0.2, 0.3, 0.9].entries()) {
        close(there[axis] ?? Number.NaN, value);
      }
      close(yawToRoom(yawToShell(0.4, turn), turn), 0.4);
    }
    // One quarter counter-clockwise from above: the room's east is north.
    assert.deepEqual(turnedToShell([1, 0, 0], 1), [0, 0, -1]);
    assert.deepEqual(toShell([1, 0, 1], 1, 1), [1, 0, 0]);
    close(Math.cos(yawToShell(0, 1)), 0);
    close(Math.sin(yawToShell(0, 1)), -1);
  });

  it('opens the doorway in the east face, by the north-east corner', () => {
    close(DOORWAY_BOX.min[0], CUBE_BOX.max[0]);
    close(DOORWAY_BOX.min[1], CUBE_AT[1]);
    close(DOORWAY_BOX.min[2] - CUBE_AT[2], 0.274);
    close(DOORWAY_BOX.max[2] - CUBE_AT[2], 1.244);
    close(DOORWAY_BOX.max[1] - DOORWAY_BOX.min[1], 2.1);
  });

  it('wakes the player on dry sand south-west, above any swash', () => {
    const [x, y, z] = WAKE_AT;
    close(islandHeight([x, z]), y, 1e-6);
    assert.ok(y >= 0.32 && y < 0.4, String(y));
    assert.ok(x < 0 && z > 0);
    close(x, -z);
    const away = Math.hypot(x, z);
    assert.ok(away > 22 && away < 25, String(away));
  });

  it('gives the shader the numbers the script reads', () => {
    for (const value of [...CUBE_AT, ...CUBE_BOX.min, ...DOORWAY_BOX.max]) {
      assert.ok(literals(WORLD.listing).includes(Number(f32(value))));
    }
  });
});
