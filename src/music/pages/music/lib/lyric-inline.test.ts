import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { inlineRuns } from './lyric-inline';

describe('inlineRuns', () => {
  it('sets an underscored word in italics', () => {
    assert.deepEqual(inlineRuns('_Poekhali!_'), [
      { text: 'Poekhali!', emphasis: true },
    ]);
    assert.deepEqual(inlineRuns('Shout _davay_, and go'), [
      { text: 'Shout ' },
      { text: 'davay', emphasis: true },
      { text: ', and go' },
    ]);
  });

  it('drops an escape, outside italics and inside them', () => {
    assert.deepEqual(inlineRuns(String.raw`Two \* two \_is\_ four`), [
      { text: 'Two * two _is_ four' },
    ]);
    assert.deepEqual(inlineRuns(String.raw`_a\_b_`), [
      { text: 'a_b', emphasis: true },
    ]);
  });

  it('leaves an underscore inside a word, or a lone one, as it is', () => {
    assert.deepEqual(inlineRuns('snake_case_name'), [
      { text: 'snake_case_name' },
    ]);
    assert.deepEqual(inlineRuns('a _ b'), [{ text: 'a _ b' }]);
  });

  it('keeps a line with no marks whole', () => {
    assert.deepEqual(inlineRuns('Let my people go'), [
      { text: 'Let my people go' },
    ]);
  });
});
