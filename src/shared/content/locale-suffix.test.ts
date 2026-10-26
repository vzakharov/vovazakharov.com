import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { splitLocale, translationOf } from './locale-suffix.ts';

describe('splitLocale', () => {
  it('splits off an original’s locale', () => {
    assert.deepEqual(splitLocale('two-names.ru'), {
      stem: 'two-names',
      locale: 'ru',
    });
  });

  it('leaves the default language and a non-locale suffix in the stem', () => {
    assert.deepEqual(splitLocale('two-names.en'), { stem: 'two-names.en' });
    assert.deepEqual(splitLocale('playgram.mini'), { stem: 'playgram.mini' });
  });
});

describe('translationOf', () => {
  it('names the translation beside an original, whatever its extension', () => {
    assert.equal(translationOf('blog/two-names.ru.md'), 'blog/two-names.md');
    assert.equal(
      translationOf('blog/assets/leptocephalus.ru.svg'),
      'blog/assets/leptocephalus.svg',
    );
  });

  it('names nothing for a file that is not an original', () => {
    assert.equal(translationOf('blog/two-names.md'), undefined);
    assert.equal(translationOf('blog/two-names.ru'), undefined);
  });
});
