import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  lakesOf,
  largestPatches,
  nodeAt,
  openSea,
  piecesOf,
  wrongArea,
} from './fit-measure';

/** A grid from rows of characters, north last; `#` is land (1), `.` sea. */
function parse(...lines: string[]) {
  const rows = lines.length;
  const columns = lines[0]?.length ?? 0;
  const values = Float64Array.from(lines.join(''), (c) => (c === '#' ? 1 : -1));
  return { grid: { columns, rows }, values };
}

describe('wrongArea', () => {
  it('counts both kinds against the drawn land', () => {
    const truth = Uint8Array.from([1, 1, 1, 1, 0, 0]);
    const land = Uint8Array.from([1, 1, 0, 1, 1, 0]);
    assert.deepEqual(wrongArea(land, truth), {
      added: 1,
      lost: 1,
      truthLand: 4,
      wrongShare: 0.5,
    });
  });
});

describe('piecesOf', () => {
  it('joins 4-neighbours only, and says which touch the border', () => {
    const mask = Uint8Array.from([
      1, 0, 0, 0,
      0, 1, 1, 0,
      0, 0, 0, 0,
    ]);
    const { label, pieces } = piecesOf(mask, { columns: 4, rows: 3 });
    assert.equal(pieces.length, 2);
    assert.equal(label[0], 0);
    assert.equal(label[5], 1);
    assert.equal(label[6], 1);
    assert.equal(label[1], -1);
    assert.deepEqual(pieces[1], {
      nodes: 2,
      i: 1.5,
      j: 1,
      touchesBorder: false,
    });
    assert.equal(pieces[0]?.touchesBorder, true);
  });
});

describe('openSea and lakesOf', () => {
  const { grid, values } = parse(
    '.......',
    '.#####.',
    '.#..#..',
    '.#####.',
    '.......',
  );

  it('tells the sea joined to the border from the walled-off water', () => {
    const open = openSea(values, grid);
    assert.equal(open[0], 1);
    assert.equal(open[2 * 7 + 5], 1);
    assert.equal(open[2 * 7 + 2], 0);
    const { pieces, label } = lakesOf(values, grid);
    assert.equal(pieces.length, 1);
    assert.equal(pieces[0]?.nodes, 2);
    assert.equal(label[2 * 7 + 3], 0);
  });
});

describe('largestPatches', () => {
  it('places each wrong patch on the plane, largest first', () => {
    const truth = Uint8Array.from([0, 0, 0, 1, 1, 1]);
    const land = Uint8Array.from([1, 1, 0, 1, 0, 1]);
    const grid = {
      originX: 1000,
      originY: 0,
      cellMetres: 2000,
      columns: 3,
      rows: 2,
    };
    assert.deepEqual(largestPatches(land, truth, grid, 5), [
      { kind: 'added', km2: 8, x: 2, y: 0 },
      { kind: 'dropped', km2: 4, x: 3, y: 2 },
    ]);
  });
});

describe('nodeAt', () => {
  it('rounds to the nearest node, −1 off the grid', () => {
    const grid = {
      originX: 0,
      originY: 0,
      cellMetres: 10,
      columns: 3,
      rows: 2,
    };
    assert.equal(nodeAt(grid, 14, 6), 4);
    assert.equal(nodeAt(grid, 26, 0), -1);
  });
});
