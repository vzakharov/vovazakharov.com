import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LOOKS, nextLook } from './play-hook';

describe('nextLook', () => {
  it('steps plain, swift, fine and back to plain', () => {
    assert.deepEqual(
      LOOKS.map((look) => nextLook(look)),
      ['swift', 'fine', 'plain'],
    );
  });
});
