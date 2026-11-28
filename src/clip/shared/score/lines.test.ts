import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CHANT, VERSE_CALLS } from './calls';
import { lineAt, linesOf, LYRIC_LINES } from './lines';
import { SUNG_LINES, WORDS } from './words';

const texts = (kind: string): string[] =>
  LYRIC_LINES.filter((line) => line.kind === kind).map(({ text }) => text);

describe('LYRIC_LINES', () => {
  it('holds every published line, every call and every chant but the one that closes a line', () => {
    assert.equal(texts('sung').length, SUNG_LINES.length);
    assert.equal(texts('call').length, VERSE_CALLS.length);
    assert.equal(texts('chant').length, CHANT.length - 1);
  });

  it('prints the words as the lyrics do', () => {
    const sung = texts('sung');
    assert.ok(sung.includes('Так хорошо-шо-шо не сдохнуть бы от счастья'));
    assert.ok(sung.includes('Ногтём-карандашом'));
    assert.ok(sung.includes('Не сдохнуть бы, как хорошо'));
  });

  it('spans its words, in order of onset, each found where it starts', () => {
    for (const line of LYRIC_LINES) {
      assert.equal(line.from, line.words[0]?.from);
      assert.equal(line.to, line.words.at(-1)?.to);
      for (const [n, word] of line.words.entries()) {
        const at = line.starts[n] ?? -1;
        assert.equal(
          line.text.slice(at, at + word.text.length).toLowerCase(),
          word.text.toLowerCase(),
        );
      }
    }
    for (let n = 1; n < LYRIC_LINES.length; n += 1) {
      assert.ok((LYRIC_LINES[n - 1]?.from ?? 0) <= (LYRIC_LINES[n]?.from ?? 0));
    }
  });

  it('times every line by a word the song sings', () => {
    const onsets = new Set(WORDS.map(({ from }) => from));
    for (const line of LYRIC_LINES) assert.ok(onsets.has(line.from), line.text);
  });
});

const word = (text: string, from: number, to: number) => ({
  text,
  from,
  to,
});

describe('linesOf', () => {
  it('lets a chant close the line only when it follows at once', () => {
    const lines = linesOf(
      [[word('Как', 1, 1.5)], [word('Ну', 5, 5.5)]],
      [],
      [word('Хорошо', 1.7, 2.2), word('Хорошо', 7, 7.5)],
    );
    assert.deepEqual(
      lines.map(({ text, kind }) => [text, kind]),
      [
        ['Как хорошо', 'sung'],
        ['Ну', 'sung'],
        ['Хорошо', 'chant'],
      ],
    );
  });
});

describe('lineAt', () => {
  it('is the latest line begun, none before the first', () => {
    assert.equal(lineAt(0.1), undefined);
    assert.equal(lineAt(0.7)?.text, 'Не сдохнуть бы от счастья');
    assert.equal(lineAt(25)?.text, 'Как, сука, хорошо');
    assert.equal(lineAt(27.7)?.kind, 'call');
  });
});
