import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { creasePattern } from './crease-pattern.ts';
import { fold, run } from './fold.ts';
import { area } from './geometry.ts';
import { layers, square } from './state.ts';

const bookFold = {
  line: { p: [0.5, 0], q: [0.5, 1] },
  moving: [0.9, 0.5],
  direction: 'valley',
} as const;

describe('fold', () => {
  it('folds a square in half into two stacked pieces, area kept', () => {
    const state = run([bookFold]);
    assert.equal(state.pieces.length, 2);
    const total = state.pieces.reduce((sum, p) => sum + area(p.paper), 0);
    assert.ok(Math.abs(total - 1) < 1e-9);
    assert.deepEqual(
      [...layers(state).values()].toSorted((a, b) => a - b),
      [0, 1],
    );
  });

  it('turns the moved half face down', () => {
    const state = run([bookFold]);
    const [creaseLine] = creasePattern(state);
    assert.equal(creaseLine?.assignment, 'V');
  });

  it('drags along a layer joined to the selected one off the line', () => {
    const state = fold(run([bookFold]), {
      line: { p: [0, 0.5], q: [1, 0.5] },
      moving: [0.25, 0.9],
      select: { at: [0.25, 0.9], top: 1 },
      direction: 'valley',
    });
    const record = state.log.at(-1);
    // The book crease joins the top half to the bottom one, so both turn.
    assert.equal(record?.moved.size, 2);
    assert.equal(state.pieces.length, 4);
  });

  it('refuses a moving point on the line', () => {
    assert.throws(() => fold(square(), { ...bookFold, moving: [0.5, 0.3] }));
  });
});
