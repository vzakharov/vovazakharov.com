// Sums the session rows into `costs/totals.json` — the same spend by month, by
// ISO week and by day. The file is wholly derived from the rows, which is what
// makes a conflict on it a regeneration rather than a merge.

import { z } from 'zod';

import { BilledSchema, type SessionCost } from './session-cost.ts';

const BucketSchema = BilledSchema.extend({ sessions: z.number() });

const TotalsSchema = BucketSchema.extend({
  byMonth: z.record(z.string(), BucketSchema),
  byWeek: z.record(z.string(), BucketSchema),
  byDay: z.record(z.string(), BucketSchema),
});

export type Bucket = z.infer<typeof BucketSchema>;
export type Totals = z.infer<typeof TotalsSchema>;

export const parseTotals = (json: string): Totals =>
  TotalsSchema.parse(JSON.parse(json));

/**
 * The ISO-8601 week a UTC day falls in, `<year>-W<nn>`. The year is the one
 * owning that week's Thursday, so the last days of December can read as week 01
 * of the next year — which is the point of the scheme rather than a rounding
 * error.
 */
export const isoWeek = (day: Date): string => {
  const thursday = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  const week = Math.ceil(
    ((thursday.getTime() - yearStart) / 86_400_000 + 1) / 7,
  );
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

const addInto = (bucket: Bucket, row: SessionCost): void => {
  bucket.sessions += 1;
  bucket.responses += row.total.responses;
  bucket.costUsd += row.total.costUsd;
};

const into = (
  buckets: Record<string, Bucket>,
  key: string,
  row: SessionCost,
): void => {
  addInto((buckets[key] ??= { sessions: 0, responses: 0, costUsd: 0 }), row);
};

// Rounded where it is written rather than where it is read: a sum of floats
// carries digits no price has, and the file is read by people.
const cents = (usd: number): number => Math.round(usd * 1e4) / 1e4;

const rounded = (bucket: Bucket): Bucket => ({
  ...bucket,
  costUsd: cents(bucket.costUsd),
});

const roundedAll = (buckets: Record<string, Bucket>): Record<string, Bucket> =>
  Object.fromEntries(
    Object.entries(buckets)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, bucket]) => [key, rounded(bucket)]),
  );

/**
 * A session is filed under where it **started**, the same rule that picks its
 * row's month — so one that runs past midnight stays whole rather than being
 * split across two days by an arithmetic nobody can check by hand. A row with
 * no priced response has no day to file under and lands in the grand total
 * alone.
 */
export const totalsOf = (rows: readonly SessionCost[]): Totals => {
  const byMonth: Record<string, Bucket> = {};
  const byWeek: Record<string, Bucket> = {};
  const byDay: Record<string, Bucket> = {};
  const grand: Bucket = { sessions: 0, responses: 0, costUsd: 0 };

  for (const row of rows) {
    addInto(grand, row);
    const startedAt = row.firstResponseAt;
    if (startedAt === null) continue;
    const day = new Date(startedAt);
    into(byMonth, startedAt.slice(0, 7), row);
    into(byWeek, isoWeek(day), row);
    into(byDay, startedAt.slice(0, 10), row);
  }

  return {
    ...rounded(grand),
    byMonth: roundedAll(byMonth),
    byWeek: roundedAll(byWeek),
    byDay: roundedAll(byDay),
  };
};
