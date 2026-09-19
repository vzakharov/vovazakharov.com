#!/usr/bin/env node

// Prices one session's transcript and writes its row under `costs/sessions/`.
// The row is rewritten from the whole file each run rather than appended to,
// which is what lets a run pick up what the previous one was too early to see —
// the transcript lags the live conversation.
//
//   node scripts/session-cost.ts --transcript <path> [--session-id <id>] [--row-path]

/* eslint-disable no-console -- stdout is this script's interface: the row's
   path for the hook that calls it, a one-line summary for a person running it
   by hand. */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { flag, given } from './lib/argv.ts';
import {
  parsePrices,
  type SessionCost,
  summariseTranscript,
} from './lib/session-cost.ts';
import { writeAtomic } from './lib/write-atomic.ts';

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
writeAtomic(root, out, `${JSON.stringify(cost, null, 2)}\n`);

console.log(
  given('row-path')
    ? out
    : `session-cost: ${cost.total.responses} responses, $${cost.total.costUsd.toFixed(4)} → ${out}`,
);
