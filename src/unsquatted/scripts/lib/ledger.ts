/**
 * The naming runbook's memory of every name it checked and did not pick, one
 * JSON object per line in `../ledger.jsonl`. A picked name is in the deck's
 * `picks.yaml` instead, so the two together are everything a run skips.
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { errorClass, withCause } from '@/kernel/shared/lib/error-class';

const LEDGER_PATH = path.join(import.meta.dirname, '..', 'ledger.jsonl');

const LedgerError = errorClass('LedgerError');

const CandidateError = errorClass('CandidateError');

/** `taken` is the registry's word; `taste` is the run's, on a free name. */
const VERDICTS = ['taken', 'taste'] as const;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const LABEL = /^[\da-z]+(?:-[\da-z]+)*$/;

/** A name a run is about to check, with the direction it was found in. */
const candidateSchema = z.object({
  domain: z.string().min(1),
  axis: z.string().min(1),
});

const entrySchema = candidateSchema.extend({
  verdict: z.enum(VERDICTS),
  checked: z.string().regex(DAY),
  /** The year a taken name was registered, where its registry says. */
  since: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
});

export type Candidate = z.infer<typeof candidateSchema>;

export type LedgerEntry = z.infer<typeof entrySchema>;

export function parseLedger(text: string): LedgerEntry[] {
  return text
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => line.trim() !== '')
    .map(({ line, number }) => {
      try {
        return entrySchema.parse(JSON.parse(line));
      } catch (error) {
        throw new LedgerError(
          `ledger.jsonl:${number} does not parse`,
          withCause(error),
        );
      }
    });
}

export const formatEntry = (entry: LedgerEntry) =>
  `${JSON.stringify(entrySchema.parse(entry))}\n`;

export const readLedger = () =>
  parseLedger(fs.readFileSync(LEDGER_PATH, 'utf8'));

export function appendToLedger(entry: LedgerEntry) {
  fs.appendFileSync(LEDGER_PATH, formatEntry(entry));
}

/**
 * Candidates as `axis<TAB>name` lines, a name with or without its `.com`;
 * blank lines and `#` comments skipped. A malformed line throws rather than
 * being dropped, so a typo never passes for a name already checked.
 */
export function parseCandidates(text: string): Candidate[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => {
      const [axis, name, ...rest] = line.split('\t').map((cell) => cell.trim());
      const label = name?.toLowerCase().replace(/\.com$/, '');

      if (
        axis === undefined ||
        axis === '' ||
        label === undefined ||
        !LABEL.test(label) ||
        rest.length > 0
      ) {
        throw new CandidateError(`not an "axis<TAB>name" line: ${line}`);
      }

      return { axis, domain: `${label}.com` };
    });
}

/** The candidates no run has checked yet, each once, in the order given. */
export function unchecked(
  candidates: readonly Candidate[],
  known: Iterable<string>,
): Candidate[] {
  const seen = new Set(known);

  return candidates.filter(({ domain }) => {
    if (seen.has(domain)) return false;
    seen.add(domain);

    return true;
  });
}

export const today = () => new Date().toISOString().slice(0, 10);
