import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { albumLength, type AlbumLengthForms, formatDuration } from './duration';

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

const EN: AlbumLengthForms = {
  songs: { one: '# song', other: '# songs' },
  hours: { one: '# hour', other: '# hours' },
  minutes: { one: '# minute', other: '# minutes' },
};

const RU: AlbumLengthForms = {
  songs: { one: '# песня', few: '# песни', many: '# песен', other: '# песни' },
  hours: { one: '# час', few: '# часа', many: '# часов', other: '# часа' },
  minutes: {
    one: '# минута',
    few: '# минуты',
    many: '# минут',
    other: '# минуты',
  },
};

describe('albumLength', () => {
  it('counts the songs and rounds the total to the minute', () => {
    assert.equal(albumLength([200, 185, 241], 'en', EN), '3 songs, 10 minutes');
    assert.equal(albumLength([200, 215, 241], 'en', EN), '3 songs, 11 minutes');
    assert.equal(albumLength([61], 'en', EN), '1 song, 1 minute');
  });

  it('takes the locale’s plural forms', () => {
    assert.equal(albumLength([200, 215, 241], 'ru', RU), '3 песни, 11 минут');
    assert.equal(
      albumLength([60, 60, 60, 60, 60], 'ru', RU),
      '5 песен, 5 минут',
    );
    assert.equal(
      albumLength(
        Array.from({ length: 21 }, () => 60),
        'ru',
        RU,
      ),
      '21 песня, 21 минута',
    );
    assert.equal(albumLength([120, 120], 'ru', RU), '2 песни, 4 минуты');
  });

  it('writes hours from an hour up, dropping a zero minute count', () => {
    assert.equal(
      albumLength([1800, 1800, 720], 'en', EN),
      '3 songs, 1 hour 12 minutes',
    );
    assert.equal(
      albumLength([1800, 1800, 720], 'ru', RU),
      '3 песни, 1 час 12 минут',
    );
    assert.equal(albumLength([3600, 3600], 'en', EN), '2 songs, 2 hours');
  });
});
