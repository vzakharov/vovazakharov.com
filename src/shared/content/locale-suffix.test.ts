import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { splitLocale, translationOf } from './locale-suffix.ts';

describe('splitLocale', () => {
  it('splits off any language’s suffix', () => {
    assert.deepEqual(splitLocale('two-names.ru'), {
      stem: 'two-names',
      locale: 'ru',
    });
    assert.deepEqual(splitLocale('two-names.en'), {
      stem: 'two-names',
      locale: 'en',
    });
  });

  it('leaves a non-locale suffix in the stem', () => {
    assert.deepEqual(splitLocale('playgram.mini'), { stem: 'playgram.mini' });
  });
});

describe('translationOf', () => {
  it('names the default language’s file beside an original', () => {
    assert.equal(translationOf('blog/two-names.ru.md'), 'blog/two-names.en.md');
  });

  it('names nothing for a file that is not an original', () => {
    assert.equal(translationOf('blog/two-names.en.md'), undefined);
    assert.equal(translationOf('blog/two-names.md'), undefined);
    assert.equal(translationOf('blog/two-names.ru'), undefined);
  });
});
