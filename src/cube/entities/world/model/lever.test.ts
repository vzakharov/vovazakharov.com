import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { holeQuarter, type Quarter } from './hole';
import { type Lever, leverOf } from './lever';
import { isOpenEast, isOpenSouth, maze, type RolledMaze } from './maze';
import { plant } from './plant';
import { counterRandom } from './plant.test-kit';
import { type Room, roomsAcross } from './room';

const FLOORS = 6;

/** Whether the room beyond `room` by `(dx, dy)` is a room it opens onto. */
function opensTo(rolled: RolledMaze, room: Room, dx: bigint, dy: bigint) {
  const { n, x, y } = room;
  const [bx, by] = [x + dx, y + dy];
  const last = roomsAcross(n) - 1n;
  if (bx < 0n || by < 0n || bx > last || by > last) return false;
  if (dx !== 0n) return isOpenEast(rolled, n, dx < 0n ? bx : x, y);
  return isOpenSouth(rolled, n, x, dy < 0n ? by : y);
}

/** What the rule says of `room`'s lever, from the wall predicate alone. */
function expected(rolled: RolledMaze, room: Room, { qx, qy }: Quarter) {
  const xWall = !opensTo(rolled, room, qx === 0 ? -1n : 1n, 0n);
  const yWall = !opensTo(rolled, room, 0n, qy === 0 ? -1n : 1n);
  if (xWall) return 'x-wall';
  return yWall ? 'y-wall' : 'post';
}

/** The lever sits on its quarter's outer side, facing into the room. */
function assertPlaced({ mount, at, facing }: Lever, { qx, qy }: Quarter) {
  const step = { u: at.u + facing.u * 0.1, v: at.v + facing.v * 0.1 };
  assert.ok(step.u > 0 && step.u < 1 && step.v > 0 && step.v < 1);
  if (mount === 'x-wall') assert.deepEqual(at, { u: qx, v: (qy + 0.5) / 2 });
  if (mount === 'y-wall') assert.deepEqual(at, { u: (qx + 0.5) / 2, v: qy });
  if (mount === 'post') {
    assert.ok(Math.abs(at.u - qx) < 0.05 && Math.abs(at.v - qy) < 0.05);
  }
}

describe('leverOf', () => {
  it('mounts each planted hole room’s lever by the wall predicate', async () => {
    const { world, answers } = await plant(FLOORS, counterRandom());
    const rolled = maze(world.seed);
    const rooms = answers.map((landing, index) => ({
      n: index + 1,
      x: landing.x >> 1n,
      y: landing.y >> 1n,
    }));
    const quarters = await Promise.all(
      rooms.map(async ({ n, x, y }) => holeQuarter(world, n, x, y)),
    );
    for (const [index, room] of rooms.entries()) {
      const quarter = quarters[index];
      assert.ok(quarter);
      const lever = leverOf(rolled, room, quarter);
      assert.equal(lever.mount, expected(rolled, room, quarter));
      assertPlaced(lever, quarter);
    }
  });

  it('follows the rule in every room and quarter of a floor, each mount met', () => {
    const rolled = maze('8675309');
    const n = 5;
    const side = roomsAcross(n);
    const met = new Set<string>();
    for (let y = 0n; y < side; y += 1n) {
      for (let x = 0n; x < side; x += 1n) {
        for (const quarter of [
          { qx: 0, qy: 0 },
          { qx: 1, qy: 0 },
          { qx: 0, qy: 1 },
          { qx: 1, qy: 1 },
        ] as const) {
          const room = { n, x, y };
          const lever = leverOf(rolled, room, quarter);
          assert.equal(lever.mount, expected(rolled, room, quarter));
          assertPlaced(lever, quarter);
          met.add(lever.mount);
        }
      }
    }
    assert.deepEqual([...met].toSorted(), ['post', 'x-wall', 'y-wall']);
  });
});
