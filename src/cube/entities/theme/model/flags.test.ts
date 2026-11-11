import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roomFlags } from './flags';

describe('roomFlags', () => {
  it('gives each closed side its own bit, east first', () => {
    const only = (side: number) =>
      roomFlags({
        closed: [side === 0, side === 1, side === 2, side === 3],
        lit: false,
        litBeside: 0,
      });
    assert.deepEqual([0, 1, 2, 3].map(only), [1, 2, 4, 8]);
  });

  it('keeps the lamp and the lit neighbours clear of the walls', () => {
    const open = [false, false, false, false] as const;
    assert.equal(roomFlags({ closed: open, lit: true, litBeside: 0 }), 16);
    assert.equal(roomFlags({ closed: open, lit: false, litBeside: 4 }), 128);
    assert.equal(
      roomFlags({ closed: [true, true, true, true], lit: true, litBeside: 3 }),
      15 + 16 + 96,
    );
  });
});
