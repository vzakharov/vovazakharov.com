import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUSK_MS, FULL_DAY, FULL_DUSK, turned } from '../../model/dusk';
import { LIT_DELAY_MOST, windowsLit } from './windows-lit';

const START = 5000;
/** Phases round the turn, as `phaseOf` reads them off the houses' seeds. */
const PHASES = Array.from(
  { length: 12 },
  (_, index) => (index / 12) * Math.PI * 2,
);

describe('windowsLit', () => {
  it('leaves every house dark by day and lit at full dusk, a dark page included', () => {
    for (const phase of PHASES) {
      assert.equal(windowsLit(FULL_DAY, START, phase), 0);
      assert.equal(windowsLit(FULL_DUSK, 0, phase), 1);
    }
  });

  it('lights the village house by house as dusk falls, every one lit once the last delay is past', () => {
    const dusk = turned(FULL_DAY, START);
    const mid = PHASES.map((phase) =>
      windowsLit(dusk, START + DUSK_MS * 0.6, phase),
    );
    assert.ok(Math.max(...mid) - Math.min(...mid) > 0.5, mid.join(','));
    for (const phase of PHASES) {
      assert.equal(windowsLit(dusk, START, phase), 0);
      assert.equal(
        windowsLit(dusk, START + DUSK_MS + LIT_DELAY_MOST, phase),
        1,
      );
    }
  });

  it('puts them out again as morning comes, each its delay behind', () => {
    const morning = turned(FULL_DUSK, START);
    for (const phase of PHASES) {
      assert.equal(windowsLit(morning, START, phase), 1);
      assert.equal(
        windowsLit(morning, START + DUSK_MS + LIT_DELAY_MOST, phase),
        0,
      );
    }
  });
});
