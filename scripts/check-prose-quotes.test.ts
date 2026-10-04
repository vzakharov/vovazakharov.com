/**
 * End-to-end tests for the prose-quotes gate: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * report. The fixtures are written here because a committed `.md` holding a
 * straight quote in prose would trip the repo's own run.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'check-prose-quotes.ts');

/** Markdown files, keyed by path relative to the scan root. */
type Tree = Record<string, string>;

function run(tree: Tree) {
  const root = mkdtempSync(path.join(tmpdir(), 'prose-quotes-'));
  for (const [file, text] of Object.entries(tree)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd: root,
    encoding: 'utf8',
  });
  return { status, stdout };
}

const SYNTAX_ONLY = [
  '---',
  'title: "A quoted title"',
  '---',
  '',
  'Prose with “curly” quotes and a `"code span"`.',
  '',
  '```json',
  '{ "key": "value" }',
  '```',
  '',
  '<img alt="raw HTML" src="/x.png" />',
  '',
].join('\n');

describe('check-prose-quotes', () => {
  it('passes quotes that are syntax: frontmatter, code and raw HTML', () => {
    const { status, stdout } = run({ 'apps/a/public/doc.md': SYNTAX_ONLY });
    assert.equal(status, 0);
    assert.equal(stdout, 'prose-quotes: clean\n');
  });

  it('fails a straight quote in prose, naming the file and line', () => {
    const { status, stdout } = run({
      'apps/a/public/doc.md': `${SYNTAX_ONLY}\nShe said "no" twice.\n`,
    });
    assert.equal(status, 1);
    assert.match(
      stdout,
      /^apps\/a\/public\/doc\.md:13: She said "no" twice\.$/m,
    );
  });

  it('skips the pipeline’s generated output', () => {
    const { status } = run({
      'apps/a/public/generated/out.md': 'A "generated" line.\n',
    });
    assert.equal(status, 0);
  });
});
