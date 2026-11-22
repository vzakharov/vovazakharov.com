import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pathHash } from '@/dice/shared/roll';

import type { CubeCell } from '@/island/shared/globe';

import type { TreeGround } from './tree-placing';
import { undergrowthIn } from './undergrowth';

const CELL: CubeCell = { face: 'px', level: 18, x: 131_000, y: 140_500 };

/** Level ground `height` metres up everywhere, a share `sand` of it sand. */
const flat = (height: number, sand = 0): TreeGround => ({
  seed: 11,
  groundAt: () => height,
  sandAt: () => sand,
  wordAt: pathHash('7'),
});

/** The low growth of the 20 × 20 cells from `CELL` on. */
const growth = (ground: TreeGround) =>
  Array.from({ length: 400 }, (_, n) =>
    undergrowthIn(
      { ...CELL, x: CELL.x + (n % 20), y: CELL.y + Math.floor(n / 20) },
      ground,
    ),
  ).flat();

const kindsOf = (ground: TreeGround) =>
  new Set(growth(ground).map(({ kind }) => kind));

describe('undergrowth', () => {
  it('the same world and cell hold the same growth', () => {
    assert.deepEqual(growth(flat(200)), growth(flat(200)));
  });

  it('dunes hold grass and no bush, the lowland bushes and no grass', () => {
    assert.deepEqual([...kindsOf(flat(12, 1))], ['tuft']);
    assert.deepEqual([...kindsOf(flat(200))], ['bush']);
  });

  it('nothing grows in the sea, on the washed sand or over the treeline', () => {
    assert.equal(growth(flat(-5)).length, 0);
    assert.equal(growth(flat(1, 1)).length, 0);
    assert.equal(growth(flat(1500)).length, 0);
  });

  it('only the finest cells hold any', () => {
    assert.equal(
      undergrowthIn({ ...CELL, level: 17, x: 65_500, y: 70_250 }, flat(200))
        .length,
      0,
    );
  });

  it('everything stays low', () => {
    for (const { tall } of [...growth(flat(200)), ...growth(flat(12, 1))]) {
      assert.ok(tall > 0.3 && tall < 2.5);
    }
  });
});
