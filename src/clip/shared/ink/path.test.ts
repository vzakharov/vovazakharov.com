import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { rng } from './noise';
import { ellipse, path, polygon } from './path';

describe('path', () => {
  it('reads absolute commands, repeating a letter for further groups', () => {
    assert.deepEqual(path('M 1,2 L 3 4 5-6 Q 7,8 9,10 C 1,1 2,2 3,3 Z'), [
      { kind: 'M', points: [[1, 2]] },
      { kind: 'L', points: [[3, 4]] },
      { kind: 'L', points: [[5, -6]] },
      {
        kind: 'Q',
        points: [
          [7, 8],
          [9, 10],
        ],
      },
      {
        kind: 'C',
        points: [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      },
      { kind: 'Z', points: [] },
    ]);
  });

  it('treats the pairs after a move-to as lines', () => {
    assert.deepEqual(
      path('M0,0 10,0 10,10').map(({ kind }) => kind),
      ['M', 'L', 'L'],
    );
  });

  it('refuses relative commands and stray coordinates', () => {
    assert.throws(() => path('M 0,0 l 5,5'), /not one of/);
    assert.throws(() => path('M 0,0 L 5'), /stray/);
  });
});

describe('polygon', () => {
  const corners = [
    [0, 0],
    [4, 0],
    [4, 4],
  ] as const;

  it('closes unless left open', () => {
    assert.equal(polygon(corners).at(-1)?.kind, 'Z');
    assert.equal(polygon(corners, 'open').at(-1)?.kind, 'L');
  });
});

describe('ellipse', () => {
  it('ends where it starts, so its outline meets', () => {
    const steps = ellipse([10, 20], 5, 3);
    assert.deepEqual(steps[0]?.points[0], [15, 20]);
    assert.deepEqual(steps.at(-2)?.points.at(-1), [15, 20]);
  });
});

const run = (seed: number): number[] => {
  const next = rng(seed);
  return Array.from({ length: 50 }, () => next());
};

describe('rng', () => {
  it('repeats for a seed, differs between seeds and stays in [0, 1)', () => {
    assert.deepEqual(run(7), run(7));
    assert.notDeepEqual(run(7), run(8));
    assert.ok(run(7).every((value) => value >= 0 && value < 1));
  });
});
