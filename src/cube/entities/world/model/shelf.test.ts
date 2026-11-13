import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { holeQuarter, type Quarter } from './hole';
import { isOpenEast, isOpenSouth, maze, type RolledMaze } from './maze';
import { PILL_LENGTH } from './pill';
import { plant } from './plant';
import { counterRandom } from './plant.test-kit';
import { type Room, roomsAcross } from './room';
import { pillOn, type Shelf, shelfFaces, shelfOf, takenIn } from './shelf';

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

/** What the rule says of `room`'s shelf, from the wall predicate alone. */
function expected(rolled: RolledMaze, room: Room, { qx, qy }: Quarter) {
  const xWall = !opensTo(rolled, room, qx === 0 ? -1n : 1n, 0n);
  const yWall = !opensTo(rolled, room, 0n, qy === 0 ? -1n : 1n);
  if (xWall) return 'x-wall';
  return yWall ? 'y-wall' : 'post';
}

/** The shelf sits on its quarter's outer side, facing into the room. */
function assertPlaced({ mount, at, facing }: Shelf, { qx, qy }: Quarter) {
  const step = { u: at.u + facing.u * 0.1, v: at.v + facing.v * 0.1 };
  assert.ok(step.u > 0 && step.u < 1 && step.v > 0 && step.v < 1);
  if (mount === 'x-wall') assert.deepEqual(at, { u: qx, v: (qy + 0.5) / 2 });
  if (mount === 'y-wall') assert.deepEqual(at, { u: (qx + 0.5) / 2, v: qy });
  if (mount === 'post') {
    assert.ok(Math.abs(at.u - qx) < 0.05 && Math.abs(at.v - qy) < 0.05);
  }
}

describe('shelfOf', () => {
  it('mounts each planted hole room’s shelf by the wall predicate', async () => {
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
      const shelf = shelfOf(rolled, room, quarter);
      assert.equal(shelf.mount, expected(rolled, room, quarter));
      assertPlaced(shelf, quarter);
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
          const shelf = shelfOf(rolled, room, quarter);
          assert.equal(shelf.mount, expected(rolled, room, quarter));
          assertPlaced(shelf, quarter);
          met.add(shelf.mount);
        }
      }
    }
    assert.deepEqual([...met].toSorted(), ['post', 'x-wall', 'y-wall']);
  });
});

const WALL: Shelf = {
  mount: 'x-wall',
  at: { u: 0, v: 0.25 },
  facing: { u: 1, v: 0 },
};
const ROOM = { n: 3, x: 1n, y: 2n };

describe('shelfFaces', () => {
  it('lays a pill on the shelf, inside the room, until it is taken', () => {
    const full = shelfFaces(WALL, ROOM, [0, 0, 0], 1, false);
    const bare = shelfFaces(WALL, ROOM, [0, 0, 0], 1, true);
    const pill = full.filter((q) => q.surface === 'plastic');
    assert.ok(pill.length > 0);
    assert.equal(bare.length, full.length - pill.length);
    assert.ok(!bare.some((q) => q.surface === 'plastic'));
    const { centre } = pillOn(WALL);
    const top = Math.max(
      ...bare
        .filter((q) => q.surface !== 'plate')
        .flatMap((q) => q.corners.map((c) => c[1])),
    );
    for (const { corners } of pill) {
      for (const [x, y, z] of corners) {
        assert.ok(x > 0 && x < 0.05, 'out of the wall, over the shelf');
        assert.ok(y >= top - 1e-9, 'on the paper, not in it');
        const off = Math.hypot(x - centre[0], y - centre[1], z - centre[2]);
        assert.ok(off < PILL_LENGTH / 2 + 1e-4, 'no longer than a pill');
      }
    }
    assert.equal(new Set(pill.map((q) => q.paint)).size, 2, 'two halves');
  });

  it('places and scales with the room it is drawn in', () => {
    const near = shelfFaces(WALL, ROOM, [0, 0, 0], 1, false);
    const far = shelfFaces(WALL, ROOM, [2, -0.5, 1], 0.5, false);
    assert.equal(far.length, near.length);
    for (const [index, quad] of near.entries()) {
      for (const [c, corner] of quad.corners.entries()) {
        const moved = far[index]?.corners[c];
        assert.ok(moved);
        assert.ok(Math.abs(moved[0] - (2 + corner[0] / 2)) < 1e-12);
        assert.ok(Math.abs(moved[1] - (corner[1] / 2 - 0.5)) < 1e-12);
        assert.ok(Math.abs(moved[2] - (1 + corner[2] / 2)) < 1e-12);
      }
    }
  });

  it('stands a post under a shelf no wall holds', () => {
    const post = shelfFaces(
      { mount: 'post', at: { u: 0.03, v: 0.015 }, facing: { u: 1, v: 0 } },
      ROOM,
      [0, 0, 0],
      1,
      false,
    );
    assert.equal(post.filter((q) => q.surface === 'trim').length, 6);
  });
});

describe('takenIn', () => {
  it('is of the one room whose pill is off its shelf', () => {
    assert.equal(takenIn(null, ROOM), false);
    assert.equal(takenIn({ room: ROOM }, ROOM), true);
    assert.equal(takenIn({ room: { ...ROOM, x: 0n } }, ROOM), false);
  });
});
