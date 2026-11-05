import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { unlocks } from './unlock';

describe('unlocks', () => {
  it('takes the phrase in any case and spacing', () => {
    assert.equal(unlocks('give me ai'), true);
    assert.equal(unlocks('  Give  Me AI '), true);
  });

  it('takes nothing but the phrase', () => {
    assert.equal(unlocks('givemeai'), false);
    assert.equal(unlocks('give me ai.com'), false);
    assert.equal(unlocks('please give me ai'), false);
    assert.equal(unlocks('give me a'), false);
  });
});
