import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEEPEST_FLOOR, maze } from './maze';
import { mazeWalls } from './walls';

describe('mazeWalls', () => {
  const walls = mazeWalls(maze('8675309'));
  const last = DEEPEST_FLOOR + 1;
  const far = (1n << BigInt(last - 1)) - 2n;

  it('opens some wall of the deepest floor the maze places', () => {
    const sides = [0n, 1n, 2n, 3n].flatMap((x) =>
      [0n, 1n, 2n, 3n].flatMap((y) => [
        walls.isOpenEast(DEEPEST_FLOOR, x, y),
        walls.isOpenSouth(DEEPEST_FLOOR, x, y),
      ]),
    );
    assert.ok(sides.includes(true));
  });

  it('closes every wall of the floor past it, without asking the maze', () => {
    for (const [x, y] of [
      [0n, 0n],
      [far, far],
      [far, 0n],
    ] as const) {
      assert.equal(walls.isOpenEast(last, x, y), false);
      assert.equal(walls.isOpenSouth(last, x, y), false);
    }
  });
});
