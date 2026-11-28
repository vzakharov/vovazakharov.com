import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { usesSentence, withArticle } from './uses.ts';

describe('withArticle', () => {
  it('reads the sound, not the letter', () => {
    assert.equal(withArticle('ink maker'), 'an ink maker');
    assert.equal(withArticle('used-book shop'), 'a used-book shop');
    assert.equal(withArticle('university press'), 'a university press');
    assert.equal(withArticle('umbrella brand'), 'an umbrella brand');
    assert.equal(withArticle('European fair'), 'a European fair');
    assert.equal(withArticle('one-room studio'), 'a one-room studio');
    assert.equal(withArticle('hourly planner'), 'an hourly planner');
    assert.equal(withArticle('honey shop'), 'a honey shop');
    assert.equal(withArticle('Arctic tour'), 'an Arctic tour');
  });
});

describe('usesSentence', () => {
  it('lists one, two or three uses as one sentence', () => {
    assert.equal(usesSentence(['planting calendar']), 'A planting calendar.');
    assert.equal(
      usesSentence(['ink maker', 'print studio']),
      'An ink maker or a print studio.',
    );
    assert.equal(
      usesSentence(['holiday let', 'cider', 'novel']),
      'A holiday let, a cider or a novel.',
    );
  });
});
