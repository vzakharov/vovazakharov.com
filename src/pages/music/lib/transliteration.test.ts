import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Locale } from '@/shared/i18n';
import type { SungLanguage } from '@/shared/music-catalogue';

import { readVerse } from './lyric-notes';
import { splitSections } from './sections';
import {
  alignTransliteration,
  romanizedTag,
  wordsInLatin,
} from './transliteration';

const FILE = 'song.md';

const WORDS = readVerse(['Один', 'Два', '', 'Три'].join('\n'), FILE);

describe('alignTransliteration', () => {
  it('pairs each line with its romanization, stanza for stanza', () => {
    assert.deepEqual(
      alignTransliteration(WORDS, ['Odin', 'Dva', '', 'Tri'].join('\n'), FILE),
      [['Odin', 'Dva'], ['Tri']],
    );
  });

  it('gives a block of lines under one note as many romanized lines', () => {
    const words = readVerse(
      ['Раз[^n]', 'Два[^n]', 'Три', '', '[^n]: Счёт.'].join('\n'),
      FILE,
    );

    assert.deepEqual(
      alignTransliteration(words, ['Raz', 'Dva', 'Tri'].join('\n'), FILE),
      [['Raz\nDva', 'Tri']],
    );
  });

  it('fails on a stanza count that does not match', () => {
    assert.throws(
      () =>
        alignTransliteration(WORDS, ['Odin', 'Dva', 'Tri'].join('\n'), FILE),
      /2 stanzas and 1 in its transliteration/,
    );
  });

  it('fails on a stanza whose line count does not match', () => {
    assert.throws(
      () =>
        alignTransliteration(
          WORDS,
          ['Odin', '', 'Dva', 'Tri'].join('\n'),
          FILE,
        ),
      /stanza 1 has 2 lines and 1 in its transliteration/,
    );
  });

  it('fails on a note in the transliteration', () => {
    assert.throws(
      () =>
        alignTransliteration(
          WORDS,
          ['Odin[^n]', 'Dva', '', 'Tri', '', '[^n]: Count.'].join('\n'),
          FILE,
        ),
      /“Odin\[\^n]” carries a note/,
    );
  });
});

const spell = (
  words: string,
  languages: SungLanguage[],
  romanized: Partial<Record<SungLanguage, string>> = {},
  locale: Locale = 'en',
) =>
  wordsInLatin({
    stanzas: readVerse(words, FILE),
    locale,
    languages,
    romanized: (language) => romanized[language],
    fileName: FILE,
  });

describe('wordsInLatin', () => {
  it('romanizes Russian by rule for a reader of English, entry by entry', () => {
    const words = [
      '[Раз][^n] два',
      'Ещё[^m]',
      'Всё[^m]',
      '',
      '[^n]: Счёт.',
      '[^m]: Ну.',
    ].join('\n');

    assert.deepEqual(spell(words, ['ru']), [['Raz dva', 'Yeshcho\nVsyo']]);
  });

  it('gives a reader of Russian nothing for Russian words', () => {
    assert.equal(spell('Раз\nДва', ['ru'], {}, 'ru'), undefined);
  });

  it('leaves a line in Latin letters as it is, beside one that needs them', () => {
    assert.deepEqual(spell('Hello\nРаз', ['en', 'ru']), [[undefined, 'Raz']]);
  });

  it('takes a secondary language’s lines from its section, in order', () => {
    assert.deepEqual(
      spell('Hello, Άρτεμις\nGoodbye\nΘήραμα', ['en', 'el'], {
        el: 'Hello, Ártemis\n\nThírama',
      }),
      [['Hello, Ártemis', undefined, 'Thírama']],
    );
  });

  it('romanizes each line of an entry under one note on its own', () => {
    const words = ['Είμαι[^n]', 'Here[^n]', '', '[^n]: Me.'].join('\n');

    assert.deepEqual(spell(words, ['en', 'el'], { el: 'Íme' }), [
      ['Íme\nHere'],
    ]);
  });

  it('counts a section’s lines whatever the reader reads', () => {
    assert.deepEqual(spell('Раз\n一\nДва', ['ru', 'zh'], { zh: 'yī' }, 'ru'), [
      [undefined, 'yī', undefined],
    ]);
  });

  it('lets the main language’s section romanize every line', () => {
    assert.deepEqual(spell('Раз\nДва', ['ru'], { ru: 'Raaz\nDvaa' }), [
      ['Raaz', 'Dvaa'],
    ]);
  });

  it('fails on a section short of lines', () => {
    assert.throws(
      () => spell('Θήραμα\nΆγιος', ['en', 'el'], { el: 'Thírama' }),
      /“Άγιος” has no line left in the “lyrics:el-latn” section/,
    );
  });

  it('fails on a section with lines to spare', () => {
    assert.throws(
      () => spell('Θήραμα', ['en', 'el'], { el: 'Thírama\nÁgios' }),
      /“lyrics:el-latn” section has 1 line\(s\) more/,
    );
  });

  it('fails on a language no rule romanizes and no section spells', () => {
    assert.throws(
      () => spell('Θήραμα', ['en', 'el']),
      /“Θήραμα” is in el, which no rule romanizes/,
    );
  });

  it('fails on letters of a language the song does not list', () => {
    assert.throws(
      () => spell('Hello, Άρτεμις', ['en']),
      /“Hello, Άρτεμις” has letters in a script none of the song’s languages/,
    );
  });

  it('fails on a line mixing two languages’ letters', () => {
    assert.throws(
      () => spell('Раз 一', ['ru', 'zh'], { zh: 'yī' }),
      /“Раз 一” mixes ru and zh letters/,
    );
  });

  it('fails on a note in a secondary section', () => {
    assert.throws(
      () =>
        spell('Θήραμα', ['en', 'el'], {
          el: 'Thírama[^n]\n\n[^n]: Prey.',
        }),
      /carries a note/,
    );
  });
});

describe('romanizedTag', () => {
  it('names a section the body splits on', () => {
    const body = [
      '<!-- lyrics:ar -->',
      'Words',
      `<!-- lyrics:${romanizedTag('ar')} -->`,
      'Romanized',
    ].join('\n');

    assert.equal(splitSections(body).get('lyrics:ar-latn'), 'Romanized');
  });
});
