/**
 * End-to-end tests for the typography gate: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * report. The fixtures are written here because a committed `.md` holding
 * what the gate flags would trip the repo's own run.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'check-typography.ts');

/** Markdown files, keyed by path relative to the scan root. */
type Tree = Record<string, string>;

function run(tree: Tree) {
  const root = mkdtempSync(path.join(tmpdir(), 'typography-'));
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
  'Prose with “curly” quotes, it’s apostrophe and a `"code span\'s"`.',
  '',
  '```json',
  '{ "key": "value" }',
  '```',
  '',
  '<img alt="raw HTML" src="/x.png" />',
  '',
].join('\n');

/** A draft whose notes around the fence carry every mark, so only the post text can trip. */
const draft = (post: string) =>
  [
    '# Notes -- about the “post” — any marks',
    '',
    '```text',
    post,
    '```',
    '',
  ].join('\n');

describe('check-typography', () => {
  it('passes quotes that are syntax: frontmatter, code and raw HTML', () => {
    const { status, stdout } = run({ 'apps/a/public/doc.md': SYNTAX_ONLY });
    assert.equal(status, 0);
    assert.equal(stdout, 'typography: clean\n');
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

  it('fails a straight apostrophe in prose', () => {
    const { status, stdout } = run({
      'apps/a/public/doc.md': "It's straight.\n",
    });
    assert.equal(status, 1);
    assert.match(stdout, /^apps\/a\/public\/doc\.md:1: It's straight\.$/m);
  });

  it('fails two hyphens in prose, and passes them in code', () => {
    const { status, stdout } = run({
      'apps/a/public/doc.md': 'Run `pnpm x --check` -- then wait.\n',
    });
    assert.equal(status, 1);
    assert.match(stdout, /two hyphens/);
    assert.match(stdout, /^apps\/a\/public\/doc\.md:1: /m);
  });

  it('fails typeset punctuation in a keyboard channel’s post, not around it', () => {
    const { status, stdout } = run({
      'writing/linkedin/drafts/post.md': draft('Typeset — not “fine”.'),
    });
    assert.equal(status, 1);
    assert.match(stdout, /keyboard channel/);
    assert.match(
      stdout,
      /^writing\/linkedin\/drafts\/post\.md:4: Typeset — not “fine”\.$/m,
    );
    assert.doesNotMatch(stdout, /post\.md:1:/);
  });

  it('fails keyboard punctuation in any other channel’s post', () => {
    const { status, stdout } = run({
      'writing/linkedin/drafts/ok.md': draft('Typed -- as "typed".'),
      'writing/channel/drafts/post.md': draft('Typed -- not fine.'),
    });
    assert.equal(status, 1);
    assert.match(stdout, /typeset channel/);
    assert.match(stdout, /^writing\/channel\/drafts\/post\.md:4: /m);
    assert.doesNotMatch(stdout, /ok\.md/);
  });

  it('skips the pipeline’s generated output', () => {
    const { status } = run({
      'apps/a/public/generated/out.md': 'A "generated" line.\n',
    });
    assert.equal(status, 0);
  });
});
