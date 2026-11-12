import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { answerOf } from './input';

describe('answerOf', () => {
  it('goes by the letter a key types, whatever its case or place', () => {
    assert.equal(answerOf('y', 'KeyY'), 'yes');
    assert.equal(answerOf('N', 'KeyN'), 'no');
    // A German board types y where a US one has z.
    assert.equal(answerOf('y', 'KeyZ'), 'yes');
    assert.equal(answerOf('z', 'KeyY'), null);
    assert.equal(answerOf('e', 'KeyE'), null);
  });

  it('goes by the key’s place on a board that types no Latin letter', () => {
    assert.equal(answerOf('н', 'KeyY'), 'yes');
    assert.equal(answerOf('т', 'KeyN'), 'no');
    assert.equal(answerOf('у', 'KeyE'), null);
    assert.equal(answerOf('Enter', 'Enter'), null);
  });
});
