import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pathHash } from '@/dice/shared/roll';

import type { CubeCell } from '@/island/shared/globe';

import { floorIn } from './forest-floor';
import { type TreeGround, treesIn } from './tree-placing';

const CELL: CubeCell = { face: 'px', level: 18, x: 131_000, y: 140_500 };

/** Level ground `height` metres up everywhere. */
const flat = (height: number): TreeGround => ({
  seed: 11,
  groundAt: () => height,
  sandAt: () => 0,
  wordAt: pathHash('7'),
});

/** The trees and the floor under them of the 20 × 20 cells from `CELL` on. */
const stood = (ground: TreeGround) =>
  Array.from({ length: 400 }, (_, n) => {
    const cell = {
      ...CELL,
      x: CELL.x + (n % 20),
      y: CELL.y + Math.floor(n / 20),
    };
    const trees = treesIn(cell, ground);
    return { trees, floor: floorIn(cell, ground, trees) };
  });

describe('forest floor', () => {
  it('the same world and cell hold the same floor', () => {
    assert.deepEqual(stood(flat(200)), stood(flat(200)));
  });

  it('every tree has a shade at its foot, narrower than the tree is tall', () => {
    const cells = stood(flat(200));
    assert.ok(cells.some(({ trees }) => trees.length > 0));
    for (const { trees, floor } of cells) {
      const shades = floor.filter(({ kind }) => kind === 'shade');
      assert.equal(shades.length, trees.length);
      for (const [n, shade] of shades.entries()) {
        const tree = trees[n];
        assert.ok(tree !== undefined);
        assert.deepEqual(shade.p, tree.p);
        assert.ok(shade.tall > 1 && shade.tall < tree.tall * 0.6);
        assert.ok(shade.shade > 0.3 && shade.shade < 0.6);
      }
    }
  });

  it('logs lie only where trees stand about them', () => {
    const cells = stood(flat(200));
    const logs = cells.flatMap(({ floor }) =>
      floor.filter(({ kind }) => kind === 'log'),
    );
    assert.ok(logs.length > 0);
    assert.equal(stood(flat(1500)).flatMap(({ floor }) => floor).length, 0);
  });

  it('on level ground everything lies level', () => {
    for (const { floor } of stood(flat(200))) {
      for (const { lean } of floor) assert.deepEqual(lean, [-0, -0]);
    }
  });

  it('a coarser cell holds shades and no logs', () => {
    const ground = flat(200);
    const floor = Array.from({ length: 100 }, (_, n) => {
      const cell = { ...CELL, level: 17, x: 65_500 + n, y: 70_250 };
      return floorIn(cell, ground, treesIn(cell, ground));
    }).flat();
    assert.ok(floor.length > 0);
    assert.ok(floor.every(({ kind }) => kind === 'shade'));
  });
});
