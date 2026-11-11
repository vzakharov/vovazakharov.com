import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { HoleOf } from './hole';
import type { Pose } from './pose';
import { type Room, roomKey, roomsAcross } from './room';
import { seenFrom, sight, withBelow } from './rooms';
import type { Walls } from './walls';

const pose: Pose = {
  n: 66,
  x: 1n << 60n,
  y: 1n << 61n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  yaw: 0,
  elevation: 0,
};

const keys = (rooms: readonly Room[]): string[] =>
  rooms.map((room) => roomKey(room)).toSorted();

const closed: Walls = { isOpenEast: () => false, isOpenSouth: () => false };

/** Open only along the eye's row, east of it, for `length` rooms. */
const eastward = (length: number): Walls => ({
  isOpenEast: (_, x, y) =>
    y === pose.y && x >= pose.x && x < pose.x + BigInt(length),
  isOpenSouth: () => false,
});

describe('sight', () => {
  it('sees the eye’s own room first, walled in or not', () => {
    assert.deepEqual(keys(sight(pose, 24, closed).near), keys([pose]));
    assert.equal(
      roomKey(sight(pose, 24, eastward(3)).near[0] ?? pose),
      roomKey(pose),
    );
  });

  it('puts over each near room the room whose slab it is', () => {
    const { near, above } = sight(pose, 24, eastward(5));
    assert.equal(near.length, 6);
    assert.deepEqual(
      keys(above),
      keys(
        [...new Set(near.map(({ x, y }) => `${x >> 1n}/${y >> 1n}`))].map(
          (cell) => {
            const [x = '', y = ''] = cell.split('/');
            return { n: 65, x: BigInt(x), y: BigInt(y) };
          },
        ),
      ),
    );
  });
});

describe('withBelow', () => {
  it('sees no floor below when no near room has a hole', () => {
    const seen = sight(pose, 24, eastward(4));
    assert.deepEqual(withBelow(seen, () => null).below, []);
  });

  it('sees exactly the four rooms under the one holed room', () => {
    const { n, x, y } = pose;
    const holed = { n, x: x + 2n, y };
    const holeOf: HoleOf = (room) =>
      roomKey(room) === roomKey(holed) ? { qx: 1, qy: 1 } : null;
    const { below } = withBelow(sight(pose, 24, eastward(4)), holeOf);
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

const N = 66;
const X = 1n << 60n;
const Y = (1n << 61n) + 7n;

/** A room `east` and `south` of `(X, Y)` on floor 66. */
const at = (east: number, south: number): Room => ({
  n: N,
  x: X + BigInt(east),
  y: Y + BigInt(south),
});

const isRoom = (n: number, x: bigint, y: bigint): boolean =>
  x >= 0n && y >= 0n && x < roomsAcross(n) && y < roomsAcross(n);

/**
 * Walls closed everywhere but between the listed rooms' neighbours: each pair
 * of consecutive rooms of a path is one opening. Asking past the cube throws,
 * so a test fails if the walk ever reaches beyond it.
 */
function pathWalls(...paths: Room[][]): Walls {
  const open = new Set<string>();
  for (const path of paths) {
    for (const [i, room] of path.entries()) {
      const next = path[i + 1];
      if (next === undefined) break;
      const west = next.x < room.x || next.y < room.y ? next : room;
      const side = next.x === room.x ? 'S' : 'E';
      open.add(`${side} ${roomKey(west)}`);
    }
  }
  const ask = (side: string) => (n: number, x: bigint, y: bigint) => {
    if (!isRoom(n, x, y)) throw new Error(`Asked past the cube: ${x}, ${y}`);
    return open.has(`${side} ${roomKey({ n, x, y })}`);
  };
  return { isOpenEast: ask('E'), isOpenSouth: ask('S') };
}

/** The straight run of rooms from `from` to `to`, both ends included. */
const run = ({ n, x, y }: Room, to: Room): Room[] => {
  const dx = Number(to.x - x);
  const dy = Number(to.y - y);
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  return Array.from({ length: steps + 1 }, (_, i) => ({
    n,
    x: x + BigInt(Math.sign(dx) * i),
    y: y + BigInt(Math.sign(dy) * i),
  }));
};

const keySet = (rooms: readonly Room[]): Set<string> =>
  new Set(rooms.map((room) => roomKey(room)));

describe('seenFrom', () => {
  it('sees its own room behind four closed walls', () => {
    assert.deepEqual(
      keySet(seenFrom(at(0, 0), 24, pathWalls())),
      keySet([at(0, 0)]),
    );
  });

  it('sees a straight corridor to its end', () => {
    const corridor = run(at(0, 0), at(12, 0));
    const seen = seenFrom(at(0, 0), 24, pathWalls(corridor));
    assert.deepEqual(keySet(seen), keySet(corridor));
  });

  it('stops a corridor at the far bound', () => {
    const corridor = run(at(0, 0), at(-40, 0));
    const seen = keySet(seenFrom(at(0, 0), 10, pathWalls(corridor)));
    assert.ok(seen.has(roomKey(at(-11, 0))));
    assert.ok(!seen.has(roomKey(at(-12, 0))));
  });

  it('sees nothing behind a solid wall', () => {
    const corridor = run(at(0, 0), at(0, 5));
    const beyond = run(at(1, 0), at(1, 5));
    const seen = keySet(seenFrom(at(0, 0), 24, pathWalls(corridor, beyond)));
    for (const room of beyond) assert.ok(!seen.has(roomKey(room)));
  });

  it('sees round an L-turn as far as a line bends', () => {
    const leg = run(at(0, 0), at(5, 0));
    const turn = run(at(5, 0), at(5, 6));
    const seen = keySet(seenFrom(at(0, 0), 24, pathWalls(leg, turn)));
    for (const room of leg) assert.ok(seen.has(roomKey(room)));
    for (const room of turn.slice(2)) {
      assert.ok(!seen.has(roomKey(room)), roomKey(room));
    }
  });

  it('sees through a side door but not back along it', () => {
    const corridor = run(at(0, 0), at(4, 0));
    const side = run(at(4, 0), at(4, -1));
    const back = run(at(4, -1), at(0, -1));
    const seen = keySet(
      seenFrom(at(0, 0), 24, pathWalls(corridor, side, back)),
    );
    assert.ok(seen.has(roomKey(at(4, -1))));
    for (const room of back.slice(1)) assert.ok(!seen.has(roomKey(room)));
  });

  it('never asks past the cube from its corner', () => {
    const corner: Room = { n: 3, x: 0n, y: 0n };
    const corridor = run(corner, { n: 3, x: 3n, y: 0n });
    const down = run({ n: 3, x: 3n, y: 0n }, { n: 3, x: 3n, y: 3n });
    const seen = seenFrom(corner, 24, pathWalls(corridor, down));
    assert.ok(keySet(seen).has('3/3/1'));
  });
});
