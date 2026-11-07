import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { creasePattern } from './crease-pattern.ts';
import { fold, run } from './fold.ts';
import { area, contains } from './geometry.ts';
import { flatPolygon, layers, square } from './state.ts';

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

describe('tuck', () => {
  /** The book's inner edge, a strip of its bottom layer turned up. */
  const innerEdge = {
    line: { p: [0.1, 0], q: [0.1, 1] },
    moving: [0.05, 0.5],
    select: { at: [0.05, 0.5], bottom: 1 },
    direction: 'tuck',
  } as const;

  it('slides the flap between the layers it is tucked under', () => {
    const state = fold(run([bookFold]), {
      ...innerEdge,
      into: { at: [0.15, 0.5], below: 1 },
    });
    const record = state.log.at(-1);
    assert.ok(record);
    assert.equal(record.direction, 'valley');
    const stack = state.pieces
      .filter((piece) => contains(flatPolygon(piece), [0.15, 0.5]))
      .toSorted((a, b) => a.order - b.order)
      .map((piece) => record.moved.has(piece.id));
    // The bottom layer's rest, the tucked strip, then the book's top half.
    assert.deepEqual(stack, [false, true, false]);
  });

  it('refuses a pocket whose layer covers the crease', () => {
    assert.throws(
      () =>
        fold(run([bookFold]), {
          ...innerEdge,
          into: { at: [0.15, 0.5], below: 0 },
        }),
      /pass through/,
    );
  });

  it('refuses a tuck without a pocket, or not folded flat', () => {
    assert.throws(() => fold(run([bookFold]), innerEdge), /needs `into`/);
    assert.throws(
      () =>
        fold(run([bookFold]), {
          ...innerEdge,
          angle: 90,
          into: { at: [0.15, 0.5], below: 1 },
        }),
      /folds flat/,
    );
  });
});
