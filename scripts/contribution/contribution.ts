/**
 * A branch's lines over time, everyone's alike, read off its commits: the
 * work that the human share — the operator's words, in
 * `.claude/costs/contribution.py` — is read against.
 *
 *   contribution lines [<range>]   cumulative lines per extension, as CSV
 *
 * `<range>` defaults to the branch's own commits, `<merge-base>..HEAD`
 * against `origin/main`.
 */
import { execFileSync } from 'node:child_process';

import { cumulativeFlow, toCsv } from './lines.ts';

/** Machine-written files every session adds to, which would swamp the
 * lines a person or an agent actually wrote. */
const NOT_WRITTEN = [':(exclude).claude/costs/sessions'];

const git = (...args: string[]): string =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });

function defaultRange(): string {
  const base = git('merge-base', 'origin/main', 'HEAD').trim();
  return `${base}..HEAD`;
}

function lines(range: string): string {
  const log = git(
    'log',
    '--reverse',
    '--numstat',
    '--format=@%H %cI',
    range,
    '--',
    '.',
    ...NOT_WRITTEN,
  );
  return toCsv(cumulativeFlow(log));
}

const [command, range] = process.argv.slice(2);
if (command === 'lines') process.stdout.write(lines(range ?? defaultRange()));
else {
  process.stderr.write('usage: contribution lines [<range>]\n');
  process.exitCode = 2;
}
