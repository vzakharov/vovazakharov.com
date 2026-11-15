import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import { WALL_HALF } from '@/cube/shared/lib/room-shape';

import { mazeDoored } from './doorway';
import { type Hint, hintFacets, hintsBeside, hintsSeen } from './hint';
import { maze } from './maze';
import { sidesOf } from './mount';
import { planted } from './planted';
import { PORTALS } from './portal-counts';
import { portalsOf } from './portals';
import { type Room, roomKey } from './room';
import type { View } from './rooms';
import type { DoorWall } from './wall-frame';

const rolled = maze('8675309');

const east: DoorWall = { n: 6, x: 3n, y: 5n, isEast: true };
const south: DoorWall = { n: 6, x: 3n, y: 5n, isEast: false };

const viewOf = (near: readonly Room[]): View => ({
  near,
  below: [],
  above: [],
  overhead: null,
  topmost: null,
});

/** The rooms `hints` hang in, by `roomKey`. */
const keysOf = (hints: readonly Hint[]): string[] =>
  hints.map(({ room }) => roomKey(room));

/** The board's extent along its wall and its reader's right, in its room's frame. */
function along(hint: Hint, isEast: boolean) {
  const [facet] = hintFacets(hint, { origin: [0, 0, 0], roomSide: 1 });
  assert.ok(facet);
  const [bottomLeft, bottomRight] = facet.corners;
  const axis = isEast ? 2 : 0;
  const ends = [bottomLeft[axis], bottomRight[axis]];
  return {
    from: Math.min(...ends),
    to: Math.max(...ends),
    rightward: Math.sign(bottomRight[axis] - bottomLeft[axis]),
    off: bottomLeft[isEast ? 0 : 2],
  };
}

describe('hintsBeside', () => {
  it('hangs one board in each room the wall stands between', () => {
    assert.deepEqual(keysOf(hintsBeside(east)), [
      roomKey({ n: 6, x: 3n, y: 5n }),
      roomKey({ n: 6, x: 4n, y: 5n }),
    ]);
    assert.deepEqual(keysOf(hintsBeside(south)), [
      roomKey({ n: 6, x: 3n, y: 5n }),
      roomKey({ n: 6, x: 3n, y: 6n }),
    ]);
  });

  for (const [name, wall] of [
    ['east', east],
    ['south', south],
  ] as const) {
    it(`keeps a board on the ${name} wall clear of the doorway, on the wall`, () => {
      for (const hint of hintsBeside(wall)) {
        const { from, to } = along(hint, wall.isEast);
        assert.ok(from > 0 && to < 1);
        assert.ok(to < DOORWAY_CUT.from || from > DOORWAY_CUT.to);
      }
    });

    it(`stands each board on the ${name} wall just off its own face of it`, () => {
      const [near, far] = hintsBeside(wall).map(
        (hint) => along(hint, wall.isEast).off,
      );
      assert.ok(near !== undefined && far !== undefined);
      assert.ok(near < 1 - WALL_HALF && near > 1 - 2 * WALL_HALF);
      assert.ok(far > WALL_HALF && far < 2 * WALL_HALF);
    });

    it(`points each board on the ${name} wall at the door as its reader sees it`, () => {
      for (const hint of hintsBeside(wall)) {
        const { from, to, rightward } = along(hint, wall.isEast);
        const doorAhead = DOORWAY_CUT.middle > (from + to) / 2 ? 1 : -1;
        assert.equal(hint.doorOnRight, doorAhead === rightward);
      }
    });
  }

  it('points the two faces of one wall opposite ways', () => {
    for (const wall of [east, south]) {
      const [near, far] = hintsBeside(wall);
      assert.notEqual(near?.doorOnRight, far?.doorOnRight);
    }
  });
});

describe('hintsSeen', () => {
  const [portal] = portalsOf(rolled, PORTALS.first);
  assert.ok(portal);
  const sides = hintsBeside(portal.wall).map(({ room }) => room);

  it('shows both boards of the first portal with both its rooms in view', () => {
    assert.deepEqual(
      keysOf(hintsSeen(rolled, viewOf(sides))),
      sides.map((room) => roomKey(room)),
    );
  });

  it('shows only the board of the room in view', () => {
    const [near] = sides;
    assert.ok(near);
    assert.deepEqual(keysOf(hintsSeen(rolled, viewOf([near]))), [
      roomKey(near),
    ]);
  });

  it('shows none on a deeper floor, whatever portals it has', () => {
    const [deeper] = portalsOf(rolled, PORTALS.first + 1);
    assert.ok(deeper);
    const rooms = hintsBeside(deeper.wall).map(({ room }) => room);
    assert.deepEqual(hintsSeen(rolled, viewOf(rooms)), []);
  });
});

describe('the planted world’s first portal', () => {
  const world = maze(planted.seed);
  const [portal] = portalsOf(world, PORTALS.first);
  assert.ok(portal);
  const { wall } = portal;

  // Where a portal's wall counts as a door, a room's sale sign or poster takes
  // a plain wall before it, so with one to spare neither hangs over the hint.
  it('leaves each room beside it a plain wall other than the portal’s', () => {
    const walls = mazeDoored(world);
    for (const [at, { room }] of hintsBeside(wall).entries()) {
      // `STEPS` runs east, south, west, north.
      const own = (wall.isEast ? 0 : 1) + 2 * at;
      const spare = sidesOf(walls, room).filter(
        (side, index) => index !== own && side.is === 'wall',
      );
      assert.ok(spare.length > 0);
    }
  });
});
