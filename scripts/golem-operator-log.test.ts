/**
 * End-to-end tests for `.claude/hooks/golem-operator-log.sh`, the chat half of
 * a `/golem` run's operator log. It sits here rather than beside the hook
 * because `pnpm test`'s glob does not reach into `.claude/`.
 *
 * Each case copies the hook and the `lib.sh` it sources into a throwaway tree,
 * then feeds it hook payloads on stdin with `CLAUDE_PROJECT_DIR` pointing there.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const HOOKS = '.claude/hooks';
const LOG = 'docs/plans/run/operator-log.md';
const LOG_HEAD = '# Operator log\n\n## Bite 1\n';
const SESSION = 'transcript-uuid';
const SESSION_LINK = '[session](https://claude.ai/code/session_01abc)';

type Run = { status: number; stdout: string; stderr: string };

function tree(files: Record<string, string> = { [LOG]: LOG_HEAD }): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'golem-operator-log-'));
  mkdirSync(path.join(dir, HOOKS), { recursive: true });
  for (const name of ['lib.sh', 'golem-operator-log.sh'])
    copyFileSync(path.join(ROOT, HOOKS, name), path.join(dir, HOOKS, name));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}

function hook(dir: string, payload: Record<string, unknown>): Run {
  const { error, status, stdout, stderr } = spawnSync(
    path.join(dir, HOOKS, 'golem-operator-log.sh'),
    [],
    {
      input: JSON.stringify({ session_id: SESSION, cwd: dir, ...payload }),
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH,
        CLAUDE_PROJECT_DIR: dir,
        CLAUDE_CODE_REMOTE_SESSION_ID: 'cse_01abc',
      },
    },
  );
  assert.equal(error, undefined);
  return { status: status ?? -1, stdout, stderr };
}

const prompt = (dir: string, text: string) =>
  hook(dir, { hook_event_name: 'UserPromptSubmit', prompt: text });

const stop = (dir: string, extra: Record<string, unknown> = {}) =>
  hook(dir, { hook_event_name: 'Stop', stop_hook_active: false, ...extra });

const log = (dir: string, rel = LOG) =>
  readFileSync(path.join(dir, rel), 'utf8');

const TIME = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ/.source;

describe('golem-operator-log: no log', () => {
  it('does nothing on a tree with no operator log', () => {
    const dir = tree({});
    const result = prompt(dir, 'hello');
    assert.deepEqual(result, { status: 0, stdout: '', stderr: '' });
    assert.equal(stop(dir, { last_assistant_message: 'hi' }).status, 0);
    assert.equal(existsSync(path.join(dir, 'tmp')), false);
  });

  it('reads a completed plan’s log as no log', () => {
    const dir = tree({ [LOG]: LOG_HEAD, 'docs/plans/run.completed.md': '' });
    assert.deepEqual(prompt(dir, 'hello'), {
      status: 0,
      stdout: '',
      stderr: '',
    });
    assert.equal(log(dir), LOG_HEAD);
  });

  it('writes to neither of two live logs, and says so', () => {
    const other = 'docs/plans/other/operator-log.md';
    const dir = tree({ [LOG]: LOG_HEAD, [other]: LOG_HEAD });
    const result = prompt(dir, 'hello');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /several live operator logs/);
    assert.equal(log(dir), LOG_HEAD);
    assert.equal(log(dir, other), LOG_HEAD);
  });
});

describe('golem-operator-log: the operator’s prompt', () => {
  it('appends it verbatim and quoted, with the time and the session link', () => {
    const dir = tree();
    const result = prompt(dir, 'first line\n\n## not a heading');
    assert.deepEqual(result, { status: 0, stdout: '', stderr: '' });
    assert.match(
      log(dir),
      new RegExp(
        `^${LOG_HEAD}\\n\\*\\*Operator\\*\\* · ${TIME} · \\[session\\]\\(https://claude\\.ai/code/session_01abc\\)\\n\\n> first line\\n>\\n> ## not a heading\\n$`,
      ),
    );
  });

  for (const injected of [
    '<task-notification>\n<task-id>a1</task-id>\n</task-notification>',
    '<wake reason="external-event"><event source="github"/></wake>',
    '<webhook-payload>{}</webhook-payload>',
    '  <child-session-event kind="failed"/>',
  ])
    it(`skips an injected prompt: ${injected.trim().split(/[\s>]/)[0]}>`, () => {
      const dir = tree();
      assert.equal(prompt(dir, injected).status, 0);
      assert.equal(log(dir), LOG_HEAD);
    });

  it('skips a subagent’s prompt', () => {
    const dir = tree();
    hook(dir, {
      hook_event_name: 'UserPromptSubmit',
      prompt: 'brief',
      agent_id: 'a1',
    });
    assert.equal(log(dir), LOG_HEAD);
  });

  it('keeps a prompt that only mentions a tag', () => {
    const dir = tree();
    prompt(dir, 'why did <wake> fire?');
    assert.match(log(dir), /> why did <wake> fire\?/);
  });
});

describe('golem-operator-log: the run’s reply', () => {
  it('queues it at Stop and writes it before the next prompt', () => {
    const dir = tree();
    prompt(dir, 'question');
    assert.equal(stop(dir, { last_assistant_message: 'answer' }).status, 0);
    assert.doesNotMatch(log(dir), /answer/);

    prompt(dir, 'follow-up');
    assert.match(
      log(dir),
      new RegExp(
        `> question\\n\\n\\*\\*Run\\*\\* · ${TIME}\\n\\n> answer\\n\\n\\*\\*Operator\\*\\* · ${TIME} · ${SESSION_LINK.replace(/[[\]().]/g, '\\$&')}\\n\\n> follow-up\\n$`,
      ),
    );
  });

  it('is written by `flush` too', () => {
    const dir = tree();
    prompt(dir, 'question');
    stop(dir, { last_assistant_message: 'answer' });
    const { status } = spawnSync(
      path.join(dir, HOOKS, 'golem-operator-log.sh'),
      ['flush', dir],
      { encoding: 'utf8' },
    );
    assert.equal(status, 0);
    assert.match(log(dir), /> answer\n$/);
  });

  it('skips the reply to an injected prompt', () => {
    const dir = tree();
    prompt(dir, 'question');
    stop(dir, { last_assistant_message: 'answer' });
    prompt(dir, '<task-notification>done</task-notification>');
    stop(dir, { last_assistant_message: 'agent finished' });
    prompt(dir, 'next');
    assert.match(log(dir), /> answer\n/);
    assert.doesNotMatch(log(dir), /agent finished/);
  });

  it('skips a Stop re-fired after another hook’s block', () => {
    const dir = tree();
    prompt(dir, 'question');
    stop(dir, { last_assistant_message: 'answer' });
    stop(dir, { last_assistant_message: 'pushed', stop_hook_active: true });
    prompt(dir, 'next');
    assert.doesNotMatch(log(dir), /pushed/);
  });

  it('reads the reply off the transcript when the payload lacks it', () => {
    const dir = tree();
    const transcript = path.join(dir, 'transcript.jsonl');
    const records = [
      { type: 'user', message: { content: 'question' } },
      {
        type: 'assistant',
        message: { content: [{ type: 'text', text: 'looking' }] },
      },
      'not json',
      {
        type: 'assistant',
        message: { content: [{ type: 'tool_use', name: 'Read' }] },
      },
      {
        type: 'assistant',
        message: { content: [{ type: 'text', text: 'the answer' }] },
      },
    ];
    writeFileSync(
      transcript,
      records
        .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
        .join('\n') + '\n',
    );
    prompt(dir, 'question');
    stop(dir, { transcript_path: transcript });
    prompt(dir, 'next');
    assert.match(log(dir), /> the answer\n/);
    assert.doesNotMatch(log(dir), /> looking/);
  });
});
