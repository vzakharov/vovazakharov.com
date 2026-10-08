import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { titleGloss } from './title-gloss';

const SHORT = {
  ru: 'rus.',
  en: 'eng.',
  tt: 'tat.',
  ar: 'ar.',
  pl: 'pol.',
  la: 'lat.',
  zh: 'chin.',
  fr: 'fr.',
  el: 'gr.',
  de: 'ger.',
  it: 'it.',
  es: 'sp.',
};

describe('titleGloss', () => {
  it('transliterates a Greek title into each reader’s letters', () => {
    const title = 'Άγιος Ο Σκοπός';
    const titleLanguage = 'el' as const;

    assert.deepEqual(
      titleGloss(
        {
          title,
          gloss: {
            transliteration: 'Agios o Skopos',
            translation: 'Holy Is the Purpose',
          },
          titleLanguage,
        },
        'en',
        SHORT,
      ),
      {
        transliteration: 'Agios o Skopos',
        translation: 'gr. Holy Is the Purpose',
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
          titleLanguage,
        },
        'ru',
        { ...SHORT, el: 'греч.' },
      ),
      {
        transliteration: 'Айос о Скопос',
        translation: 'греч. Священна цель',
      },
    );
  });

  it('never transliterates a title in the reader’s own script', () => {
    const song = {
      title: 'Окна',
      gloss: { transliteration: 'Okna' },
      titleLanguage: 'ru' as const,
    };

    assert.deepEqual(titleGloss(song, 'en', SHORT), {
      transliteration: 'Okna',
    });
    assert.deepEqual(titleGloss(song, 'ru', SHORT), {});
  });

  it('never transliterates a Latin title', () => {
    const song = {
      title: 'Alive',
      gloss: { transliteration: 'Alive', translation: 'Живой' },
      titleLanguage: 'en' as const,
    };

    assert.deepEqual(titleGloss(song, 'ru', SHORT), {
      translation: 'eng. Живой',
    });
  });

  it('leaves the translation unprefixed where the title has no language', () => {
    const song = {
      title: '8849',
      gloss: { translation: '8849' },
      titleLanguage: 'instrumental' as const,
    };

    assert.deepEqual(titleGloss(song, 'en', SHORT), {
      translation: '8849',
    });
  });

  it('says nothing of a title the locale renames or leaves unglossed', () => {
    const song = { title: 'Повелитель ветра', titleLanguage: 'en' as const };

    assert.deepEqual(titleGloss(song, 'ru', SHORT), {});
  });
});
