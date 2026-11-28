import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { scratchedUpTo, tallyGrid } from './grid';

const WALL = { width: 1280, height: 720, seed: 4 };

describe('tallyGrid', () => {
  const marks = tallyGrid(WALL);

  it('makes groups of four uprights and a strike', () => {
    const sizes = new Map<number, number>();
    for (const { group } of marks)
      sizes.set(group, (sizes.get(group) ?? 0) + 1);
    assert.ok([...sizes.values()].every((count) => count === 5));
  });

  it('runs past every edge of the wall', () => {
    const xs = marks.flatMap(({ ends }) => ends.map(([x]) => x));
    const ys = marks.flatMap(({ ends }) => ends.map(([, y]) => y));
    assert.ok(Math.min(...xs) < 0);
    assert.ok(Math.max(...xs) > WALL.width);
    assert.ok(Math.min(...ys) < 0);
    assert.ok(Math.max(...ys) > WALL.height);
  });

  it('keeps every row running off both sides', () => {
    const rows = new Map<number, number[]>();
    // Each group's strike is its fifth mark; the uprights' feet give the row.
    for (const { ends } of marks.filter((_, n) => n % 5 !== 4)) {
      const [, [x, y]] = ends;
      const row = Math.round(y / 60);
      rows.set(row, [...(rows.get(row) ?? []), x]);
    }
    for (const xs of rows.values()) {
      assert.ok(Math.min(...xs) < 0 && Math.max(...xs) > WALL.width);
    }
  });

  it('puts about one group in eight in blood', () => {
    const groups = new Map(marks.map(({ group, blood }) => [group, blood]));
    const share = [...groups.values()].filter(Boolean).length / groups.size;
    assert.ok(share > 0.06 && share < 0.2, `blood share ${share}`);
  });

  it('skips some slots, leaving gaps in the count', () => {
    const none = tallyGrid({ ...WALL, skipRate: 0 });
    assert.ok(
      new Set(none.map(({ group }) => group)).size >
        new Set(marks.map(({ group }) => group)).size,
    );
  });

  it('is the same wall for the same seed, and another for another', () => {
    assert.deepEqual(tallyGrid(WALL), marks);
    assert.notDeepEqual(tallyGrid({ ...WALL, seed: 5 }), marks);
  });
});

describe('scratchedUpTo', () => {
  it('has nothing at 0 and everything at 1', () => {
    assert.deepEqual(scratchedUpTo(100, 0), { whole: 0, partial: 0 });
    assert.deepEqual(scratchedUpTo(100, 1), { whole: 100, partial: 0 });
  });

  it('splits a mark in hand', () => {
    const { whole, partial } = scratchedUpTo(10, 0.25);
    assert.equal(whole, 2);
    assert.ok(Math.abs(partial - 0.5) < 1e-9);
  });

  it('clamps progress', () => {
    assert.deepEqual(scratchedUpTo(10, -1), scratchedUpTo(10, 0));
    assert.deepEqual(scratchedUpTo(10, 3), scratchedUpTo(10, 1));
  });
});
