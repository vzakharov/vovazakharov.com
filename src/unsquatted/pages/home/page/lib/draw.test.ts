import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { draw } from './draw.ts';

const PICKS = Array.from({ length: 25 }, (_, index) => ({
  domain: `name${index}.com`,
  score: index % 7,
}));

/** A seeded generator, so a failure replays. */
function seeded(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
}

describe('draw', () => {
  it('draws the count asked, each name once, best first', () => {
    const drawn = draw(PICKS, 10, seeded(1));
    const scores = drawn.map(({ score }) => score);

    assert.equal(drawn.length, 10);
    assert.equal(new Set(drawn.map(({ domain }) => domain)).size, 10);
    assert.deepEqual(
      scores,
      scores.toSorted((a, b) => b - a),
    );
  });

  it('draws names not on screen while enough remain', () => {
    const shown = draw(PICKS, 10, seeded(2));
    const next = draw(PICKS, 10, seeded(3), shown);
    const onScreen = new Set(shown.map(({ domain }) => domain));

    assert.ok(next.every(({ domain }) => !onScreen.has(domain)));
  });

  it('draws from every name once too few are left off screen', () => {
    const shown = PICKS.slice(0, 20);

    assert.equal(draw(PICKS, 10, seeded(4), shown).length, 10);
  });

  it('draws them all when there are fewer than the count', () => {
    assert.equal(draw(PICKS.slice(0, 3), 10, seeded(5)).length, 3);
  });

  it('leaves the picks it was given in their order', () => {
    const copy = [...PICKS];

    draw(PICKS, 10, seeded(6));
    assert.deepEqual(PICKS, copy);
  });
});
