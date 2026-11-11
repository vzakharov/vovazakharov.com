import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { HoleOf } from './hole';
import type { Pose } from './pose';
import { type Room, roomKey } from './room';
import { sight, withBelow } from './rooms';

const pose: Pose = {
  n: 66,
  x: 1n << 60n,
  y: 1n << 61n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  scale: 1,
  yaw: 0,
  elevation: 0,
};

const keys = (rooms: readonly Room[]): string[] =>
  rooms.map((room) => roomKey(room)).toSorted();

describe('withBelow', () => {
  it('sees no floor below when no near room has a hole', () => {
    const seen = sight(pose, 3);
    assert.equal(seen.near.length, 49);
    assert.deepEqual(withBelow(seen, () => null).below, []);
  });

  it('sees exactly the four rooms under the one holed room', () => {
    const holed = { n: 66, x: pose.x + 2n, y: pose.y - 1n };
    const holeOf: HoleOf = (room) =>
      roomKey(room) === roomKey(holed) ? { qx: 1, qy: 1 } : null;
    const { below } = withBelow(sight(pose, 3), holeOf);
    assert.deepEqual(
      keys(below),
      keys([
        { n: 67, x: 2n * holed.x, y: 2n * holed.y },
        { n: 67, x: 2n * holed.x + 1n, y: 2n * holed.y },
        { n: 67, x: 2n * holed.x, y: 2n * holed.y + 1n },
        { n: 67, x: 2n * holed.x + 1n, y: 2n * holed.y + 1n },
      ]),
    );
  });
});
