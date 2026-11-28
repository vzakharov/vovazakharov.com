import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  crossEdge,
  type CubeCell,
  DIRECTIONS,
  edgePoint,
  EDGES,
  FACES,
  faceToSphere,
  neighbour,
} from '.';

const MAX_LEVEL = 17;

const bitEqual = (p: readonly number[], q: readonly number[]) =>
  p.every((c, i) => Object.is(c, q[i]));

describe('EDGES', () => {
  it('pairs the 24 face sides into 12 edges, each the other way round', () => {
    const seen = new Set<string>();
    for (const face of FACES) {
      for (const direction of DIRECTIONS) {
        const edge = EDGES[face][direction];
        assert.notEqual(edge.face, face);
        const reverse = EDGES[edge.face][edge.back];
        assert.equal(reverse.face, face);
        assert.equal(reverse.back, direction);
        assert.equal(reverse.flip, edge.flip);
        seen.add([face, edge.face].toSorted().join('|'));
      }
    }
    assert.equal(seen.size, 12);
  });
});

describe('crossEdge', () => {
  it('gives bit-equal points from both faces on every edge, every level to 17', () => {
    for (const face of FACES) {
      for (const direction of DIRECTIONS) {
        // Level 17's vertices hold every coarser level's.
        const n = 2 ** MAX_LEVEL;
        for (let i = 0; i <= n; i += 1) {
          const along = (2 * i) / n - 1;
          const mine = edgePoint(face, direction, along);
          const theirs = crossEdge(face, direction, along);
          const p = faceToSphere(mine.face, mine.u, mine.v);
          const q = faceToSphere(theirs.face, theirs.u, theirs.v);
          if (!bitEqual(p, q)) {
            assert.fail(
              `${face} ${direction} at ${along}: ${p.join(',')} vs ${q.join(',')}`,
            );
          }
        }
      }
    }
  });
});

const cellCorners = ({ face, level, x, y }: CubeCell) => {
  const n = 2 ** level;
  const at = (i: number, j: number) =>
    faceToSphere(face, (2 * i) / n - 1, (2 * j) / n - 1).join(',');
  return new Set([at(x, y), at(x + 1, y), at(x, y + 1), at(x + 1, y + 1)]);
};

describe('neighbour', () => {
  it('is an involution across every edge, at every level to 17', () => {
    for (let level = 0; level <= MAX_LEVEL; level += 1) {
      const last = 2 ** level - 1;
      const samples = [...new Set([0, 1, last >> 1, last - 1, last])].filter(
        (k) => k >= 0 && k <= last,
      );
      for (const face of FACES) {
        for (const direction of DIRECTIONS) {
          for (const k of samples) {
            for (const cell of [
              { face, level, x: k, y: 0 },
              { face, level, x: k, y: last },
              { face, level, x: 0, y: k },
              { face, level, x: last, y: k },
            ]) {
              const there = neighbour(cell, direction);
              assert.ok(there.x >= 0 && there.x <= last);
              assert.ok(there.y >= 0 && there.y <= last);
              const { back, ...again } = neighbour(there, there.back);
              assert.deepEqual(again, cell);
              assert.equal(back, direction);
            }
          }
        }
      }
    }
  });

  it('shares exactly two corners, bit-equal, with each neighbour', () => {
    for (const level of [0, 1, 3, 9]) {
      const last = 2 ** level - 1;
      for (const face of FACES) {
        for (let x = 0; x <= last; x += Math.max(1, last >> 2)) {
          for (const y of [0, last]) {
            for (const cell of [
              { face, level, x, y },
              { face, level, x: y, y: x },
            ]) {
              const mine = cellCorners(cell);
              for (const direction of DIRECTIONS) {
                const theirs = cellCorners(neighbour(cell, direction));
                const shared = [...mine].filter((c) => theirs.has(c));
                assert.equal(shared.length, 2, `${face} ${level} ${direction}`);
              }
            }
          }
        }
      }
    }
  });
});
