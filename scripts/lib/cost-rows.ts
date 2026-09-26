// A row's file on disk: written by the pricing run, and reshaped by the report.

import { readFileSync } from 'node:fs';
import { z } from 'zod';

import { parseSessionCost, type SessionCost } from './session-cost.ts';
import { writeAtomic } from './write-atomic.ts';

const RawRowSchema = z.record(z.string(), z.unknown());

export const rowText = (row: SessionCost): string =>
  `${JSON.stringify(row, null, 2)}\n`;

/**
 * A row carrying keys the current shape does not write is rewritten in that
 * shape as it is read, and the keys it lost are returned. That is how a retired
 * field leaves the ledger — in every repository it runs in, on the first report
 * there — with no migration for anyone to remember to run.
 */
export const readRow = (
  root: string,
  file: string,
): { row: SessionCost; dropped: string[] } => {
  const text = readFileSync(file, 'utf8');
  const row = parseSessionCost(text);
  const kept = new Set(Object.keys(row));
  const dropped = Object.keys(RawRowSchema.parse(JSON.parse(text)))
    .filter((key) => !kept.has(key))
    .toSorted();
  if (dropped.length > 0) writeAtomic(root, file, rowText(row));
  return { row, dropped };
};
