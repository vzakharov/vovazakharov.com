/**
 * End-to-end tests for the masked-words gate: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * report. The fixtures are written here because a committed `.md` holding a
 * masked word would trip the repo's own run.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'check-masked-words.ts');

function run(markdown: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'masked-words-'));
  const file = path.join(root, 'apps/a/public/song.md');
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, markdown);
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd: root,
    encoding: 'utf8',
  });
  return { status, stdout };
}

describe('check-masked-words', () => {
  it('passes emphasis, a footnote-style asterisk and a code span', () => {
    const { status, stdout } = run(
      [
        'Some *emphasis*, some **strong**, a mid*word*emphasis.',
        'A note marker*',
        '',
        '* a list item',
        '',
        'A `f*ck` in code.',
        '',
      ].join('\n'),
    );
    assert.equal(stdout, 'masked-words: clean\n');
    assert.equal(status, 0);
  });

  for (const masked of [
    String.raw`F\*ck`,
    String.raw`f\*\*k`,
    String.raw`Нах\*й`,
    String.raw`уё\*ки`,
    String.raw`s\*\*\*`,
    'f**k',
  ])
    it(`fails ${masked}, naming the file and line`, () => {
      const { status, stdout } = run(`Clean line\nSo ${masked} funny\n`);
      assert.equal(status, 1);
      assert.ok(
        stdout.includes(`apps/a/public/song.md:2: So ${masked} funny`),
        stdout,
      );
    });

  it('fails a mask in the frontmatter', () => {
    const { status, stdout } = run(
      "---\ntitle: 'F*ck Religion'\n---\n\nText\n",
    );
    assert.equal(status, 1);
    assert.match(stdout, /song\.md:2: title: 'F\*ck Religion'/);
  });
});
