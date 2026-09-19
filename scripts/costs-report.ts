#!/usr/bin/env node

// Totals the rows under `costs/sessions/` — what the work in this repository
// would have cost at Claude API rates, by month.
//
//   node scripts/costs-report.ts [--month YYYY-MM]
//
// Rows reach `main` by merge, so a month read here is a month of *merged* work:
// `.claude/rules/costs.md` carries what that leaves out.

/* eslint-disable no-console -- stdout is this script's interface: the report is
   the whole output. */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { parseSessionCost, type SessionCost } from './lib/session-cost.ts';

const root = process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
const sessionsDir = path.join(root, 'costs/sessions');
const at = process.argv.indexOf('--month');
const wanted = at === -1 ? undefined : process.argv[at + 1];

const months = (() => {
  try {
    return readdirSync(sessionsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => wanted === undefined || name === wanted)
      .toSorted();
  } catch {
    return [];
  }
})();

if (months.length === 0) {
  console.log(
    `costs: no rows under ${sessionsDir}${wanted === undefined ? '' : ` for ${wanted}`}`,
  );
  process.exit(0);
}

const usd = (amount: number): string => `$${amount.toFixed(2)}`;
const pad = (text: string, width: number): string => text.padStart(width);
const count = (n: number, noun: string): string =>
  `${n} ${noun}${n === 1 ? '' : 's'}`;

let grand = 0;
let grandSessions = 0;

for (const month of months) {
  const dir = path.join(sessionsDir, month);
  const rows: SessionCost[] = readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) =>
      parseSessionCost(readFileSync(path.join(dir, name), 'utf8')),
    );

  const spend = rows.reduce((sum, row) => sum + row.total.costUsd, 0);
  const subagents = rows.reduce((sum, row) => sum + row.subagents.costUsd, 0);
  const responses = rows.reduce((sum, row) => sum + row.total.responses, 0);
  grand += spend;
  grandSessions += rows.length;

  const delegated =
    subagents > 0 ? `  (${usd(subagents)} of it subagents)` : '';
  console.log(
    `${month}  ${pad(usd(spend), 10)}  ${pad(count(rows.length, 'session'), 13)}  ${pad(count(responses, 'response'), 15)}${delegated}`,
  );
}

if (months.length > 1)
  console.log(
    `${'total'.padEnd(7)} ${pad(usd(grand), 10)}  ${pad(count(grandSessions, 'session'), 13)}`,
  );
