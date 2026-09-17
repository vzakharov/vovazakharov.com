import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pathLocale } from './music-locale';

describe('pathLocale', () => {
  it('reads the locale off the last segment', () => {
    assert.equal(pathLocale('/music/slime/ru'), 'ru');
    assert.equal(pathLocale('/music/ru'), 'ru');
    assert.equal(pathLocale('/music/en/'), 'en');
  });

  it('falls back to the default where no segment names one', () => {
    assert.equal(pathLocale('/music'), 'en');
    assert.equal(pathLocale('/music/slime'), 'en');
    assert.equal(pathLocale('/'), 'en');
  });
});
