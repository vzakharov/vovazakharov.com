#!/usr/bin/env node

// Prices one session's transcript and writes its row under
// `.claude/costs/sessions/`. The row is rewritten from the whole file each run
// rather than appended to, which is what lets a run pick up anything the
// previous one was too early to see. `--at-stop` is the Stop hook's: the turn is
// over, so the transcript should end on its `end_turn`. `--out` is the hook's
// too: it writes the row there instead of into place, since committing it is the
// hook's job.
//
//   node scripts/session-cost.ts --transcript <path> [--session-id <id>] [--row-path] [--at-stop] [--out <path>]

/* eslint-disable no-console -- stdout is this script's interface: the row's
   path for the hook that calls it, a one-line summary for a person running it
   by hand. */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { flag, given } from './lib/argv.ts';
import { rowText } from './lib/cost-rows.ts';
import {
  isUnwrittenTail,
  parsePrices,
  parseSessionCost,
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

// A subagent's responses are billed to this session and written to their own
// file under `<transcript>/subagents/`, so the directory is read rather than
// assumed empty. A session that spawned none has no directory at all.
const subagentsOf = (main: string): string[] => {
  const dir = path.join(
    path.dirname(main),
    path.basename(main, '.jsonl'),
    'subagents',
  );
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith('.jsonl'))
      .map((name) => readFileSync(path.join(dir, name), 'utf8'));
  } catch {
    return [];
  }
};

// An unwritten-tail warning is what no run can recompute from the transcript,
// so a rewrite reads it back from the last one. An unreadable row is treated as
// no row: the point is to keep the warning, never to fail a write over one.
const previous = (row: string): SessionCost | undefined => {
  try {
    return parseSessionCost(readFileSync(row, 'utf8'));
  } catch {
    return undefined;
  }
};

const prices = parsePrices(
  readFileSync(path.join(root, '.claude/costs/prices.json'), 'utf8'),
);
const cost = summariseTranscript(
  {
    main: readFileSync(transcript, 'utf8'),
    subagents: subagentsOf(transcript),
  },
  prices,
  flag('session-id') ?? path.basename(transcript, '.jsonl'),
  given('at-stop'),
);

const out = path.join(
  root,
  '.claude/costs/sessions',
  monthOf(cost),
  `${cost.sessionId}.json`,
);
const before = previous(out);
const carried = (before?.warnings ?? []).filter(
  (warning) => isUnwrittenTail(warning) && !cost.warnings.includes(warning),
);
const row: SessionCost = {
  ...cost,
  warnings: [...carried, ...cost.warnings],
};
const staged = flag('out');
if (staged === undefined) writeAtomic(root, out, rowText(row));
else writeFileSync(staged, rowText(row));

console.log(
  given('row-path')
    ? out
    : `session-cost: ${row.total.responses} responses, $${row.total.costUsd.toFixed(4)} → ${out}`,
);
