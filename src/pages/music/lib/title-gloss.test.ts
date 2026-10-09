import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { titleGloss } from './title-gloss';

describe('titleGloss', () => {
  it('transliterates a Greek title into each reader’s letters', () => {
    const title = 'Άγιος Ο Σκοπός';

    assert.deepEqual(
      titleGloss(
        {
          title,
          gloss: {
            transliteration: 'Agios o Skopos',
            translation: 'Holy Is the Purpose',
          },
        },
        'en',
      ),
      {
        transliteration: 'Agios o Skopos',
        translation: 'Holy Is the Purpose',
      },
    );
    assert.deepEqual(
      titleGloss(
        {
          title,
          gloss: {
            transliteration: 'Айос о Скопос',
            translation: 'Священна цель',
          },
        },
        'ru',
      ),
      {
        transliteration: 'Айос о Скопос',
        translation: 'Священна цель',
      },
    );
  });

  it('never transliterates a title in the reader’s own script', () => {
    const song = {
      title: 'Окна',
      gloss: { transliteration: 'Okna' },
    };

    assert.deepEqual(titleGloss(song, 'en'), {
      transliteration: 'Okna',
    });
    assert.deepEqual(titleGloss(song, 'ru'), {});
  });

  it('never transliterates a Latin title', () => {
    const song = {
      title: 'Alive',
      gloss: { transliteration: 'Alive', translation: 'Живой' },
    };

    assert.deepEqual(titleGloss(song, 'ru'), {
      translation: 'Живой',
    });
  });

  it('says nothing of a title the locale renames or leaves unglossed', () => {
    const song = { title: 'Повелитель ветра' };

    assert.deepEqual(titleGloss(song, 'ru'), {});
  });
});
