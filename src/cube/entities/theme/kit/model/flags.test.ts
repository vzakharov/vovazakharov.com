import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roomFlags } from './flags';

const NONE = [false, false, false, false] as const;
const ALL = [true, true, true, true] as const;
const only = (side: number) =>
  [side === 0, side === 1, side === 2, side === 3] as const;

const SIDES = [0, 1, 2, 3];

describe('roomFlags', () => {
  it('gives each closed side its own bit, east first', () => {
    assert.deepEqual(
      SIDES.map((side) =>
        roomFlags({ closed: only(side), lampsOn: false, litBeside: NONE }),
      ),
      [1, 2, 4, 8],
    );
  });

  it('gives each lit neighbour its side’s bit, past the walls and the lamp', () => {
    assert.deepEqual(
      SIDES.map((side) =>
        roomFlags({ closed: NONE, lampsOn: false, litBeside: only(side) }),
      ),
      [32, 64, 128, 256],
    );
  });

  it('keeps the lamp clear of both', () => {
    assert.equal(
      roomFlags({ closed: NONE, lampsOn: true, litBeside: NONE }),
      16,
    );
    assert.equal(
      roomFlags({ closed: ALL, lampsOn: true, litBeside: ALL }),
      15 + 16 + 480,
    );
  });
});
