/**
 * Tests for the PR body cap: the crossing rule in `lib/pr-body-cap.sh`, called
 * directly, and the real `check-pr-body-size.sh` run against a stub `gh` placed
 * first on `PATH`, so no case reaches GitHub. The stub answers by which query
 * it is handed, mirroring the three the script sends.
 */

import assert from 'node:assert/strict';
import {
  execFileSync,
  spawnSync,
  type SpawnSyncReturns,
} from 'node:child_process';
import { chmodSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const LIB = path.join(ROOT, 'scripts/lib/pr-body-cap.sh');
const SCRIPT = path.join(ROOT, 'scripts/check-pr-body-size.sh');
const CEILING = 32_000;
const TARGET = 24_000;

const which = (tool: string) =>
  execFileSync('sh', ['-c', `command -v ${tool}`], {
    encoding: 'utf8',
  }).trim();

const BASH = which('bash');

type Run = { status: number; stdout: string; stderr: string };

function settle({
  error,
  status,
  stdout,
  stderr,
}: SpawnSyncReturns<string>): Run {
  assert.equal(error, undefined);
  return { status: status ?? -1, stdout, stderr };
}

function cap(
  args: Array<number | string>,
  history: number[] | string = [],
): Run {
  const input = typeof history === 'string' ? history : history.join('\n');
  return settle(
    spawnSync(
      'sh',
      ['-c', `. "${LIB}" && pr_body_cap "$@"`, 'sh', ...args.map(String)],
      { encoding: 'utf8', input },
    ),
  );
}

const rule = (current: number, history: number[] = []) =>
  cap([CEILING, TARGET, current], history);

describe('pr_body_cap', () => {
  it('allows growth up to the ceiling when nothing has crossed it', () => {
    assert.deepEqual(rule(32_000, [5000, 31_999]), {
      status: 0,
      stdout: '32000 32000\n',
      stderr: '',
    });
  });

  it('fails a body crossing the ceiling now, against the target', () => {
    const { status, stdout } = rule(32_001, [20_000]);
    assert.equal(status, 1);
    assert.equal(stdout, '24000 32001\n');
  });

  it('holds a body that crossed before to the target', () => {
    const { status, stdout } = rule(30_000, [10_000, 40_000, 31_000]);
    assert.equal(status, 1);
    assert.equal(stdout, '24000 40000\n');
  });

  it('passes a body that crossed before once it is back at the target', () => {
    const { status, stdout } = rule(24_000, [40_000, 24_001]);
    assert.equal(status, 0);
    assert.equal(stdout, '24000 40000\n');
  });

  it('reads the history in any order and skips blank lines', () => {
    const { status, stdout } = cap([CEILING, TARGET, 100], '\n33000\n\n5\n');
    assert.equal(status, 0);
    assert.equal(stdout, '24000 33000\n');
  });

  it('passes a body with no history at all', () => {
    assert.equal(rule(0).status, 0);
  });

  for (const [what, args, history] of [
    ['a non-numeric length', [CEILING, TARGET, 100], 'many'],
    ['two lengths on one line', [CEILING, TARGET, 100], '1 2'],
    ['a target above the ceiling', [TARGET, CEILING, 100], ''],
    ['a missing argument', [CEILING, TARGET], ''],
  ] as const) {
    it(`returns 2 on ${what}`, () => {
      assert.equal(cap([...args], history).status, 2);
    });
  }
});

/** What the stub `gh` answers; an unset field makes that call fail. */
type Stub = { found?: string; chars?: number; history?: number[] };

// Each answer is a file beside the stub, named for the query it answers.
const STUB = `#!/bin/sh
case "$1 $2" in
  "repo view") echo "owner/repo"; exit 0 ;;
esac
case "$*" in
  *--paginate*) answer=history ;;
  *pullRequests*) answer=found ;;
  *) answer=chars ;;
esac
file="$(dirname "$0")/$answer"
[ -f "$file" ] || { echo "stub gh: no $answer" >&2; exit 1; }
cat "$file"
`;

function check(args: string[], stub: Stub | 'no-gh'): Run {
  const bin = mkdtempSync(path.join(tmpdir(), 'pr-body-size-'));
  let PATH = bin;
  if (stub === 'no-gh') {
    symlinkSync(which('dirname'), path.join(bin, 'dirname'));
  } else {
    writeFileSync(path.join(bin, 'gh'), STUB);
    chmodSync(path.join(bin, 'gh'), 0o755);
    PATH = `${bin}:${process.env['PATH'] ?? ''}`;
    const { found, chars, history } = stub;
    const answers = {
      found,
      chars: chars?.toString(),
      history: history?.join('\n'),
    };
    for (const [name, text] of Object.entries(answers))
      if (text !== undefined) writeFileSync(path.join(bin, name), text);
  }
  return settle(
    spawnSync(BASH, [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { ...process.env, PATH },
    }),
  );
}

describe('check-pr-body-size.sh', () => {
  it('passes a body within the ceiling', () => {
    const run = check(['7'], { chars: 31_000, history: [30_000] });
    assert.equal(run.status, 0);
    assert.equal(
      run.stdout,
      "check-pr-body-size: ok — PR #7's body is 31000/32000 chars\n",
    );
  });

  it('names what to cut first when a crossed body is over the target', () => {
    const run = check(['7'], { chars: 25_000, history: [33_000, 25_000] });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /PR #7's body is 25000 chars/);
    assert.match(run.stderr, /24000 or under: cut 1000 more/);
    assert.match(run.stderr, /Cut checked QA steps first, then the detail/);
  });

  it('says a crossed body back at the target has been over', () => {
    const run = check(['7'], { chars: 24_000, history: [33_000] });
    assert.equal(run.status, 0);
    assert.match(run.stdout, /has been past 32000, at most 33000/);
  });

  it('passes a branch with no open PR', () => {
    const run = check([], { found: '' });
    assert.equal(run.status, 0);
    assert.match(run.stdout, /nothing to measure|detached HEAD/);
  });

  it('measures the branch PR the lookup finds', () => {
    const run = check([], { found: '12 100', history: [] });
    assert.equal(run.status, 0);
    // A detached HEAD has no branch to look up, and skips instead.
    assert.match(run.stdout, /PR #12's body is 100\/32000|detached HEAD/);
  });

  it('fails when gh cannot read the edit history', () => {
    const run = check(['7'], { chars: 100 });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /could not read the edit history of PR #7/);
  });

  it('fails when gh is not on PATH', () => {
    const run = check(['7'], 'no-gh');
    assert.equal(run.status, 1);
    assert.match(run.stderr, /gh is not on PATH/);
  });

  it('rejects an argument that is not a PR number', () => {
    assert.equal(check(['seven'], {}).status, 1);
  });
});
