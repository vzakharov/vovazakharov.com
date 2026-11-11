import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roomFlags } from './flags';

const NONE = [false, false, false, false] as const;
const ALL = [true, true, true, true] as const;
const only = (side: number) =>
  [side === 0, side === 1, side === 2, side === 3] as const;

describe('roomFlags', () => {
  it('gives each closed side its own bit, east first', () => {
    const closed = (side: number) =>
      roomFlags({ closed: only(side), lit: false, litBeside: NONE });
    assert.deepEqual([0, 1, 2, 3].map(closed), [1, 2, 4, 8]);
  });

  it('gives each lit neighbour its side’s bit, past the walls and the lamp', () => {
    const beside = (side: number) =>
      roomFlags({ closed: NONE, lit: false, litBeside: only(side) });
    assert.deepEqual([0, 1, 2, 3].map(beside), [32, 64, 128, 256]);
  });

  it('keeps the lamp clear of both', () => {
    assert.equal(roomFlags({ closed: NONE, lit: true, litBeside: NONE }), 16);
    assert.equal(
      roomFlags({ closed: ALL, lit: true, litBeside: ALL }),
      15 + 16 + 480,
    );
  });
});
