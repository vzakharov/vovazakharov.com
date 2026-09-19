#!/usr/bin/env node

// Prices one session's transcript and writes its row under `costs/sessions/`.
// Run from the `Stop` hook on every turn, so the row is rewritten from the
// whole transcript rather than appended to: the transcript is written
// asynchronously and lags the live conversation, so each run also picks up
// whatever the previous run was too early to see.
//
//   node scripts/session-cost.ts --transcript <path> [--session-id <id>] [--row-path]

/* eslint-disable no-console -- stdout is this script's interface: the row's
   path for the hook that calls it, a one-line summary for a person running it
   by hand. */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  parsePrices,
  type SessionCost,
  summariseTranscript,
} from './lib/session-cost.ts';

const flag = (name: string): string | undefined => {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
};

const given = (name: string): boolean => process.argv.includes(`--${name}`);

const root = process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();

const transcript = flag('transcript');
if (transcript === undefined) {
  console.error('session-cost: --transcript <path> is required');
  process.exit(2);
}

// The month a session is filed under is the month it started, so a session
// running across midnight on the last of the month stays in one file.
const monthOf = (cost: SessionCost): string =>
  (cost.firstResponseAt ?? new Date().toISOString()).slice(0, 7);

const prices = parsePrices(
  readFileSync(path.join(root, 'costs/prices.json'), 'utf8'),
);
const cost = summariseTranscript(
  readFileSync(transcript, 'utf8'),
  prices,
  flag('session-id') ?? path.basename(transcript, '.jsonl'),
);

const out = path.join(
  root,
  'costs/sessions',
  monthOf(cost),
  `${cost.sessionId}.json`,
);
mkdirSync(path.dirname(out), { recursive: true });
// Written through a rename so the file is never half-there: the harness's own
// `Stop` hook reads the working tree, and a partial write is a dirty tree.
const staged = `${out}.staged`;
writeFileSync(staged, `${JSON.stringify(cost, null, 2)}\n`);
renameSync(staged, out);

// `--row-path` prints the file and nothing else, so a caller can act on the row
// without parsing prose; the default line is for a person running this by hand.
console.log(
  given('row-path')
    ? out
    : `session-cost: ${cost.total.responses} responses, $${cost.total.costUsd.toFixed(4)} → ${out}`,
);
