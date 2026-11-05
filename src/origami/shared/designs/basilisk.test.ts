import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PAPERS, physics, REVERSE_LAYERS_ERROR } from '@/origami/shared/fold';

import { basilisk } from './basilisk.ts';

const kami = PAPERS['kami-15'];
/** The neck's inside reverse fold, 0-based, after the kite's six folds and
 * the fold in half. */
const NECK = 7;
const THIRD_NARROWING = 5;

describe('basilisk on kami', () => {
  it('cannot take the neck past three narrowings', () => {
    const neck = physics(basilisk().steps, kami).at(NECK);
    assert.ok(neck);
    assert.equal(neck.record.direction, 'inside');
    assert.ok(neck.bent > REVERSE_LAYERS_ERROR);
    assert.ok(
      neck.findings.some(
        (f) => f.level === 'error' && f.message.includes(`${neck.bent} layers`),
      ),
    );
  });

  it('warns that the third narrowing leaves an 11.25° tip', () => {
    const narrowed = physics(basilisk().steps, kami).at(THIRD_NARROWING);
    assert.ok(narrowed);
    assert.ok(Math.abs((narrowed.tip?.degrees ?? 0) - 11.25) < 1e-6);
    assert.ok(narrowed.findings.some((f) => f.level === 'warn'));
  });

  it('folds with no error from two narrowings', () => {
    const errors = physics(basilisk({ third: false }).steps, kami).flatMap(
      (r) => r.findings.filter((f) => f.level === 'error'),
    );
    assert.deepEqual(errors, []);
  });
});
