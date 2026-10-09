/**
 * End-to-end tests for the stanza-repeats gate: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code,
 * report and the file it leaves. The core's cases are
 * `lib/stanza-repeats.test.ts`'s; these hold the two modes.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'check-stanza-repeats.ts');
const SONG = 'apps/vova/public/music/song.md';

function run(markdown: string, ...args: string[]) {
  const root = mkdtempSync(path.join(tmpdir(), 'stanza-repeats-'));
  const file = path.join(root, SONG);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, markdown);
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return { status, stdout, after: readFileSync(file, 'utf8') };
}

const REPEATED = '<!-- lyrics:en -->\n\nA\nB\n\nA\nB\n';

describe('check-stanza-repeats', () => {
  it('passes a song without repeats', () => {
    const { status, stdout } = run('<!-- lyrics:en -->\n\nA\n\nB\n');
    assert.equal(stdout, 'stanza-repeats: clean\n');
    assert.equal(status, 0);
  });

  it('fails a repeat, naming the file and line, and writes nothing', () => {
    const { status, stdout, after } = run(REPEATED);
    assert.equal(status, 1);
    assert.ok(stdout.includes(`${SONG}:6: A`), stdout);
    assert.equal(after, REPEATED);
  });

  it('collapses it with --fix and passes', () => {
    const { status, stdout, after } = run(REPEATED, '--fix');
    assert.equal(status, 0);
    assert.ok(stdout.includes(SONG), stdout);
    assert.equal(after, '<!-- lyrics:en -->\n\nA\nB\nx2\n');
  });

  it('fails with --fix on a repeat it cannot collapse', () => {
    const source =
      '<!-- lyrics:ru -->\n\nА\n\nА\n\n<!-- lyrics:en -->\n\nA\n\nB\n';
    const { status, stdout, after } = run(source, '--fix');
    assert.equal(status, 1);
    assert.match(stdout, /lyrics:en/);
    assert.equal(after, source);
  });
});
