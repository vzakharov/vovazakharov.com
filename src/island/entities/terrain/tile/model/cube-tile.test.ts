import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  type CubeCell,
  type Direction,
  dot,
  faceToSphere,
  length,
  neighbour,
  R,
  type Vec3,
} from '@/island/shared/globe';

import {
  capGap,
  CUBE_MAX_LEVEL,
  cubeTileSide,
  faceLattice,
  tileCap,
} from './cube-tile';
import { TILE_GRID } from './tile';

const CELLS = TILE_GRID - 1;
const arc = (a: Vec3, b: Vec3) => Math.atan2(length(cross(a, b)), dot(a, b));

/** The tile's lattice point `(i, j)`, each in `0..CELLS`. */
const vertex = (key: CubeCell, i: number, j: number) =>
  faceToSphere(
    key.face,
    faceLattice(key.level, CELLS, key.x * CELLS + i),
    faceLattice(key.level, CELLS, key.y * CELLS + j),
  );

/** The tile's lattice points along the edge `direction` leads through, in order. */
function edgeVertices(key: CubeCell, direction: Direction): Vec3[] {
  const at: Record<Direction, (k: number) => Vec3> = {
    right: (k) => vertex(key, CELLS, k),
    left: (k) => vertex(key, 0, k),
    up: (k) => vertex(key, k, CELLS),
    down: (k) => vertex(key, k, 0),
  };
  return Array.from({ length: TILE_GRID }, (_, k) => at[direction](k));
}

const sameBits = (a: Vec3, b: Vec3) => a.every((c, i) => Object.is(c, b[i]));

const last = 2 ** CUBE_MAX_LEVEL - 1;
const SAMPLES: CubeCell[] = [
  { face: 'px', level: 2, x: 0, y: 0 },
  { face: 'py', level: 2, x: 1, y: 2 },
  { face: 'nz', level: 5, x: 31, y: 7 },
  { face: 'ny', level: 9, x: 0, y: 511 },
  { face: 'pz', level: CUBE_MAX_LEVEL, x: last, y: 12_345 },
  { face: 'nx', level: CUBE_MAX_LEVEL, x: 2 ** 16, y: 2 ** 16 },
];

describe('faceLattice', () => {
  it('puts a face edge on exactly ±1 at every level', () => {
    for (let level = 0; level <= CUBE_MAX_LEVEL; level++) {
      assert.equal(faceLattice(level, CELLS, 0), -1);
      assert.equal(faceLattice(level, CELLS, 2 ** level * CELLS), 1);
    }
  });

  it('gives tiles across every face edge the same edge points bit for bit', () => {
    let checked = 0;
    for (const key of SAMPLES) {
      for (const direction of ['right', 'left', 'up', 'down'] as const) {
        const other = neighbour(key, direction);
        if (other.face === key.face) continue;
        const mine = edgeVertices(key, direction);
        const theirs = edgeVertices(other, other.back);
        // The two sides run the edge in the same or the opposite order.
        const aligned = sameBits(mine[0] ?? [0, 0, 0], theirs[0] ?? [1, 1, 1]);
        const ordered = aligned ? theirs : theirs.toReversed();
        for (const [k, p] of mine.entries()) {
          assert.ok(
            sameBits(p, ordered[k] ?? [0, 0, 0]),
            `${key.face} ${direction} ${k}`,
          );
        }
        checked += 1;
      }
    }
    assert.ok(checked >= 6, `${checked}`);
  });
});

describe('cubeTileSide', () => {
  for (const key of SAMPLES) {
    it(`bounds every cell edge of ${key.face}/${key.level}/${key.x}/${key.y}`, () => {
      const side = cubeTileSide(key);
      let longest = 0;
      for (let j = 0; j <= CELLS; j += 1) {
        for (let i = 0; i <= CELLS; i += 1) {
          const p = vertex(key, i, j);
          if (i < CELLS)
            longest = Math.max(longest, arc(p, vertex(key, i + 1, j)));
          if (j < CELLS)
            longest = Math.max(longest, arc(p, vertex(key, i, j + 1)));
        }
      }
      const centre = (R * Math.PI) / 2 ** (key.level + 1);
      assert.ok(
        longest * R * CELLS <= side * (1 + 1e-9),
        `${longest * R * CELLS} > ${side}`,
      );
      assert.ok(side <= centre * (1 + 1e-12));
      assert.ok(side >= ((2 * Math.SQRT2) / 3) * centre * (1 - 1e-12));
      // Conservative, not loose: within 1 % of the longest edge.
      assert.ok(
        side <= longest * R * CELLS * 1.01,
        `${side} vs ${longest * R * CELLS}`,
      );
    });
  }
});

describe('tileCap', () => {
  for (const key of SAMPLES) {
    it(`holds every lattice point of ${key.face}/${key.level}/${key.x}/${key.y}`, () => {
      const cap = tileCap(key);
      for (let j = 0; j <= CELLS; j += 4) {
        for (let i = 0; i <= CELLS; i += 4) {
          assert.equal(capGap(cap, vertex(key, i, j)), 0);
        }
      }
    });
  }
});
