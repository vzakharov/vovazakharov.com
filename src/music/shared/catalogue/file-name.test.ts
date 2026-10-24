import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { songFileName, songFileNames } from './file-name.ts';
import { spell } from './spelling.ts';

const poluzhivye = spell({ text: 'Полуживые', language: 'ru' }, 'en');
const generated = { original: 'GENERATED' };

describe('songFileName', () => {
  it('names the artist first, in the script asked for', () => {
    const billing = {
      artists: [poluzhivye] as const,
      title: spell({ text: 'Снег идёт', language: 'ru' }, 'en'),
    };

    assert.equal(
      songFileName(billing, 'original', 'flac'),
      'Полуживые - Снег идёт.flac',
    );
    assert.equal(
      songFileName(billing, 'latin', 'flac'),
      'Poluzhivye - Sneg idyot.flac',
    );
  });

  it('bills features after the title, as download stores do', () => {
    assert.equal(
      songFileName(
        {
          artists: [poluzhivye, generated, { original: 'Майя' }],
          title: { original: 'Boom!' },
        },
        'original',
        'mp3',
      ),
      'Полуживые - Boom! feat. GENERATED & Майя.mp3',
    );
  });

  it('replaces what a filesystem refuses', () => {
    assert.equal(
      songFileName(
        { artists: [generated], title: { original: 'за/обложкой: why?.' } },
        'original',
        'mp3',
      ),
      'GENERATED - за_обложкой_ why__.mp3',
    );
  });
});

describe('songFileNames', () => {
  it('gives one name where both spellings agree', () => {
    assert.deepEqual(
      songFileNames(
        { artists: [generated], title: { original: 'Boom!' } },
        'flac',
      ),
      { original: 'GENERATED - Boom!.flac' },
    );
  });

  it('follows a locale that renames the song', () => {
    const breathe = { artists: [generated] as const };

    assert.deepEqual(
      songFileNames(
        {
          ...breathe,
          title: spell({ text: 'Повелитель ветра', language: 'ru' }, 'ru'),
        },
        'mp3',
      ),
      { original: 'GENERATED - Повелитель ветра.mp3' },
    );
    assert.deepEqual(
      songFileNames({ ...breathe, title: { original: 'Breathe' } }, 'mp3'),
      { original: 'GENERATED - Breathe.mp3' },
    );
  });
});
