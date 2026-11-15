import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import { doorFrame, doorLeaf, doorLook, type Facing, leafLine } from './door';
import { maze } from './maze';
import { planted } from './planted';
import { farSideOf } from './portal';
import { portalsOf } from './portals';
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

  it('is painted wood with chrome, steel and paper', () => {
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

/**
 * How far to the right of one walking through `way` its leaf's hinge stands,
 * and how far ahead of them its free edge, the leaf a radian open.
 */
function leafBefore(way: Facing) {
  const { hinge, edge } = leafLine({ ...way, angle: 1 });
  const south = (hinge - DOORWAY_CUT.middle) * way.toward;
  return { right: way.isEast ? south : -south, ahead: edge[1] * way.toward };
}

describe('a portal’s leaf', () => {
  const rolled = maze(planted.seed);
  const MINUTE = 60_000;
  /** Every way through a portal of floors 6 to 8, with where it leads in each of six minutes. */
  const pairs = [6, 7, 8]
    .flatMap((n) => portalsOf(rolled, n))
    .flatMap(({ wall }) =>
      ([1, -1] as const).flatMap((toward) =>
        [0, 1, 2, 3, 4, 5].flatMap((minute) => {
          const near: Facing = { ...wall, toward };
          const far = farSideOf(near, minute * MINUTE);
          return far === null ? [] : [{ near, far }];
        }),
      ),
    );

  it('is tried on east and south walls, alike and across, both ways through', () => {
    const kinds = new Set(
      pairs.map(
        ({ near, far }) =>
          `${String(near.isEast)}>${String(far.isEast)}@${String(near.toward)}`,
      ),
    );
    assert.equal(kinds.size, 8);
  });

  it('hangs on the same hand of one walking through, before the threshold and past it', () => {
    for (const { near, far } of pairs) {
      const before = leafBefore(near);
      const after = leafBefore(far);
      assert.equal(Math.sign(after.right), Math.sign(before.right));
      assert.equal(Math.sign(before.right), -near.toward);
      assert.ok(Math.abs(after.right - before.right) < 1e-9);
    }
  });

  it('swings ahead of one walking through, on both floors', () => {
    for (const { near, far } of pairs) {
      assert.ok(leafBefore(near).ahead > 0);
      assert.ok(
        Math.abs(leafBefore(far).ahead - leafBefore(near).ahead) < 1e-9,
      );
    }
  });

  it('is one paint on a hub and each of its spokes', () => {
    for (const { near, far } of pairs) {
      assert.equal(doorLook(far).paint, doorLook(near).paint);
    }
  });

  it('varies from portal to portal, so its colour marks none of them out', () => {
    const paints = new Set(pairs.map(({ near }) => doorLook(near).paint));
    assert.ok(paints.size > 1);
  });
});
