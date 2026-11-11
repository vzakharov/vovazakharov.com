import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { big, ONE, ZERO } from './big';
import { isOpenEast, isOpenSouth, maze, type RolledMaze } from './maze';

const SEEDS = ['1', '8675309'];

const sideOf = (n: number) => Number(ONE << big(n - 1));

/** Every open wall of floor `n`, spelled `E x y` / `S x y`, by the predicates. */
function openWalls(rolled: RolledMaze, n: number): Set<string> {
  const side = sideOf(n);
  const open = new Set<string>();
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      if (x + 1 < side && isOpenEast(rolled, n, big(x), big(y))) {
        open.add(`E ${x} ${y}`);
      }
      if (y + 1 < side && isOpenSouth(rolled, n, big(x), big(y))) {
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
    const h = ONE << big(level - 1);
    const x0 = bx << big(level);
    const y0 = by << big(level);
    const { omit, door } = rolled.block.at({ n, level, x: bx, y: by });
    const offset = (edge: 'north' | 'east' | 'south' | 'west') =>
      (door.at(edge) * h) >> big(64);
    // The edge order is north, east, south, west: indices 0, 1, 2, 3.
    if (omit !== 0) open.add(`E ${x0 + h - ONE} ${y0 + offset('north')}`);
    if (omit !== 2) open.add(`E ${x0 + h - ONE} ${y0 + h + offset('south')}`);
    if (omit !== 3) open.add(`S ${x0 + offset('west')} ${y0 + h - ONE}`);
    if (omit !== 1) open.add(`S ${x0 + h + offset('east')} ${y0 + h - ONE}`);
    for (const dx of [ZERO, ONE]) {
      for (const dy of [ZERO, ONE]) {
        visit(level - 1, bx * big(2) + dx, by * big(2) + dy);
      }
    }
  };
  visit(n - 1, ZERO, ZERO);
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
    assert.throws(() => isOpenEast(rolled, 3, big(3), ZERO));
    assert.throws(() => isOpenSouth(rolled, 3, ZERO, big(3)));
    assert.throws(() => isOpenEast(rolled, 1, ZERO, ZERO));
    assert.throws(() => isOpenEast(rolled, 3, big(-1), ZERO));
  });
});

const stub = (omit: number, word: bigint): RolledMaze => ({
  block: { at: () => ({ omit, door: { at: () => word } }) },
});

describe('a door on an edge longer than 2^32 rooms', () => {
  const level = 39;
  const h = ONE << big(level - 1);
  const x = h - ONE;
  // Word 2^63 puts the door halfway along the half-edge, 2^37 rooms in, which
  // only the high word can say: the low word is zero.
  const word = ONE << big(63);
  const mid = h >> ONE;

  it('sits at (word · h) >> 64 on floor 40', () => {
    assert.ok(isOpenEast(stub(0, word), 40, x, h + mid));
    assert.ok(!isOpenEast(stub(0, word), 40, x, h + mid + ONE));
    assert.ok(isOpenEast(stub(2, word), 40, x, mid));
  });

  it('is closed on the omitted half-edge', () => {
    assert.ok(!isOpenEast(stub(2, word), 40, x, h + mid));
    assert.ok(!isOpenEast(stub(0, word), 40, x, mid));
  });

  it('runs on floor 64 beside 2^63', () => {
    const rolled = maze('1');
    const east = (ONE << big(63)) - big(2);
    const middle = (ONE << big(62)) - ONE;
    assert.equal(typeof isOpenEast(rolled, 64, east, ZERO), 'boolean');
    assert.equal(typeof isOpenEast(rolled, 64, middle, middle), 'boolean');
    assert.equal(typeof isOpenSouth(rolled, 64, east + ONE, east), 'boolean');
  });
});
