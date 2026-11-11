import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOpenEast, isOpenSouth, maze, type RolledMaze } from './maze';

const SEEDS = ['1', '8675309'];

const sideOf = (n: number) => Number(1n << BigInt(n - 1));

/** Every open wall of floor `n`, spelled `E x y` / `S x y`, by the predicates. */
function openWalls(rolled: RolledMaze, n: number): Set<string> {
  const side = sideOf(n);
  const open = new Set<string>();
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      if (x + 1 < side && isOpenEast(rolled, n, BigInt(x), BigInt(y))) {
        open.add(`E ${x} ${y}`);
      }
      if (y + 1 < side && isOpenSouth(rolled, n, BigInt(x), BigInt(y))) {
        open.add(`S ${x} ${y}`);
      }
    }
  }
  return open;
}

/** The rooms reachable from (0, 0) through the open walls. */
function reachable(open: Set<string>): Set<string> {
  const seen = new Set<string>(['0 0']);
  const queue: Array<[number, number]> = [[0, 0]];
  for (let next = queue.pop(); next; next = queue.pop()) {
    const [x, y] = next;
    const steps: Array<[number, number, boolean]> = [
      [x + 1, y, open.has(`E ${x} ${y}`)],
      [x - 1, y, open.has(`E ${x - 1} ${y}`)],
      [x, y + 1, open.has(`S ${x} ${y}`)],
      [x, y - 1, open.has(`S ${x} ${y - 1}`)],
    ];
    for (const [nx, ny, passable] of steps) {
      if (passable && !seen.has(`${nx} ${ny}`)) {
        seen.add(`${nx} ${ny}`);
        queue.push([nx, ny]);
      }
    }
  }
  return seen;
}

describe('the maze is perfect', () => {
  for (const seed of SEEDS) {
    for (let n = 1; n <= 7; n += 1) {
      it(`seed ${seed}, floor ${n}: connected, rooms − 1 open walls`, () => {
        const rooms = sideOf(n) ** 2;
        const open = openWalls(maze(seed), n);
        assert.equal(reachable(open).size, rooms);
        assert.equal(open.size, rooms - 1);
      });
    }
  }
});

/**
 * Recursive division read top-down off the same schema: a block at `level`
 * opens its midlines' doors and hands each quadrant to the level below.
 */
function divide(rolled: RolledMaze, n: number): Set<string> {
  const open = new Set<string>();
  const visit = (level: number, bx: bigint, by: bigint) => {
    if (level < 1) return;
    const h = 1n << BigInt(level - 1);
    const x0 = bx << BigInt(level);
    const y0 = by << BigInt(level);
    const { omit, door } = rolled.block.at({ n, level, x: bx, y: by });
    const offset = (edge: 'north' | 'east' | 'south' | 'west') =>
      (door.at(edge) * h) >> 64n;
    // The edge order is north, east, south, west: indices 0, 1, 2, 3.
    if (omit !== 0) open.add(`E ${x0 + h - 1n} ${y0 + offset('north')}`);
    if (omit !== 2) open.add(`E ${x0 + h - 1n} ${y0 + h + offset('south')}`);
    if (omit !== 3) open.add(`S ${x0 + offset('west')} ${y0 + h - 1n}`);
    if (omit !== 1) open.add(`S ${x0 + h + offset('east')} ${y0 + h - 1n}`);
    for (const dx of [0n, 1n]) {
      for (const dy of [0n, 1n]) {
        visit(level - 1, bx * 2n + dx, by * 2n + dy);
      }
    }
  };
  visit(n - 1, 0n, 0n);
  return open;
}

describe('the wall predicate', () => {
  for (const seed of SEEDS) {
    for (let n = 1; n <= 6; n += 1) {
      it(`seed ${seed}, floor ${n}: agrees with a full recursive build`, () => {
        const rolled = maze(seed);
        assert.deepEqual(
          [...openWalls(rolled, n)].toSorted(),
          [...divide(rolled, n)].toSorted(),
        );
      });
    }
  }

  it('throws on a wall outside the floor', () => {
    const rolled = maze('1');
    assert.throws(() => isOpenEast(rolled, 3, 3n, 0n));
    assert.throws(() => isOpenSouth(rolled, 3, 0n, 3n));
    assert.throws(() => isOpenEast(rolled, 1, 0n, 0n));
    assert.throws(() => isOpenEast(rolled, 3, -1n, 0n));
  });
});

const stub = (omit: number, word: bigint): RolledMaze => ({
  block: { at: () => ({ omit, door: { at: () => word } }) },
});

describe('a door on an edge longer than 2^32 rooms', () => {
  const level = 39;
  const h = 1n << BigInt(level - 1);
  const x = h - 1n;
  // Word 2^63 puts the door halfway along the half-edge, 2^37 rooms in, which
  // only the high word can say: the low word is zero.
  const word = 1n << 63n;
  const mid = h >> 1n;

  it('sits at (word · h) >> 64 on floor 40', () => {
    assert.ok(isOpenEast(stub(0, word), 40, x, h + mid));
    assert.ok(!isOpenEast(stub(0, word), 40, x, h + mid + 1n));
    assert.ok(isOpenEast(stub(2, word), 40, x, mid));
  });

  it('is closed on the omitted half-edge', () => {
    assert.ok(!isOpenEast(stub(2, word), 40, x, h + mid));
    assert.ok(!isOpenEast(stub(0, word), 40, x, mid));
  });

  it('runs on floor 64 beside 2^63', () => {
    const rolled = maze('1');
    const east = (1n << 63n) - 2n;
    const middle = (1n << 62n) - 1n;
    assert.equal(typeof isOpenEast(rolled, 64, east, 0n), 'boolean');
    assert.equal(typeof isOpenEast(rolled, 64, middle, middle), 'boolean');
    assert.equal(typeof isOpenSouth(rolled, 64, east + 1n, east), 'boolean');
  });

  it('places floor 66’s doors and refuses floor 67 whole', () => {
    const rolled = maze('1');
    const middle = (1n << 64n) - 1n;
    assert.equal(typeof isOpenEast(rolled, 66, middle, middle), 'boolean');
    assert.throws(
      () => isOpenEast(rolled, 67, 0n, 0n),
      new RangeError("Floor 67's doors need 65 bits; roll.wide() has 64"),
    );
  });
});
