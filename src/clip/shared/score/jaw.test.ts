import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { jaw, syllables, wordAt } from './jaw';
import { WORDS } from './words';

const LINE = { text: 'тут', from: 2, to: 2.2 };
const CALL = { text: 'Ох', from: 2.1, to: 2.5 };
const WORDS_HERE = [{ text: 'Хорошо', from: 1, to: 1.6 }, LINE, CALL];

describe('syllables', () => {
  it('counts the vowels, either case, ё included', () => {
    assert.equal(syllables('Хорошо'), 3);
    assert.equal(syllables('ЁЛКА'), 2);
  });

  it('gives a word with no vowel one', () => {
    assert.equal(syllables('в'), 1);
  });
});

describe('jaw', () => {
  it('is shut before, between and after words', () => {
    for (const t of [0.5, 1.8, 3]) assert.equal(jaw(t, WORDS_HERE), 0);
  });

  it('opens once a syllable, shut at each syllable edge', () => {
    // Хорошо: three syllables of 0.2 s each.
    assert.equal(jaw(1, WORDS_HERE), 0);
    for (const n of [0, 1, 2]) {
      const middle = jaw(1 + 0.2 * n + 0.08, WORDS_HERE);
      assert.ok(
        middle > 0.9,
        `syllable ${String(n)} opens to ${String(middle)}`,
      );
      assert.ok(jaw(1 + 0.2 * n + 0.199, WORDS_HERE) < 0.4);
    }
  });

  it('stays in [0, 1]', () => {
    for (let t = 0; t < 3; t += 0.01) {
      const open = jaw(t, WORDS_HERE);
      assert.ok(open >= 0 && open <= 1);
    }
  });

  it('holds the wider of two overlapping words', () => {
    const t = 2.15;
    assert.equal(jaw(t, WORDS_HERE), Math.max(jaw(t, [LINE]), jaw(t, [CALL])));
  });

  it('reads the song by default', () => {
    const first = WORDS[0];
    assert.ok(first !== undefined);
    assert.ok(jaw((first.from + first.to) / 2) > 0);
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
