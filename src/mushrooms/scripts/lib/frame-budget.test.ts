import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { budgetReport } from './frame-budget.ts';

describe('budgetReport', () => {
  it('reports a median under the bound as within it, however slow the worst frames', () => {
    const line = budgetReport([5, 6, 7, 80, 90], 10);
    assert.match(line, /7\.0 ms median over 5 frames/);
    assert.match(line, /within the 10 ms budget/);
  });

  it('reports a median past the bound as over it, and as not failing', () => {
    const line = budgetReport([12, 30, 31, 32, 40], 16);
    assert.match(line, /31\.0 ms median/);
    assert.match(line, /over the 16 ms budget — reported, not failing/);
  });

  it('says so when no frame was timed, rather than printing a median', () => {
    assert.match(budgetReport([], 16), /no rendered frame was timed/);
  });
});
