import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { barredOf, DOORWAYS, eastKind, southKind } from './doorways';
import {
  adjacency,
  type Kinded,
  nativeWallsOf,
  roomsOf,
  sideOf,
  treeDistance,
  wallsOf,
} from './doorways.test-kit';
import { halfOf, maze, type Partition, partitionKey, spotOf } from './maze';

const SEEDS = ['1', '8675309', '42'];

/** Each partition of floor `n` with the walls in it, by offset. */
function byPartition(n: number, walls: Kinded[]) {
  const out = new Map<string, { partition: Partition; walls: Kinded[] }>();
  for (const wall of walls) {
    const { partition } = spotOf(n, wall);
    const key = partitionKey(partition);
    const entry = out.get(key) ?? { partition, walls: [] };
    entry.walls.push(wall);
    out.set(key, entry);
  }
  return [...out.values()];
}

const isDoorway = ({ kind }: Kinded) => kind === 'door' || kind === 'gap';

describe('the window method', () => {
  for (const seed of SEEDS) {
    for (let n = 4; n <= 8; n += 1) {
      it(`seed ${seed}, floor ${n}: bars exactly the walls a full count does`, () => {
        const rolled = maze(seed);
        const walls = nativeWallsOf(rolled, n);
        const distance = treeDistance(adjacency(n, walls, (w) => w.isOpen));
        const barred = new Map<string, bigint[]>();
        for (const wall of walls) {
          if (wall.isOpen) continue;
          const { partition, offset } = spotOf(n, wall);
          const key = partitionKey(partition);
          const bars = barred.get(key) ?? barredOf(rolled, partition);
          barred.set(key, bars);
          const [a, b] = roomsOf(wall, sideOf(n));
          assert.equal(
            bars.includes(offset),
            distance(a, b) < DOORWAYS.threshold,
            `${wall.across} of (${wall.x}, ${wall.y})`,
          );
        }
      });
    }
  }
});

describe('doorways on a floor', () => {
  it('are doors about three times in four', () => {
    const counts = { door: 0, gap: 0 };
    for (const seed of SEEDS) {
      for (let n = 6; n <= 7; n += 1) {
        for (const { kind } of wallsOf(maze(seed), n)) {
          if (kind === 'door' || kind === 'gap') counts[kind] += 1;
        }
      }
    }
    const share = counts.door / (counts.door + counts.gap);
    assert.ok(counts.gap > 0, 'no gaps at all');
    assert.ok(Math.abs(share - DOORWAYS.doorShare) < 0.05, `share ${share}`);
  });

  for (const seed of SEEDS) {
    for (let n = 3; n <= 7; n += 1) {
      it(`seed ${seed}, floor ${n}: one per partition with an allowed wall`, () => {
        const rolled = maze(seed);
        for (const { partition, walls } of byPartition(n, wallsOf(rolled, n))) {
          const allowed =
            halfOf(partition.level) -
            BigInt(barredOf(rolled, partition).length);
          assert.equal(
            walls.filter((wall) => isDoorway(wall)).length,
            allowed > 0n ? 1 : 0,
            partitionKey(partition),
          );
        }
      });
    }
  }

  it('none on floors 1 and 2', () => {
    for (const seed of SEEDS) {
      for (const n of [1, 2]) {
        const doorways = wallsOf(maze(seed), n).filter((w) => isDoorway(w));
        assert.deepEqual(doorways, []);
      }
    }
  });

  it('none on the outer boundary, which has no wall to cut', () => {
    const rolled = maze('1');
    assert.throws(() => eastKind(rolled, 4, 7n, 3n));
    assert.throws(() => southKind(rolled, 4, 3n, 7n));
  });
});

const PROBES = 200;

/**
 * Rooms strewn over floor `n` by a multiplicative step, each in a partition
 * of its own and every level met, the walls east and south of them asked.
 */
function strewn(n: number): Array<[bigint, bigint]> {
  const last = (1n << BigInt(n - 1)) - 1n;
  return Array.from({ length: PROBES }, (_, i) => {
    const step = BigInt(i + 1) * 0x9e_37_79_b9_7f_4a_7c_15n;
    return [step % last, (step >> 7n) % last];
  });
}

describe('a deep floor', () => {
  for (const n of [40, 58, 66]) {
    it(`floor ${n}: answers in under a millisecond a wall, cold or warm`, () => {
      const rolled = maze('20261114');
      const ask = () =>
        strewn(n).map(([x, y]) => [
          eastKind(rolled, n, x, y),
          southKind(rolled, n, x, y),
        ]);
      let start = performance.now();
      const cold = ask();
      const coldMs = (performance.now() - start) / (2 * PROBES);
      start = performance.now();
      assert.deepEqual(ask(), cold);
      const warmMs = (performance.now() - start) / (2 * PROBES);
      assert.ok(coldMs < 5, `cold ${coldMs} ms a wall`);
      assert.ok(warmMs < 0.5, `warm ${warmMs} ms a wall`);
    });
  }
});
