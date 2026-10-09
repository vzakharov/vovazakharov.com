import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { readVerse } from './lyric-notes';
import { splitSections } from './sections';
import { alignTransliteration, romanizedTag } from './transliteration';

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
