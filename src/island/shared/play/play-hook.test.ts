import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isFine, LOOKS, nextLook } from './play-hook';

describe('nextLook', () => {
  it('steps plain, swift, fine and back to plain', () => {
    assert.deepEqual(
      LOOKS.map((look) => nextLook(look)),
      ['swift', 'fine', 'plain'],
    );
  });
});

describe('isFine', () => {
  it('holds for every look but plain', () => {
    assert.deepEqual(
      LOOKS.map((look) => isFine(look)),
      [false, true, true],
    );
  });
});
