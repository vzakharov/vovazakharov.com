import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  catalogueSize,
  type CatalogueSizeForms,
  formatDuration,
  spokenLength,
} from './duration';

describe('formatDuration', () => {
  it('writes a track as m:ss', () => {
    assert.equal(formatDuration(0), '0:00');
    assert.equal(formatDuration(65.9), '1:05');
    assert.equal(formatDuration(3599), '59:59');
  });

  it('writes an hour and up as h:mm:ss', () => {
    assert.equal(formatDuration(3600), '1:00:00');
    assert.equal(formatDuration(3725), '1:02:05');
  });
});

const EN: CatalogueSizeForms = {
  artists: { one: '# artist', other: '# artists' },
  albums: { one: '# album', other: '# albums' },
  songs: { one: '# song', other: '# songs' },
  hours: { one: '# hour', other: '# hours' },
  minutes: { one: '# minute', other: '# minutes' },
};

const RU: CatalogueSizeForms = {
  artists: {
    one: '# артист',
    few: '# артиста',
    many: '# артистов',
    other: '# артиста',
  },
  albums: {
    one: '# альбом',
    few: '# альбома',
    many: '# альбомов',
    other: '# альбома',
  },
  songs: { one: '# песня', few: '# песни', many: '# песен', other: '# песни' },
  hours: { one: '# час', few: '# часа', many: '# часов', other: '# часа' },
  minutes: {
    one: '# минута',
    few: '# минуты',
    many: '# минут',
    other: '# минуты',
  },
};

describe('catalogueSize', () => {
  it('counts the songs and rounds the total to the minute', () => {
    assert.deepEqual(catalogueSize({ seconds: [200, 185, 241] }, 'en', EN), [
      '3 songs',
      '10 minutes',
    ]);
    assert.deepEqual(catalogueSize({ seconds: [200, 215, 241] }, 'en', EN), [
      '3 songs',
      '11 minutes',
    ]);
    assert.deepEqual(catalogueSize({ seconds: [61] }, 'en', EN), [
      '1 song',
      '1 minute',
    ]);
  });

  it('takes the locale’s plural forms', () => {
    assert.deepEqual(catalogueSize({ seconds: [200, 215, 241] }, 'ru', RU), [
      '3 песни',
      '11 минут',
    ]);
    assert.deepEqual(
      catalogueSize({ seconds: [60, 60, 60, 60, 60] }, 'ru', RU),
      ['5 песен', '5 минут'],
    );
    assert.deepEqual(
      catalogueSize(
        { seconds: Array.from({ length: 21 }, () => 60) },
        'ru',
        RU,
      ),
      ['21 песня', '21 минута'],
    );
    assert.deepEqual(catalogueSize({ seconds: [120, 120] }, 'ru', RU), [
      '2 песни',
      '4 минуты',
    ]);
  });

  it('writes hours from an hour up, dropping a zero minute count', () => {
    assert.deepEqual(catalogueSize({ seconds: [1800, 1800, 720] }, 'en', EN), [
      '3 songs',
      '1 hour 12 minutes',
    ]);
    assert.deepEqual(catalogueSize({ seconds: [1800, 1800, 720] }, 'ru', RU), [
      '3 песни',
      '1 час 12 минут',
    ]);
    assert.deepEqual(catalogueSize({ seconds: [3600, 3600] }, 'en', EN), [
      '2 songs',
      '2 hours',
    ]);
  });

  it('leads with the artists and albums it is handed, leaving out a count of none', () => {
    assert.deepEqual(
      catalogueSize(
        { artists: 5, albums: 21, seconds: [1800, 1800, 720] },
        'ru',
        RU,
      ),
      ['5 артистов', '21 альбом', '3 песни', '1 час 12 минут'],
    );
    assert.deepEqual(
      catalogueSize({ albums: 1, seconds: [200, 185, 241] }, 'en', EN),
      ['1 album', '3 songs', '10 minutes'],
    );
    assert.deepEqual(catalogueSize({ albums: 0, seconds: [61] }, 'en', EN), [
      '1 song',
      '1 minute',
    ]);
  });
});

describe('spokenLength', () => {
  const ACCUSATIVE = {
    ...RU,
    minutes: { ...RU.minutes, one: '# минуту' },
  };

  it('takes the sentence’s own case', () => {
    assert.equal(
      spokenLength(5 * 3600 + 21 * 60, 'ru', ACCUSATIVE),
      '5 часов 21 минуту',
    );
    assert.equal(
      spokenLength(3600 + 3 * 60 + 29, 'ru', ACCUSATIVE),
      '1 час 3 минуты',
    );
  });

  it('drops the seconds, rounding to the minute', () => {
    assert.equal(spokenLength(2 * 3600 + 89, 'en', EN), '2 hours 1 minute');
    assert.equal(spokenLength(2 * 3600 + 29, 'en', EN), '2 hours');
  });
});
