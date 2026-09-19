/**
 * The totals are a pure function of the rows, so each case here states a
 * property the summary file depends on — above all that regenerating it is what
 * settles a conflict, which only holds while the output is a function of the
 * input alone.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isoWeek, totalsOf } from './cost-totals.ts';
import { parseSessionCost, type SessionCost } from './session-cost.ts';

// Only the two fields the totals read carry a value; the token counts are
// present because a row is parsed rather than trusted.
const tally = (responses: number, costUsd: number) => ({
  inputTokens: 0,
  cacheWrite5mTokens: 0,
  cacheWrite1hTokens: 0,
  cacheReadTokens: 0,
  outputTokens: 0,
  thinkingTokens: 0,
  responses,
  costUsd,
});

const row = (startedAt: string | null, costUsd: number): SessionCost =>
  parseSessionCost(
    JSON.stringify({
      sessionId: `s-${startedAt ?? 'none'}-${costUsd}`,
      branch: 'a-branch',
      cwd: '/repo',
      firstResponseAt: startedAt,
      lastResponseAt: startedAt,
      pricesAsOf: '2026-01-01',
      total: tally(1, costUsd),
      ownTurns: tally(1, costUsd),
      subagents: tally(0, 0),
      byRate: {},
      warnings: [],
    }),
  );

describe('cost-totals: the breakdowns', () => {
  it('buckets a session by where it started, whole', () => {
    // Started on the 30th, ran past midnight: one day, not two halves.
    const totals = totalsOf([row('2026-09-30T23:50:00.000Z', 3)]);
    assert.deepEqual(totals.byDay, {
      '2026-09-30': { sessions: 1, responses: 1, costUsd: 3 },
    });
    assert.deepEqual(Object.keys(totals.byMonth), ['2026-09']);
  });

  it('sums sessions sharing a bucket and keeps the grand total over all of them', () => {
    const totals = totalsOf([
      row('2026-09-01T00:00:00.000Z', 1.5),
      row('2026-09-01T12:00:00.000Z', 2.25),
      row('2026-10-01T00:00:00.000Z', 4),
    ]);
    assert.deepEqual(totals.byDay['2026-09-01'], {
      sessions: 2,
      responses: 2,
      costUsd: 3.75,
    });
    assert.equal(totals.sessions, 3);
    assert.equal(totals.costUsd, 7.75);
  });

  it('counts a row with no priced response in the grand total and no bucket', () => {
    const totals = totalsOf([row(null, 0)]);
    assert.equal(totals.sessions, 1);
    assert.deepEqual(totals.byMonth, {});
  });

  it('is a function of the rows alone, so regenerating settles a conflict', () => {
    const rows = [row('2026-09-01T00:00:00.000Z', 1)];
    assert.deepEqual(totalsOf(rows), totalsOf(rows));
  });

  it('rounds to a figure a price could produce', () => {
    const totals = totalsOf([row('2026-09-01T00:00:00.000Z', 0.1 + 0.2)]);
    assert.equal(totals.costUsd, 0.3);
  });
});

describe('cost-totals: ISO weeks', () => {
  it('files a day under the week owning its Thursday', () => {
    // 2026-01-01 is a Thursday, so its week is 2026-W01 …
    assert.equal(isoWeek(new Date('2026-01-01T00:00:00.000Z')), '2026-W01');
    // … and the Monday before it belongs to that same week, not to 2025.
    assert.equal(isoWeek(new Date('2025-12-29T00:00:00.000Z')), '2026-W01');
  });
});
