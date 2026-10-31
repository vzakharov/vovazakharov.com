import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addressLocale,
  localeSegmentParams,
  parseLocaleSegment,
} from './locales';

describe('addressLocale', () => {
  it('reads the locale off the last segment', () => {
    assert.equal(addressLocale('/music/songs/slime/ru'), 'ru');
    assert.equal(addressLocale('/music/ru'), 'ru');
    assert.equal(addressLocale('/music/en/'), 'en');
  });

  it('falls back to the default where no segment names one', () => {
    assert.equal(addressLocale('/music'), 'en');
    assert.equal(addressLocale('/music/slime'), 'en');
    assert.equal(addressLocale('/'), 'en');
  });
});

describe('localeSegmentParams', () => {
  it('lists the bare address and one per locale', () => {
    assert.deepEqual(localeSegmentParams(), [
      { locale: [] },
      { locale: ['en'] },
      { locale: ['ru'] },
    ]);
  });
});

describe('parseLocaleSegment', () => {
  it('reads every address localeSegmentParams lists', () => {
    assert.deepEqual(
      localeSegmentParams().map((params) => parseLocaleSegment(params)),
      ['en', 'en', 'ru'],
    );
  });

  it('takes a missing segment as the default locale', () => {
    assert.equal(parseLocaleSegment({}), 'en');
  });

  it('throws on a segment that names no locale', () => {
    assert.throws(() => parseLocaleSegment({ locale: ['de'] }), /\/de/);
    assert.throws(() => parseLocaleSegment({ locale: ['ru', 'x'] }), /\/ru\/x/);
  });
});
