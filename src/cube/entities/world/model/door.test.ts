import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import { doorFrame, doorLeaf, doorLook, leafLine } from './door';
import type { DoorWall } from './wall-frame';

const WALL: DoorWall = { n: 3, x: 1n, y: 2n, isEast: true };

/** The first walls along a row of floor 6, one of them hung on each jamb. */
const ROW: DoorWall[] = Array.from({ length: 24 }, (_, x) => ({
  n: 6,
  x: BigInt(x),
  y: 3n,
  isEast: true,
}));

describe('a door', () => {
  const shut = doorLeaf(WALL, { angle: 0, toward: 1 });

  it('looks the same each time its wall is asked', () => {
    assert.deepEqual(doorLook(WALL), doorLook({ ...WALL }));
  });

  it('hangs on either jamb, wall by wall', () => {
    const hinges = new Set(ROW.map((wall) => doorLook(wall).hinge));
    assert.deepEqual([...hinges].toSorted(), ['from', 'to']);
  });

  it('is painted wood with chrome, steel and paper, and no wainscot', () => {
    const surfaces = new Set(shut.map(({ surface }) => surface));
    assert.deepEqual([...surfaces].toSorted(), ['metal', 'paper', 'wood']);
    assert.ok(shut.some(({ paint }) => paint === doorLook(WALL).paint));
  });

  it('shows its lever and plates on both faces when shut', () => {
    const rooms = new Set(
      shut
        .filter(({ surface }) => surface !== 'wood')
        .map(({ room }) => room.x),
    );
    assert.deepEqual(rooms, new Set([1n, 2n]));
  });

  it('stands in its two rooms however it swings', () => {
    for (const angle of [0, 0.7, 1.5]) {
      for (const toward of [1, -1] as const) {
        for (const { room } of doorLeaf(WALL, { angle, toward })) {
          assert.ok(room.x === 1n || room.x === 2n);
          assert.equal(room.y, 2n);
        }
      }
    }
  });

  it('swings its free edge off the wall, into the room it swings toward', () => {
    for (const wall of ROW) {
      const { hinge, edge } = leafLine({ ...wall, angle: 1, toward: -1 });
      assert.ok(hinge > DOORWAY_CUT.from && hinge < DOORWAY_CUT.to);
      assert.ok(edge[1] < 0);
      const shutEdge = leafLine({ ...wall, angle: 0, toward: 1 }).edge[0];
      assert.ok(shutEdge > DOORWAY_CUT.from && shutEdge < DOORWAY_CUT.to);
    }
  });

  it('is framed in white wood on both sides of its wall', () => {
    const frame = doorFrame(WALL);
    assert.ok(frame.every(({ surface }) => surface === 'wood'));
    assert.deepEqual(
      new Set(frame.map(({ room }) => room.x)),
      new Set([1n, 2n]),
    );
  });
});
