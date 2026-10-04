/**
 * End-to-end tests for `scripts/golem-log-pr.sh`, the PR half of a `/golem`
 * run's operator log.
 *
 * Each case builds a throwaway git repository holding the script, the hook it
 * asks for the live log, and a PR export in the shape
 * `scripts/export-github-item.py` writes, then runs the real script there.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPTS = [
  '.claude/hooks/lib.sh',
  '.claude/hooks/golem-operator-log.sh',
  'scripts/golem-log-pr.sh',
];
const LOG = 'docs/plans/run/operator-log.md';
const LOG_HEAD = '# Operator log\n\n## Bite 1\n';
const PR_URL = 'https://github.com/o/r/pull/7';
const COMMENT_URL = `${PR_URL}#issuecomment-1`;
const LATER_COMMENT_URL = `${PR_URL}#issuecomment-3`;

const EXPORT = `# PR #7: feat: a thing

- **State:** open
- **URL:** ${PR_URL}
- **Author:** @op (human)

---

## Body

### Comment by @op (human) on 2020-01-01T00:00:00Z

A body heading that is not the exporter's.

---

## Comments

- **C01** @op (human) — 2026-01-01T10:00:00Z — "answered already" → [↓](#c01)
- **C02** @op (agent) — 2026-01-01T11:00:00Z — "the run's reply" → [↓](#c02)
- **C03** @op (human) — 2026-01-01T12:00:00Z — "new: see the shot" → [↓](#c03)

<a id="c01"></a>

### Comment by @op (human) on 2026-01-01T10:00:00Z

[${PR_URL}#issuecomment-0](${PR_URL}#issuecomment-0)

answered already

---

<a id="c02"></a>

### Comment by @op (agent) on 2026-01-01T11:00:00Z

[${COMMENT_URL}](${COMMENT_URL})

the run's reply

---

<a id="c03"></a>

### Comment by @op (human) on 2026-01-01T12:00:00Z

[${LATER_COMMENT_URL}](${LATER_COMMENT_URL})

new: see the shot

![shot](attachments/shot.png)

---

## Review threads

### Review by @op (human) — COMMENTED

_2026-01-01T12:30:00Z_

the review's own words

_1 resolved thread omitted; re-run with \`--include-resolved\` to export it._

- **T01** \`src/a.ts\`:3 — unresolved — last: @op (agent) 2026-01-01T09:30:00Z — "fixed" → [↓](#t01)
- **T02** \`src/b.ts\`:9 — unresolved — last: @op (human) 2026-01-01T13:00:00Z — "and this" → [↓](#t02)

<a id="t01"></a>

### \`src/a.ts\`:3 — unresolved

\`\`\`diff
@@ -1,3 +1,3 @@
+**@op (human)** — 2026-01-01T00:00:00Z
\`\`\`

**@op (human)** — 2026-01-01T09:00:00Z

rename this

**@op (agent)** — 2026-01-01T09:30:00Z

fixed

---

<a id="t02"></a>

### \`src/b.ts\`:9 — unresolved

**@op (human)** — 2026-01-01T12:59:00Z

why this?

---

and this

**@op (human)** — 2026-01-01T13:00:00Z

and that

---

## Timeline (status, references, and other events)

- **2026-01-01T12:30:00Z** @op reviewed (COMMENTED).
`;

function repo(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'golem-log-pr-'));
  for (const rel of SCRIPTS) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    copyFileSync(path.join(ROOT, rel), path.join(dir, rel));
  }
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), text);
  }
  assert.equal(spawnSync('git', ['init', '-q'], { cwd: dir }).status, 0);
  return dir;
}

function run(dir: string, ...args: string[]) {
  const { error, status, stdout, stderr } = spawnSync(
    path.join(dir, 'scripts/golem-log-pr.sh'),
    args,
    { cwd: dir, encoding: 'utf8', env: { PATH: process.env.PATH } },
  );
  assert.equal(error, undefined);
  return { status: status ?? -1, stdout, stderr };
}

const log = (dir: string) => readFileSync(path.join(dir, LOG), 'utf8');

const entries = (text: string) =>
  [...text.matchAll(/<!-- golem-log-pr: (.+?) -->/g)].map((m) => m[1]);

describe('golem-log-pr', () => {
  it('exits 0 having written nothing on a tree with no live log', () => {
    const dir = repo({ 'docs/pr/7/pr.md': EXPORT });
    assert.deepEqual(run(dir, '7'), { status: 0, stdout: '', stderr: '' });
  });

  it('fails, naming the fix, when the export is missing', () => {
    const dir = repo({ [LOG]: LOG_HEAD });
    const result = run(dir, '7');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /scripts\/export-github-item\.py 7/);
  });

  it('logs each thread’s operator tail, in time order, with its link', () => {
    const dir = repo({ [LOG]: LOG_HEAD, 'docs/pr/7/pr.md': EXPORT });
    assert.deepEqual(run(dir, '7'), { status: 0, stdout: '', stderr: '' });
    const text = log(dir);

    assert.equal(entries(text).length, 4);
    assert.doesNotMatch(text, /answered already|rename this|the run's reply/);
    assert.doesNotMatch(text, /A body heading/);

    const order = [
      'new: see the shot',
      "the review's own words",
      'why this?',
      'and that',
    ].map((s) => text.indexOf(`> ${s}`));
    assert.ok(order.every((at) => at > 0));
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b),
    );

    assert.ok(
      text.includes(
        `**Operator on the PR** · 2026-01-01T12:00:00Z · [comment](${LATER_COMMENT_URL})`,
      ),
    );
    assert.ok(
      text.includes(
        `**Operator on the PR** · 2026-01-01T12:59:00Z · [\`src/b.ts\`:9](${PR_URL})`,
      ),
    );
    assert.ok(text.includes('> ![shot](../../pr/7/attachments/shot.png)'));
    assert.ok(text.includes('> why this?\n>\n> ---\n>\n> and this\n'));
  });

  it('logs nothing twice across re-runs, and only what is new after them', () => {
    const dir = repo({ [LOG]: LOG_HEAD, 'docs/pr/7/pr.md': EXPORT });
    run(dir, '7');
    const once = log(dir);
    run(dir, '7');
    assert.equal(log(dir), once);

    const later = EXPORT.replace(
      '## Timeline',
      `<a id="t03"></a>

### \`src/c.ts\`:1 — unresolved

**@op (human)** — 2026-01-02T08:00:00Z

one more

---

## Timeline`,
    );
    writeFileSync(path.join(dir, 'docs/pr/7/pr.md'), later);
    run(dir, '7');
    assert.equal(entries(log(dir)).length, 5);
    assert.ok(log(dir).startsWith(once));
    assert.match(log(dir), /> one more\n$/);
  });

  it('reads a loop review as the run’s own, and links an inline post by its own URL', () => {
    const inlineUrl = `${PR_URL}#discussion_r9`;
    const withLoopReview = EXPORT.replace(
      '### Review by @op (human)',
      `### Review by @op (agent review) — COMMENTED

_2026-01-01T09:15:00Z_

the loop's summary

### Review by @op (human)`,
    ).replace(
      '## Timeline',
      `<a id="t03"></a>

### \`src/c.ts\`:1 — unresolved

**@op (human)** — 2026-01-02T07:00:00Z

[${PR_URL}#discussion_r7](${PR_URL}#discussion_r7)

already seen

**@op (agent review)** — 2026-01-02T08:00:00Z

[${PR_URL}#discussion_r8](${PR_URL}#discussion_r8)

the loop's finding

**@op (human)** — 2026-01-02T09:00:00Z

[${inlineUrl}](${inlineUrl})

not this one

---

## Timeline`,
    );
    const dir = repo({ [LOG]: LOG_HEAD, 'docs/pr/7/pr.md': withLoopReview });
    assert.deepEqual(run(dir, '7'), { status: 0, stdout: '', stderr: '' });
    const text = log(dir);

    assert.equal(entries(text).length, 5);
    assert.doesNotMatch(text, /the loop's (summary|finding)|already seen/);
    assert.ok(
      text.includes(
        `**Operator on the PR** · 2026-01-02T09:00:00Z · [\`src/c.ts\`:1](${inlineUrl})`,
      ),
    );
    assert.match(text, /> not this one\n$/);
  });

  it('writes the pending chat replies first', () => {
    const dir = repo({
      [LOG]: LOG_HEAD,
      'docs/pr/7/pr.md': EXPORT,
      'tmp/golem-operator-log/s1.reply': '\n**Run** · t\n\n> chat reply\n',
    });
    run(dir, '7');
    const text = log(dir);
    assert.ok(text.indexOf('> chat reply') > 0);
    assert.ok(text.indexOf('> chat reply') < text.indexOf('> new: see'));
  });
});
