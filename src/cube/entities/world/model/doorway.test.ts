import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { doorLeaf, type DoorWall } from './doorway';

const WALL: DoorWall = { n: 3, x: 1n, y: 2n, isEast: true };

describe('a door leaf', () => {
  const shut = doorLeaf(WALL, { angle: 0, toward: 1 });

  it('is wood with a handle, and nothing of the wall’s wainscot', () => {
    const surfaces = new Set(shut.map(({ surface }) => surface));
    assert.deepEqual([...surfaces].toSorted(), ['handle', 'wood']);
  });

  it('shows panels and a knob on both faces when shut', () => {
    const rooms = (surface: string) =>
      new Set(
        shut
          .filter(
            (quad) => quad.surface === surface && quad.paint !== undefined,
          )
          .map(({ room }) => room.x),
      );
    assert.deepEqual(rooms('handle'), new Set([1n, 2n]));
    assert.deepEqual(rooms('wood'), new Set([1n, 2n]));
  });

  it('stays a few quads', () => {
    assert.ok(shut.length <= 24);
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
});
