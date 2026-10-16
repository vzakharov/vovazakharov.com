import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Dusk,
  DUSK_MS,
  FULL_DAY,
  FULL_DUSK,
  turned,
} from '../../model/dusk';
import { LIT_DELAY_MOST, windowsLit } from './windows-lit';

const START = 5000;
/** Phases round the turn, as `phaseOf` reads them off the houses' seeds. */
const PHASES = Array.from(
  { length: 12 },
  (_, index) => (index / 12) * Math.PI * 2,
);

/** How lit a house shows by `dusk`, with the turn `before` it as the view keeps it. */
const lit = (dusk: Dusk, now: number, phase: number, before = dusk) =>
  windowsLit({ dusk, before }, now, phase);

describe('windowsLit', () => {
  it('leaves every house dark by day and lit at full dusk, a dark page included', () => {
    for (const phase of PHASES) {
      assert.equal(lit(FULL_DAY, START, phase), 0);
      assert.equal(lit(FULL_DUSK, 0, phase), 1);
    }
  });

  it('lights the village house by house as dusk falls, every one lit once the last delay is past', () => {
    const dusk = turned(FULL_DAY, START);
    const mid = PHASES.map((phase) => lit(dusk, START + DUSK_MS * 0.6, phase));
    assert.ok(Math.max(...mid) - Math.min(...mid) > 0.5, mid.join(','));
    for (const phase of PHASES) {
      assert.equal(lit(dusk, START, phase), 0);
      assert.equal(lit(dusk, START + DUSK_MS + LIT_DELAY_MOST, phase), 1);
    }
  });

  it('puts them out again as morning comes, each its delay behind', () => {
    const morning = turned(FULL_DUSK, START);
    for (const phase of PHASES) {
      assert.equal(lit(morning, START, phase), 1);
      assert.equal(lit(morning, START + DUSK_MS + LIT_DELAY_MOST, phase), 0);
    }
  });

  it('carries every house on from where its light stood when the light is turned again, the most lagging included', () => {
    const phases = [...PHASES, (1499 / LIT_DELAY_MOST) * Math.PI * 2];
    const evening = turned(FULL_DAY, START);
    const turns: Array<[Dusk, Dusk]> = [
      [FULL_DAY, FULL_DAY],
      [FULL_DUSK, FULL_DUSK],
      [evening, FULL_DAY],
      [turned(FULL_DUSK, START), FULL_DUSK],
      [turned(evening, START + DUSK_MS / 4), evening],
    ];
    for (const [dusk, before] of turns) {
      for (let at = 0; at <= DUSK_MS + LIT_DELAY_MOST; at += 50) {
        const now = START + at;
        for (const phase of phases) {
          const was = lit(dusk, now - 1e-3, phase, before);
          const is = lit(turned(dusk, now), now, phase, dusk);
          assert.ok(
            Math.abs(is - was) < 0.05,
            `${dusk.toward} from ${dusk.from} turned at +${at}, phase ${phase}: ${was} → ${is}`,
          );
        }
      }
    }
  });
});
