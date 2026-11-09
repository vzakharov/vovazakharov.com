import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DIRECTIONS } from '@/island/shared/globe';

import {
  type CoarseEdges,
  gridTriangles,
  NO_COARSE_EDGES,
  tileIndices,
} from './tile-indices';
import { borderLoop } from './tile-mesh';

const ALL_EDGE_SETS: CoarseEdges[] = Array.from({ length: 16 }, (_, mask) => ({
  right: (mask & 1) !== 0,
  left: (mask & 2) !== 0,
  up: (mask & 4) !== 0,
  down: (mask & 8) !== 0,
}));

const named = (coarse: CoarseEdges) =>
  DIRECTIONS.filter((d) => coarse[d]).join('+') || 'none';

/** Border vertices along `direction`, south-west to north-east. */
function side(grid: number, direction: (typeof DIRECTIONS)[number]) {
  const last = grid - 1;
  return Array.from({ length: grid }, (_, k) => {
    const [i, j] = {
      right: [last, k],
      left: [0, k],
      up: [k, last],
      down: [k, 0],
    }[direction];
    return j * grid + i;
  });
}

function triangles(list: readonly number[]) {
  const out: Array<readonly [number, number, number]> = [];
  for (let t = 0; t < list.length; t += 3) {
    const [a, b, c] = [list[t], list[t + 1], list[t + 2]];
    assert.ok(a !== undefined && b !== undefined && c !== undefined);
    out.push([a, b, c]);
  }
  return out;
}

/** Twice the signed area of a triangle in `(i, j)`. */
function doubledArea(grid: number, [a, b, c]: readonly number[]) {
  const ij = (v = 0) => [v % grid, Math.floor(v / grid)] as const;
  const [[ai, aj], [bi, bj], [ci, cj]] = [ij(a), ij(b), ij(c)];
  return (bi - ai) * (cj - aj) - (bj - aj) * (ci - ai);
}

for (const grid of [5, 9, 17, 65]) {
  const cells = grid - 1;
  describe(`gridTriangles, grid ${grid}`, () => {
    for (const coarse of ALL_EDGE_SETS) {
      it(`coarse ${named(coarse)}: covers the tile, fans to the coarse vertices`, () => {
        const list = triangles(gridTriangles(grid, coarse));

        let area = 0;
        for (const t of list) {
          const doubled = doubledArea(grid, t);
          assert.ok(doubled > 0, `${t.join(' ')} wound clockwise or flat`);
          area += doubled;
        }
        assert.equal(area, 2 * cells * cells);

        const directed = new Map<string, readonly [number, number]>();
        for (const [a, b, c] of list) {
          for (const [p, q] of [
            [a, b],
            [b, c],
            [c, a],
          ] as const) {
            const name = `${p}>${q}`;
            assert.ok(!directed.has(name), `edge ${name} twice`);
            directed.set(name, [p, q]);
          }
        }
        const used = new Set(list.flat());

        // The border is the tile's outline: each edge along it is in one
        // triangle only, every other edge in two facing each other.
        const outline = new Set<string>();
        for (const direction of DIRECTIONS) {
          const along = side(grid, direction);
          const step = coarse[direction] ? 2 : 1;
          for (let k = 0; k + step < grid; k += step) {
            const [p, q] = [along[k], along[k + step]];
            assert.ok(p !== undefined && q !== undefined);
            outline.add(`${Math.min(p, q)}-${Math.max(p, q)}`);
            assert.ok(
              directed.has(`${p}>${q}`) || directed.has(`${q}>${p}`),
              `${direction} segment ${p}–${q} is no triangle's edge`,
            );
          }
          if (!coarse[direction]) continue;
          for (let k = 1; k < grid; k += 2) {
            assert.ok(!used.has(along[k] ?? -1), `${direction} vertex ${k}`);
          }
        }
        for (const [name, [p, q]] of directed) {
          const shared = directed.has(`${q}>${p}`);
          const border = outline.has(`${Math.min(p, q)}-${Math.max(p, q)}`);
          assert.ok(shared !== border, `edge ${name}: shared ${shared}`);
        }
      });
    }
  });
}

describe('gridTriangles, no coarse edge', () => {
  it('is two triangles a cell on any grid', () => {
    assert.equal(gridTriangles(4, NO_COARSE_EDGES).length, 3 * 3 * 6);
  });
  it('refuses a coarse edge where the cells do not pair', () => {
    const coarse = { ...NO_COARSE_EDGES, up: true };
    assert.throws(() => gridTriangles(4, coarse), RangeError);
    assert.throws(() => gridTriangles(3, coarse), RangeError);
  });
});

describe('tileIndices', () => {
  it('is the grid triangles then the skirt, a fresh copy each call', () => {
    const grid = 9;
    const coarse = { ...NO_COARSE_EDGES, left: true, down: true };
    const loop = borderLoop(grid);
    const first = tileIndices(grid, loop, coarse);
    const own = gridTriangles(grid, coarse);
    assert.deepEqual([...first.subarray(0, own.length)], own);
    assert.equal(first.length, own.length + loop.length * 6);
    first.fill(0);
    const second = tileIndices(grid, loop, coarse);
    assert.deepEqual([...second.subarray(0, own.length)], own);
  });
});
