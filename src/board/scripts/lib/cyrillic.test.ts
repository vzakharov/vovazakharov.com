import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';

import { cyrillicLines, russianOnBoard } from './cyrillic.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

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

describe('russianOnBoard', () => {
  it('prints each Cyrillic line as a repo path, line and words', () => {
    const file = path.join(REPO_ROOT, 'src/x-board/app/config/x/a.yaml');
    assert.deepEqual(russianOnBoard(new Map([[file, 'a: ok\nb: привет']])), [
      'src/x-board/app/config/x/a.yaml:2: “привет”',
    ]);
  });
});
