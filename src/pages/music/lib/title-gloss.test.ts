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
};

describe('titleGloss', () => {
  it('transliterates a Greek title for every reader', () => {
    const song = {
      title: 'Άγιος Ο Σκοπός',
      transliteration: 'Agios o Skopos',
      titleTranslation: 'Holy is the purpose',
      titleLanguage: 'el' as const,
    };

    assert.deepEqual(titleGloss(song, 'en', SHORT), [
      'Agios o Skopos',
      'gr. Holy is the purpose',
    ]);
    assert.deepEqual(titleGloss(song, 'ru', SHORT), [
      'Agios o Skopos',
      'gr. Holy is the purpose',
    ]);
  });

  it('transliterates a Russian title for an English reader only', () => {
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
