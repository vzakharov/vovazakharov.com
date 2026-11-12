import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type HoleOf, QUARTERS, under } from './hole';
import { isLanding, landingsSeen } from './landing';
import { maze } from './maze';
import { type Room, roomKey } from './room';
import { mazeWalls } from './walls';

const walls = mazeWalls(maze('8675309'));

const top: Room = { n: 1, x: 0n, y: 0n };
const quarter = { qx: 1, qy: 0 } as const;
/** The hole in floor 1's east-north quarter, and nowhere else. */
const oneHole: HoleOf = ({ n }) => (n === 1 ? quarter : null);
const landed = under(top, quarter);
/** Floor 2's four rooms, under floor 1's one. */
const floor2 = QUARTERS.map((q) => under(top, q));

describe('isLanding', () => {
  it('is the one room under the floor above’s hole', () => {
    const landings = floor2.filter((room) => isLanding(room, oneHole));
    assert.deepEqual(
      landings.map((room) => roomKey(room)),
      [roomKey(landed)],
    );
  });

  it('is never a room of floor 1, which nothing is over', () => {
    assert.equal(isLanding(top, oneHole), false);
  });
});

describe('landingsSeen', () => {
  it('hangs a board in the landing among the rooms in view, and only there', () => {
    const view = {
      near: floor2,
      below: [],
      above: [top],
      overhead: top,
      topmost: null,
    };
    const landings = landingsSeen(walls, view, oneHole);
    assert.deepEqual(
      landings.map(({ room }) => roomKey(room)),
      [roomKey(landed)],
    );
    for (const { mount } of landings) {
      assert.equal(Math.hypot(mount.facing.u, mount.facing.v), 1);
    }
  });
});
