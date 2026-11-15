import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cyrillicLines } from './cyrillic.ts';

describe('cyrillicLines', () => {
  it('finds nothing in English, curly quotes and emoji included', () => {
    assert.deepEqual(cyrillicLines('text: “we’ll think later” ☁️\nid: x'), []);
  });

  it('names each line with Cyrillic and its first run of words', () => {
    assert.deepEqual(
      cyrillicLines('a: ok\nb: Vova: «думаем позже», later\nc: ёж'),
      [
        { line: 2, words: 'думаем позже' },
        { line: 3, words: 'ёж' },
      ],
    );
  });
});
