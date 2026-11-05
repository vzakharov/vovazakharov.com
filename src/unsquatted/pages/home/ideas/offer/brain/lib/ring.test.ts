import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fillAt,
  FIRST_GUESS_SECONDS,
  halvesOf,
  LOAD_SHARE,
  MARGIN_SECONDS,
  ringOf,
} from './ring.ts';

describe('fillAt', () => {
  const move = { from: 0.2, to: 0.6, seconds: 4 };

  it('moves linearly and stops at the target', () => {
    assert.equal(fillAt(move, 0), 0.2);
    assert.ok(Math.abs(fillAt(move, 2) - 0.4) < 1e-9);
    assert.equal(fillAt(move, 9), 0.6);
  });

  it('jumps when the move takes no time', () => {
    assert.equal(fillAt({ ...move, seconds: 0 }, 0), 0.6);
  });
});

describe('halvesOf', () => {
  it('turns the first half, then the second after it', () => {
    assert.deepEqual(halvesOf({ from: 0, to: 1, seconds: 8 }), [
      { from: 0, to: 1, delay: 0, seconds: 4 },
      { from: 0, to: 1, delay: 4, seconds: 4 },
    ]);
  });

  it('leaves a half the move never reaches where it stands', () => {
    assert.deepEqual(halvesOf({ from: 0.75, to: 1, seconds: 2 }), [
      { from: 1, to: 1, delay: 0, seconds: 0 },
      { from: 0.5, to: 1, delay: 0, seconds: 2 },
    ]);
    assert.deepEqual(halvesOf({ from: 0, to: 0.25, seconds: 2 }), [
      { from: 0, to: 0.5, delay: 0, seconds: 2 },
      { from: 0, to: 0, delay: 0, seconds: 0 },
    ]);
  });

  it('empties at once on a jump back to the start', () => {
    assert.deepEqual(halvesOf({ from: 0.75, to: 0, seconds: 0 }), [
      { from: 1, to: 0, delay: 0, seconds: 0 },
      { from: 0.5, to: 0, delay: 0, seconds: 0 },
    ]);
  });
});

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
