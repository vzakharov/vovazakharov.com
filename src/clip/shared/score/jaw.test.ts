import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { jaw, syllables, wordAt } from './jaw';
import { WORDS } from './words';

/** The film's frames a second, which the jaw is read on. */
const FPS = 30;
const LINE = { text: 'тут', from: 2, to: 2.2 };
const CALL = { text: 'Ох', from: 2.1, to: 2.5 };
const WORDS_HERE = [{ text: 'Хорошо', from: 1, to: 1.6 }, LINE, CALL];

/** No stem anywhere, so every word opens a syllable at a time. */
const unmeasured = (): undefined => undefined;
/** The stem as loud as it gets, everywhere. */
const loud = (): number => 1;

describe('syllables', () => {
  it('counts the vowels, either case, ё included', () => {
    assert.equal(syllables('Хорошо'), 3);
    assert.equal(syllables('ЁЛКА'), 2);
  });

  it('gives a word with no vowel one', () => {
    assert.equal(syllables('в'), 1);
  });
});

/** The jaw's widest and narrowest over `[from, to]`, on the film's frames. */
function range(from: number, to: number): { widest: number; shut: number } {
  let [widest, shut] = [0, 1];
  for (let n = Math.ceil(from * FPS); n <= to * FPS; n += 1) {
    widest = Math.max(widest, jaw(n / FPS));
    shut = Math.min(shut, jaw(n / FPS));
  }
  return { widest, shut };
}

/**
 * The first stanza's words, and the last word of each of its lines; «б»,
 * a consonant alone, is sung with the mouth shut.
 */
const STANZA = WORDS.filter((word) => word.to < 18);
const VOICED = STANZA.filter((word) => /[аеёиоуыэюя]/iu.test(word.text));
const LINE_ENDS = [
  'счастья',
  'серотонинопаде',
  'ненастье',
  'дурдома',
  'шо',
  'слова',
  'карандашом',
  'Как,',
];

describe('jaw, read off the stem', () => {
  it('follows the stem, whether or not a word span covers the time', () => {
    for (const t of [0.5, 1.8, 3]) assert.equal(jaw(t, WORDS_HERE, loud), 1);
    assert.equal(
      jaw(1.3, WORDS_HERE, () => 0.3),
      0,
    );
    const half = jaw(1.3, WORDS_HERE, () => 0.725);
    assert.ok(half > 0.4 && half < 0.6, String(half));
  });

  it('opens inside every word of the first stanza', () => {
    for (const word of VOICED) {
      const { widest } = range(word.from, word.to);
      assert.ok(widest >= 0.5, `${word.text} opens only to ${String(widest)}`);
    }
  });

  it('shuts at the first stanza’s line breaks, and before its first word', () => {
    assert.equal(range(0, 0.3).shut, 0);
    for (const end of LINE_ENDS) {
      const at = STANZA.findIndex((word) => word.text === end);
      const [last, next] = [STANZA[at], STANZA[at + 1]];
      assert.ok(last !== undefined && next !== undefined, end);
      const { shut } = range(last.to - 0.25, next.from);
      assert.equal(shut, 0, `open through the break after ${end}`);
    }
  });

  it('holds a vowel the singer holds past its word span', () => {
    // «бы» is sung on to 1.68, where Whisper ends it at 1.48.
    assert.ok(range(1.5, 1.64).shut > 0.5);
  });
});

describe('jaw, where no stem was measured', () => {
  it('is shut before, between and after words', () => {
    for (const t of [0.5, 1.8, 3]) {
      assert.equal(jaw(t, WORDS_HERE, unmeasured), 0);
    }
  });

  it('opens once a syllable, shut at each syllable edge', () => {
    // Хорошо: three syllables of 0.2 s each.
    assert.equal(jaw(1, WORDS_HERE, unmeasured), 0);
    for (const n of [0, 1, 2]) {
      const middle = jaw(1 + 0.2 * n + 0.08, WORDS_HERE, unmeasured);
      assert.ok(
        middle > 0.9,
        `syllable ${String(n)} opens to ${String(middle)}`,
      );
      assert.ok(jaw(1 + 0.2 * n + 0.199, WORDS_HERE, unmeasured) < 0.4);
    }
  });

  it('stays in [0, 1]', () => {
    for (let t = 0; t < 3; t += 0.01) {
      const open = jaw(t, WORDS_HERE, unmeasured);
      assert.ok(open >= 0 && open <= 1);
    }
  });

  it('holds the wider of two overlapping words', () => {
    const t = 2.15;
    assert.equal(
      jaw(t, WORDS_HERE, unmeasured),
      Math.max(jaw(t, [LINE], unmeasured), jaw(t, [CALL], unmeasured)),
    );
  });

  it('opens on the last word, which the stem ends before', () => {
    const last = WORDS.at(-1);
    assert.ok(last !== undefined);
    assert.ok(jaw(last.from + (last.to - last.from) * 0.1) > 0);
  });
});

describe('wordAt', () => {
  it('names the word sung, none between words', () => {
    assert.equal(wordAt(1.3, WORDS_HERE)?.text, 'Хорошо');
    assert.equal(wordAt(1.8, WORDS_HERE), undefined);
  });

  it('takes the latest begun where two overlap', () => {
    assert.equal(wordAt(2.15, WORDS_HERE)?.text, 'Ох');
  });
});

describe('the song’s words', () => {
  it('are sorted by onset, each ending after it begins', () => {
    for (const [n, word] of WORDS.entries()) {
      assert.ok(word.to > word.from, word.text);
      const next = WORDS[n + 1];
      if (next) assert.ok(next.from >= word.from, next.text);
    }
  });
});
