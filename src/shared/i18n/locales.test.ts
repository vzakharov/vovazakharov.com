import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addressLocale } from './locales';

describe('addressLocale', () => {
  it('reads the locale off the last segment', () => {
    assert.equal(addressLocale('/music/slime/ru'), 'ru');
    assert.equal(addressLocale('/music/ru'), 'ru');
    assert.equal(addressLocale('/music/en/'), 'en');
  });

  it('falls back to the default where no segment names one', () => {
    assert.equal(addressLocale('/music'), 'en');
    assert.equal(addressLocale('/music/slime'), 'en');
    assert.equal(addressLocale('/'), 'en');
  });
});
