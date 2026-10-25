import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hookRuns, textHook } from './hook-marks.ts';

const CROSSROADS = 'Лучшее ещё впереди. ~~Но это не точно~~';

describe('hookRuns', () => {
  it('cuts out the struck words', () => {
    assert.deepEqual(hookRuns(CROSSROADS), [
      { text: 'Лучшее ещё впереди. ' },
      { text: 'Но это не точно', struck: true },
    ]);
    assert.deepEqual(hookRuns('~~a~~ b ~~c d~~'), [
      { text: 'a', struck: true },
      { text: ' b ' },
      { text: 'c d', struck: true },
    ]);
  });

  it('leaves tildes that strike nothing as they are', () => {
    assert.deepEqual(hookRuns('~~ a ~~ and ~~~~'), [
      { text: '~~ a ~~ and ~~~~' },
    ]);
  });

  it('keeps a hook with no marks whole', () => {
    assert.deepEqual(hookRuns('Let my people go'), [
      { text: 'Let my people go' },
    ]);
  });
});

describe('textHook', () => {
  it('draws a stroke through every struck character, spaces included', () => {
    assert.equal(
      textHook('Лучшее ещё впереди. ~~Но это~~'),
      'Лучшее ещё впереди. Н̶о̶ ̶э̶т̶о̶',
    );
  });

  it('keeps a hook with no marks whole', () => {
    assert.equal(textHook('Let my people go'), 'Let my people go');
  });
});
