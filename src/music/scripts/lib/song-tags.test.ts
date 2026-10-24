import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import { buildTags, type TagSource } from './song-tags.ts';

const SNOW: TagSource = {
  title: { original: 'Снег идёт', latin: 'Sneg idyot' },
  artists: [{ original: 'Полуживые', latin: 'Poluzhivye' }],
  release: {
    title: { original: 'Бродяга', latin: 'Brodyaga' },
    artist: { original: 'Полуживые', latin: 'Poluzhivye' },
    track: 3,
    total: 11,
  },
  date: new Date('2023-12-01'),
  sungLanguage: 'ru',
  stanzas: [
    ['Снег идёт', 'И _Poekhali!_ поём'],
    [String.raw`Снег идёт\!`, 'x2'],
  ],
  url: 'https://vovazakharov.com/music/songs/snow-is-falling',
};

describe('buildTags', () => {
  it('names the song in Latin and keeps the words in the script they are sung in', () => {
    assert.deepEqual(buildTags(SNOW), {
      title: 'Sneg idyot',
      artist: 'Poluzhivye',
      album: 'Brodyaga',
      albumArtist: 'Poluzhivye',
      track: 3,
      trackTotal: 11,
      year: 2023,
      language: 'rus',
      lyricists: ['Vova Zakharov'],
      composers: ['Vova Zakharov'],
      lyrics: 'Снег идёт\nИ Poekhali! поём\n\nСнег идёт!\nx2',
      url: 'https://vovazakharov.com/music/songs/snow-is-falling',
    });
  });

  it('bills features, credits people by their English names, and tags a single with no album', () => {
    const tags = buildTags({
      ...pick(SNOW, 'title', 'date', 'url'),
      artists: [
        { original: 'GENERATED' },
        { original: 'Полуживые', latin: 'Poluzhivye' },
      ],
      credits: {
        lyrics: [{ en: 'Anna Akhmatova', ru: 'Анна Ахматова' }],
      },
      sungLanguage: 'instrumental',
    });

    assert.equal(tags.artist, 'GENERATED feat. Poluzhivye');
    assert.deepEqual(tags.lyricists, ['Anna Akhmatova']);
    assert.deepEqual(tags.composers, ['Vova Zakharov']);
    assert.equal(tags.language, 'zxx');
    assert.equal('album' in tags, false);
    assert.equal('lyrics' in tags, false);
  });

  it('refuses a language it has no code for', () => {
    assert.throws(
      () => buildTags({ ...SNOW, sungLanguage: 'xx' }),
      /ISO_639_2/,
    );
  });
});
