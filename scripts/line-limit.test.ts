import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { z } from 'zod';

import {
  ALLOWLIST_PATH,
  countLines,
  isChecked,
  LIMIT,
  readLines,
  violations,
} from './line-limit';

const ROOT = path.resolve(import.meta.dirname, '..');

function assertOne(found: string[], expected: RegExp): void {
  assert.equal(found.length, 1, found.join('\n'));
  assert.match(found.join(''), expected);
}

describe('countLines', () => {
  it('counts as wc -l does, plus an unterminated last line', () => {
    assert.equal(countLines(''), 0);
    assert.equal(countLines('a\nb\n'), 2);
    assert.equal(countLines('a\nb'), 2);
  });
});

describe('isChecked', () => {
  it('skips the lockfile, exported threads, JSON data and vendored apps', () => {
    for (const file of [
      'pnpm-lock.yaml',
      '.claude/artifacts/types/claude-runtime/comments.d.ts',
      'docs/pr/255/pr.md',
      'docs/issue/9/issue.md',
      'src/x/lexicon.json',
      'src/x/ledger.jsonl',
    ])
      assert.equal(isChecked(file), false, file);
    assert.equal(isChecked('src/x/picks.yaml'), true);
  });
});

describe('violations', () => {
  const over = LIMIT + 10;

  it('passes files under the limit and listed files at their entry', () => {
    const lengths = new Map([
      ['a.ts', LIMIT],
      ['b.ts', over],
    ]);
    assert.deepEqual(violations(lengths, { 'b.ts': over }), []);
  });

  it('fails a file over the limit that is not listed', () => {
    assertOne(violations(new Map([['a.ts', over]]), {}), /split it/u);
  });

  it('fails a listed file that grew, and one that shrank past its entry', () => {
    const entry = { 'a.ts': over };
    assertOne(
      violations(new Map([['a.ts', over + 1]]), entry),
      /may only shrink/u,
    );
    assertOne(
      violations(new Map([['a.ts', over - 1]]), entry),
      /lower its entry/u,
    );
  });

  it('fails an entry for a file gone or back under the limit', () => {
    const entry = { 'a.ts': over };
    assertOne(violations(new Map(), entry), /gone/u);
    assertOne(
      violations(new Map([['a.ts', LIMIT]]), entry),
      /under the limit/u,
    );
  });

  it("holds a staged copy to its original's entry, shrinking freely", () => {
    const entry = { 'CLAUDE.md': over };
    const copy = '.claude/staged/CLAUDE.md.staged';
    const lengths = (lines: number) =>
      new Map([
        ['CLAUDE.md', over],
        [copy, lines],
      ]);
    assert.deepEqual(violations(lengths(over - 5), entry), []);
    assertOne(violations(lengths(over + 1), entry), /may only shrink/u);
  });
});

describe('the tree', () => {
  it(`keeps every text file within ${LIMIT} lines or its allowlist entry`, () => {
    const files = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard'],
      { cwd: ROOT, encoding: 'utf8' },
    )
      .split('\n')
      .filter((file) => file !== '' && isChecked(file));
    const lengths = new Map<string, number>();
    for (const file of files) {
      const full = path.join(ROOT, file);
      if (!existsSync(full) || !statSync(full).isFile()) continue;
      const lines = readLines(full);
      if (lines !== null) lengths.set(file, lines);
    }
    const allowlist = z
      .record(z.string(), z.number().int())
      .parse(JSON.parse(readFileSync(path.join(ROOT, ALLOWLIST_PATH), 'utf8')));
    assert.deepEqual(violations(lengths, allowlist), []);
  });
});
