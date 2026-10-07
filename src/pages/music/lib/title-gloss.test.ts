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
          transliteration: 'Agios o Skopos',
          titleTranslation: 'Holy Is the Purpose',
          titleLanguage,
        },
        'en',
        SHORT,
      ),
      ['Agios o Skopos', 'gr. Holy Is the Purpose'],
    );
    assert.deepEqual(
      titleGloss(
        {
          title,
          transliteration: 'Айос о Скопос',
          titleTranslation: 'Священна цель',
          titleLanguage,
        },
        'ru',
        { ...SHORT, el: 'греч.' },
      ),
      ['Айос о Скопос', 'греч. Священна цель'],
    );
  });

  it('never transliterates a title in the reader’s own script', () => {
    const song = {
      title: 'Окна',
      transliteration: 'Okna',
      titleLanguage: 'ru' as const,
    };

    assert.deepEqual(titleGloss(song, 'en', SHORT), ['Okna']);
    assert.deepEqual(titleGloss(song, 'ru', SHORT), []);
  });

  it('never transliterates a Latin title', () => {
    const song = {
      title: 'Alive',
      transliteration: 'Alive',
      titleTranslation: 'Живой',
      titleLanguage: 'en' as const,
    };

    assert.deepEqual(titleGloss(song, 'ru', SHORT), ['eng. Живой']);
  });

  it('leaves the translation unprefixed where the title has no language', () => {
    const song = {
      title: '8849',
      titleTranslation: '8849',
      titleLanguage: 'instrumental' as const,
    };

    assert.deepEqual(titleGloss(song, 'en', SHORT), ['8849']);
  });
});
