import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PAPERS, physics, REVERSE_LAYERS_ERROR } from '@/origami/shared/fold';

import { basilisk } from './basilisk.ts';

const kami = PAPERS['kami-15'];
/** The neck's inside reverse fold, 0-based, after the diamond's eight folds
 * and the fold in half. */
const NECK = 9;
/** The needle's last narrowing, 0-based. */
const THIRD_NARROWING = 9;

const errors = (steps: ReturnType<typeof basilisk>['steps']) =>
  physics(steps, kami).flatMap((r) =>
    r.findings.filter((f) => f.level === 'error'),
  );

describe('basilisk on kami', () => {
  it('folds with no error', () => {
    assert.deepEqual(errors(basilisk().steps), []);
  });

  it('cannot reverse-fold the neck where the diamond is thickest', () => {
    const neck = physics(basilisk({ neck: 0.85 }).steps, kami).at(NECK);
    assert.ok(neck);
    assert.equal(neck.record.direction, 'inside');
    assert.ok(neck.bent > REVERSE_LAYERS_ERROR);
    assert.ok(
      neck.findings.some(
        (f) => f.level === 'error' && f.message.includes(`${neck.bent} layers`),
      ),
    );
  });

  it('warns that the needle tail ends in an 11.25° tip', () => {
    const narrowed = physics(basilisk({ third: true }).steps, kami).at(
      THIRD_NARROWING,
    );
    assert.ok(narrowed);
    assert.ok(Math.abs((narrowed.tip?.degrees ?? 0) - 11.25) < 1e-6);
    assert.ok(narrowed.findings.some((f) => f.level === 'warn'));
  });
});
