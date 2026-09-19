#!/usr/bin/env node

// Totals the rows under `costs/sessions/` — what the work in this repository
// would have cost at Claude API rates, by month.
//
//   node scripts/costs-report.ts [--month YYYY-MM] [--write]
//
// `--write` also regenerates `costs/totals.json`, which is what the `Stop` hook
// calls: the file is the rows summed, so it is rewritten whole rather than
// added to. Rows reach `main` by merge, so a month read here is a month of
// *merged* work: `.claude/rules/costs.md` carries what that leaves out.

/* eslint-disable no-console -- stdout is this script's interface: the report is
   the whole output. */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { flag, given } from './lib/argv.ts';
import { totalsOf } from './lib/cost-totals.ts';
import {
  parsePrices,
  parseSessionCost,
  type SessionCost,
} from './lib/session-cost.ts';
import { writeAtomic } from './lib/write-atomic.ts';

const root = process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
const sessionsDir = path.join(root, 'costs/sessions');
const wanted = flag('month');

const months = (() => {
  try {
    return readdirSync(sessionsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted();
  } catch {
    return [];
  }
})();

const rowsIn = (month: string): SessionCost[] => {
  const dir = path.join(sessionsDir, month);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => parseSessionCost(readFileSync(path.join(dir, name), 'utf8')));
};

const byMonth = new Map(months.map((month) => [month, rowsIn(month)]));
const everyRow = [...byMonth.values()].flat();

// The totals file covers every row, so it is written before the `--month`
// filter narrows what gets printed.
if (given('write'))
  writeAtomic(
    root,
    path.join(root, 'costs/totals.json'),
    `${JSON.stringify(totalsOf(everyRow), null, 2)}\n`,
  );

const shown = months.filter((month) => wanted === undefined || month === wanted);

if (shown.length === 0) {
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

for (const month of shown) {
  const rows = byMonth.get(month) ?? [];

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

if (shown.length > 1)
  console.log(
    `${'total'.padEnd(7)} ${pad(usd(grand), 10)}  ${pad(count(grandSessions, 'session'), 13)}`,
  );

// Nothing validates the hand-kept rate table against Anthropic's published
// prices, so the report states its age rather than letting a reader assume.
const prices = parsePrices(
  readFileSync(path.join(root, 'costs/prices.json'), 'utf8'),
);
const days = Math.floor(
  (Date.now() - Date.parse(prices.as_of)) / 86_400_000,
);
console.log(
  `\nrates as of ${prices.as_of} (${count(days, 'day')} ago), hand-kept in costs/prices.json`,
);

const stale = everyRow.filter(
  (row) => row.pricesAsOf !== prices.as_of,
).length;
if (stale > 0)
  console.log(
    `${count(stale, 'row')} priced under an older table; their transcripts are gone, so the figures stand as billed at the time`,
  );
