import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { through, within } from './span';

const SPAN = { from: 2, to: 6 };

describe('within', () => {
  it('holds its start and not its end', () => {
    assert.equal(within(SPAN, 2), true);
    assert.equal(within(SPAN, 5.999), true);
    assert.equal(within(SPAN, 6), false);
    assert.equal(within(SPAN, 1.999), false);
  });
});

describe('through', () => {
  it('runs 0 to 1 across the span, clamped outside it', () => {
    assert.equal(through(SPAN, 2), 0);
    assert.equal(through(SPAN, 3), 0.25);
    assert.equal(through(SPAN, 0), 0);
    assert.equal(through(SPAN, 9), 1);
  });
});
