import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hookRuns, plainHook } from './hook-marks';

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

describe('plainHook', () => {
  it('keeps the struck words and drops the tildes', () => {
    assert.equal(plainHook(CROSSROADS), 'Лучшее ещё впереди. Но это не точно');
  });
});
