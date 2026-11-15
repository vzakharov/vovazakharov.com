import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Sides } from '@/cube/shared/lib/sides';
import { type Room, roomKey } from '@/cube/entities/world';

import { roomStateOf } from './room-state';

const NONE: Sides = [false, false, false, false];
const ALL: Sides = [true, true, true, true];

/** Floor 3's room (1, 1), with a room on every side of it. */
const room: Room = { n: 3, x: 1n, y: 1n };
const at = (dx: bigint, dy: bigint): Room => ({ n: 3, x: 1n + dx, y: 1n + dy });

/** A floor whose rooms are open all round but for `walled`, by room key. */
const closedOf =
  (walled: Record<string, Sides>) =>
  (asked: Room): Sides =>
    walled[roomKey(asked)] ?? NONE;

const everyLamp = () => true;

describe('roomStateOf', () => {
  it('on an open, lit floor sees light from all eight rooms, and no wall', () => {
    assert.deepEqual(roomStateOf(room, closedOf({}), everyLamp), {
      closed: NONE,
      lampsOn: true,
      litBeside: ALL,
      litAcross: ALL,
      waysAcross: [ALL, ALL],
      wallsBeside: [NONE, NONE],
    });
  });

  it('takes no light through a closed side, its lamps working or not', () => {
    const state = roomStateOf(
      room,
      closedOf({ [roomKey(room)]: [true, false, false, false] }),
      everyLamp,
    );
    assert.deepEqual(state.litBeside, [false, true, true, true]);
    // South-east is still reached by way of the south room, north-east of the north.
    assert.deepEqual(state.waysAcross, [
      [false, true, true, true],
      [true, true, true, false],
    ]);
    assert.deepEqual(state.litAcross, ALL);
  });

  it('crosses a corner by either room beside it, and not when both are shut', () => {
    // The east room's south side and the south room's east side are closed.
    const shut = closedOf({
      [roomKey(at(1n, 0n))]: [false, true, false, false],
      [roomKey(at(0n, 1n))]: [true, false, false, false],
    });
    const state = roomStateOf(room, shut, everyLamp);
    assert.deepEqual(state.waysAcross, [
      [false, true, true, true],
      [false, true, true, true],
    ]);
    assert.deepEqual(state.litAcross, [false, true, true, true]);
  });

  it('names the rooms whose lamps work, not its own alone', () => {
    const dark = roomKey(at(1n, 1n));
    const state = roomStateOf(
      room,
      closedOf({}),
      (asked) => roomKey(asked) !== dark && roomKey(asked) !== roomKey(room),
    );
    assert.equal(state.lampsOn, false);
    assert.deepEqual(state.litBeside, ALL);
    assert.deepEqual(state.litAcross, [false, true, true, true]);
  });

  it('knows the walls that end on its corners from the rooms beside it', () => {
    // The south room's east side is closed: a wall along the east line, past
    // the south-east corner, which is the side after east.
    const state = roomStateOf(
      room,
      closedOf({ [roomKey(at(0n, 1n))]: [true, false, false, false] }),
      everyLamp,
    );
    assert.deepEqual(state.wallsBeside, [[true, false, false, false], NONE]);
    // And from the north room, the side before east.
    const north = roomStateOf(
      room,
      closedOf({ [roomKey(at(0n, -1n))]: [true, false, false, false] }),
      everyLamp,
    );
    assert.deepEqual(north.wallsBeside, [NONE, [true, false, false, false]]);
  });

  it('asks nothing of a room off the floor’s edge', () => {
    const corner: Room = { n: 3, x: 0n, y: 0n };
    const asked: Room[] = [];
    const state = roomStateOf(
      corner,
      (of) => {
        asked.push(of);
        return roomKey(of) === roomKey(corner)
          ? [false, false, true, true]
          : NONE;
      },
      everyLamp,
    );
    assert.ok(asked.every(({ x, y }) => x >= 0n && y >= 0n));
    assert.deepEqual(state.wallsBeside, [NONE, NONE]);
  });
});
