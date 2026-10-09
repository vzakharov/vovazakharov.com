/**
 * End-to-end tests for `pnpm test`'s selection of what the branch changed.
 *
 * Each case builds a throwaway git repository in the OS temp directory — a
 * commit standing in for the default branch, then the branch's own changes —
 * and runs the real script with `cwd` there. The repository borrows this one's
 * `node_modules` by symlink so the runner's `--import tsx` resolves.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts/test-changed.sh');

/** Files keyed by path relative to the repository root. */
type Tree = Record<string, string>;

type Run = { status: number; stdout: string; stderr: string };

const PASSING = `import { it } from 'node:test';\nit('passes', () => {});\n`;
const FAILING = `import { it } from 'node:test';\nit('fails', () => { throw new Error('ran'); });\n`;

function write(dir: string, tree: Tree): void {
  for (const [rel, source] of Object.entries(tree)) {
    const full = path.join(dir, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, source);
  }
}

function git(dir: string, ...args: string[]): void {
  const { status, stderr } = spawnSync('git', args, {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.equal(status, 0, stderr);
}

/** A repository whose `base` tree is the default branch and `branch` the work on top. */
function repo(base: Tree, branch: Tree, { noBase = false } = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'test-changed-'));
  git(dir, 'init', '-q');
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(dir, 'node_modules'));
  write(dir, { '.gitignore': 'node_modules\n', ...base });
  git(dir, 'add', '-A');
  git(dir, 'commit', '-qm', 'base');
  if (!noBase) git(dir, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  write(dir, branch);
  return dir;
}

function run(dir: string, ...args: string[]): Run {
  // Under `node --test` this process carries the runner's child context, which
  // would turn the nested runner's report into the parent's wire format.
  const env = { ...process.env };
  delete env['NODE_TEST_CONTEXT'];
  const { error, status, stdout, stderr } = spawnSync(SCRIPT, args, {
    cwd: dir,
    encoding: 'utf8',
    env,
  });
  assert.equal(error, undefined);
  return { status: status ?? -1, stdout, stderr };
}

/** The file list the script prints before handing it to the runner. */
function selected(stdout: string): string[] {
  const lines = stdout.split('\n');
  const start = lines.findIndex((line) => line.startsWith('test-changed: '));
  const list = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  ')) break;
    list.push(line.trim());
  }
  return list;
}

describe('test-changed: selection', () => {
  it('runs a changed test and the test beside a changed module, and nothing else', () => {
    const dir = repo(
      {
        'lib/a.ts': 'export const a = 1;\n',
        'lib/a.test.ts': PASSING,
        'lib/b.test.ts': PASSING,
        'lib/c.ts': 'export const c = 1;\n',
        'lib/c.test.ts': FAILING,
      },
      {
        'lib/a.ts': 'export const a = 2;\n',
        'lib/b.test.ts': `${PASSING}// touched\n`,
      },
    );
    const { status, stdout } = run(dir);
    assert.equal(status, 0, stdout);
    assert.deepEqual(selected(stdout), ['lib/a.test.ts', 'lib/b.test.ts']);
  });

  it('reaches an untracked test and a committed change alike', () => {
    const dir = repo({ 'lib/a.ts': 'export const a = 1;\n' }, {});
    write(dir, { 'lib/a.ts': 'export const a = 2;\n' });
    git(dir, 'commit', '-qam', 'branch work');
    write(dir, { 'lib/new.test.ts': PASSING, 'lib/a.test.ts': PASSING });
    const { status, stdout } = run(dir);
    assert.equal(status, 0, stdout);
    assert.deepEqual(selected(stdout), ['lib/a.test.ts', 'lib/new.test.ts']);
  });

  it('fails when a selected test fails', () => {
    const dir = repo(
      { 'lib/c.ts': 'export const c = 1;\n', 'lib/c.test.ts': FAILING },
      { 'lib/c.ts': 'export const c = 2;\n' },
    );
    const { status, stdout } = run(dir);
    assert.notEqual(status, 0);
    assert.deepEqual(selected(stdout), ['lib/c.test.ts']);
  });
});

describe('test-changed: edges', () => {
  it('says so and exits 0 when the branch reaches no test', () => {
    const dir = repo(
      { 'lib/c.ts': 'export const c = 1;\n', 'lib/c.test.ts': FAILING },
      { 'README.md': 'docs\n', 'lib/d.ts': 'export const d = 1;\n' },
    );
    const { status, stdout } = run(dir);
    assert.equal(status, 0);
    assert.match(stdout, /^test-changed: the branch reaches no test/);
  });

  it('exits 1 naming `pnpm test:all` when there is no merge base', () => {
    const dir = repo(
      { 'lib/a.test.ts': PASSING },
      { 'lib/a.test.ts': `${PASSING}// touched\n` },
      { noBase: true },
    );
    const { status, stderr } = run(dir);
    assert.equal(status, 1);
    assert.match(stderr, /no merge base/);
    assert.match(stderr, /pnpm test:all/);
  });

  it('passes explicit arguments straight to the runner', () => {
    const dir = repo(
      { 'lib/a.test.ts': PASSING, 'lib/c.test.ts': FAILING },
      {},
      { noBase: true },
    );
    const { status, stdout } = run(dir, 'lib/a.test.ts');
    assert.equal(status, 0, stdout);
    assert.doesNotMatch(stdout, /^test-changed:/m);
  });
});
