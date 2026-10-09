import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { stanzaRepeats } from './stanza-repeats.ts';

const FRONTMATTER = "---\ntitle: 'Song'\n---\n\n";

function song(...sections: string[]): string {
  return `${FRONTMATTER}${sections.join('\n\n')}\n`;
}

const lyrics = (language: string, ...stanzas: string[]) =>
  [`<!-- lyrics:${language} -->`, ...stanzas].join('\n\n');

describe('stanzaRepeats', () => {
  it('leaves a song without repeats alone', () => {
    const source = song(lyrics('en', 'A\nB', 'C\nD', 'A\nB'));
    assert.deepEqual(stanzaRepeats(source), { repeats: [], fixed: source });
  });

  it('collapses two identical stanzas into one closed by x2', () => {
    const { repeats, fixed } = stanzaRepeats(
      song(lyrics('en', 'Verse', 'A\nB', 'A\nB', 'End')),
    );
    assert.equal(fixed, song(lyrics('en', 'Verse', 'A\nB\nx2', 'End')));
    assert.equal(repeats.length, 1);
    assert.equal(repeats[0]?.refused, undefined);
  });

  it('counts a run of three as x3', () => {
    const { fixed } = stanzaRepeats(song(lyrics('en', 'A', 'A', 'A')));
    assert.equal(fixed, song(lyrics('en', 'A\nx3')));
  });

  it('adds to an xN the run already carries, on either side', () => {
    assert.equal(
      stanzaRepeats(song(lyrics('en', 'A\nB\nx2', 'A\nB'))).fixed,
      song(lyrics('en', 'A\nB\nx3')),
    );
    assert.equal(
      stanzaRepeats(song(lyrics('en', 'A\nB', 'A\nB\nx2'))).fixed,
      song(lyrics('en', 'A\nB\nx3')),
    );
  });

  it('collapses the words, the crib and the romanization together', () => {
    const { repeats, fixed } = stanzaRepeats(
      song(
        lyrics('ru', 'Раз', 'Два', 'Два'),
        lyrics('ru-latn', 'raz', 'dva', 'dva'),
        lyrics('en', 'One', 'Two', 'Two'),
      ),
    );
    assert.equal(
      fixed,
      song(
        lyrics('ru', 'Раз', 'Два\nx2'),
        lyrics('ru-latn', 'raz', 'dva\nx2'),
        lyrics('en', 'One', 'Two\nx2'),
      ),
    );
    assert.deepEqual(
      repeats.map(({ section }) => section),
      ['lyrics:ru', 'lyrics:ru-latn', 'lyrics:en'],
    );
  });

  it('reads a stanza a parallel section varies as no repeat', () => {
    const source = song(
      lyrics('ru', 'Раз', 'Раз'),
      lyrics('en', 'One', 'Once'),
    );
    const { repeats, fixed } = stanzaRepeats(source);
    assert.equal(fixed, source);
    assert.deepEqual(repeats, []);
  });

  it('refuses every repeat once the sections have slipped apart', () => {
    const source = song(lyrics('ru', 'Раз', 'Раз'), lyrics('en', 'One'));
    const { repeats, fixed } = stanzaRepeats(source);
    assert.equal(fixed, source);
    assert.match(repeats[0]?.refused ?? '', /different stanza counts/);
  });

  it('reads stanzas a footnote marker sets apart as different', () => {
    const source = song(lyrics('en', 'A[^a]', 'A', '[^a]: A note.'));
    assert.deepEqual(stanzaRepeats(source).repeats, []);
  });

  it('skips a block of note definitions, keeping it, as the page does', () => {
    const { fixed } = stanzaRepeats(
      song(lyrics('en', 'X[^x]', 'A', '[^x]: A note.', 'A')),
    );
    assert.equal(fixed, song(lyrics('en', 'X[^x]', 'A\nx2', '[^x]: A note.')));
  });

  it('leaves repeated paragraphs in a story alone', () => {
    const source = song(
      '<!-- lang:en -->',
      'Same.',
      'Same.',
      lyrics('en', 'A'),
    );
    assert.deepEqual(stanzaRepeats(source), { repeats: [], fixed: source });
  });

  it('reports the offset of the stanza that repeats', () => {
    const source = song(lyrics('en', 'A', 'A'));
    const [repeat] = stanzaRepeats(source).repeats;
    assert.equal(repeat?.offset, source.lastIndexOf('A'));
  });
});
