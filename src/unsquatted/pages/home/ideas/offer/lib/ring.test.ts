import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FIRST_GUESS_SECONDS,
  LOAD_SHARE,
  MARGIN_SECONDS,
  ringOf,
} from './ring.ts';

const idle = { loading: undefined, asked: false, ready: false, timed: 3 };

describe('ringOf', () => {
  it('shows nothing until the button is pressed', () => {
    assert.equal(ringOf(idle), undefined);
    assert.equal(ringOf({ ...idle, ready: true }), undefined);
  });

  it('fills with the load up to its share, asked or not', () => {
    assert.equal(ringOf({ ...idle, loading: 1 })?.to, LOAD_SHARE);
    assert.equal(
      ringOf({ ...idle, loading: 0.5, asked: true })?.to,
      0.5 * LOAD_SHARE,
    );
  });

  it('waits empty for a load about to start', () => {
    assert.deepEqual(ringOf({ ...idle, asked: true }), { to: 0, seconds: 0 });
  });

  it('closes over the timed generation plus the margin', () => {
    assert.deepEqual(ringOf({ ...idle, asked: true, ready: true }), {
      to: 1,
      seconds: 3 + MARGIN_SECONDS,
    });
  });

  it('guesses the first generation before any is timed', () => {
    assert.deepEqual(
      ringOf({ ...idle, asked: true, ready: true, timed: undefined }),
      { to: 1, seconds: FIRST_GUESS_SECONDS },
    );
  });
});
