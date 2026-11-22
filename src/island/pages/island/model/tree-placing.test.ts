import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pathHash } from '@/dice/shared/roll';

import { type CubeCell, R, type Vec3 } from '@/island/shared/globe';

import {
  cellsAround,
  tierCell,
  tierReach,
  TREE_TIERS,
  type TreeGround,
  treesIn,
} from './tree-placing';

const CELL: CubeCell = { face: 'px', level: 18, x: 131_000, y: 140_500 };

/** Level ground `height` metres up everywhere, in world `world`. */
const flat = (height: number, world = '7'): TreeGround => ({
  seed: 11,
  groundAt: () => height,
  wordAt: pathHash(world),
});

/** Every tree of the `side`² cells from `CELL` on. */
const stand = (ground: TreeGround, side = 12) =>
  Array.from({ length: side * side }, (_, n) =>
    treesIn(
      { ...CELL, x: CELL.x + (n % side), y: CELL.y + Math.floor(n / side) },
      ground,
    ),
  ).flat();

/** The conifers' share of a stand on level ground `height` up. */
function share(height: number) {
  const trees = stand(flat(height), 30);
  return trees.filter(({ kind }) => kind === 'conifer').length / trees.length;
}

describe('tree placing', () => {
  it('the same world and cell hold the same trees', () => {
    assert.deepEqual(stand(flat(200)), stand(flat(200)));
    assert.ok(stand(flat(200)).length > 0);
  });

  it('another world rolls other trees', () => {
    assert.notDeepEqual(stand(flat(200)), stand(flat(200, '8')));
  });

  it('no tree stands on the sand, in the sea or over the treeline', () => {
    for (const height of [-30, 0, 2, 1600]) {
      assert.equal(stand(flat(height)).length, 0, `at ${String(height)} m`);
    }
  });

  it('no tree stands on a wall', () => {
    const wall: TreeGround = {
      ...flat(0),
      groundAt: (p: Vec3) => 300 + p[1] * R * 2,
    };
    assert.equal(stand(wall).length, 0);
  });

  it('a tree stands on the ground under it, inside its cell', () => {
    const ground: TreeGround = {
      ...flat(0),
      groundAt: (p: Vec3) => 200 + 40 * Math.sin(p[1] * 9000),
    };
    for (const tree of stand(ground)) {
      assert.equal(tree.height, ground.groundAt(tree.p));
      assert.ok(tree.tall > 3 && tree.tall < 30);
    }
  });

  it('the upland stand is mostly conifers and the lowland mostly broadleaves', () => {
    assert.ok(share(120) < 0.35);
    assert.ok(share(600) > 0.9);
  });

  it('each tier reaches twice as far over cells twice as wide', () => {
    for (let tier = 1; tier < TREE_TIERS; tier++) {
      assert.equal(tierCell(tier), 2 * tierCell(tier - 1));
      assert.equal(tierReach(tier), 2 * tierReach(tier - 1));
    }
  });

  it('the cells about a place cover its reach, across a face edge alike', () => {
    const places: Vec3[] = [
      [1, 0.1, 0.2],
      [Math.SQRT1_2, Math.SQRT1_2, 0],
    ];
    for (const p of places) {
      const cells = cellsAround(p, 0);
      const disc = Math.PI * tierReach(0) ** 2;
      assert.ok(cells.length * tierCell(0) ** 2 > disc * 0.5);
      assert.ok(cells.length < 1200);
      assert.equal(
        new Set(
          cells.map(({ face, x, y }) => `${face}/${String(x)}/${String(y)}`),
        ).size,
        cells.length,
      );
    }
    assert.ok(
      new Set(cellsAround(places[1] ?? [1, 0, 0], 0).map((c) => c.face)).size >
        1,
    );
  });
});
