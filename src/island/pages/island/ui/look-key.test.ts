import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LOOKS } from '@/island/shared/play';
import { EYE_KEYS } from '@/island/features/eye/index.test-only';

import { DIAGNOSTICS_KEY } from './diagnostics';
import { lookAsked, STEP_KEY } from './look-key';
import { PAUSE, SCRUBS } from './time-keys';

describe('look keys', () => {
  it('step with B from each look to the next', () => {
    assert.deepEqual(
      LOOKS.map((look) => lookAsked(STEP_KEY, look)),
      ['swift', 'fine', 'plain'],
    );
  });

  it('pick each look by its place, on the top row and the keypad, from any look', () => {
    for (const current of LOOKS) {
      for (const [index, look] of LOOKS.entries()) {
        assert.equal(lookAsked(`Digit${String(index + 1)}`, current), look);
        assert.equal(lookAsked(`Numpad${String(index + 1)}`, current), look);
      }
    }
  });

  it('ask for nothing past the last look, at 0, or on any other key', () => {
    for (const code of [
      `Digit${String(LOOKS.length + 1)}`,
      'Digit0',
      'KeyW',
      'Space',
    ]) {
      assert.equal(lookAsked(code, 'plain'), undefined, code);
    }
  });

  it('take no key the eye, the clock or the diagnostics hold', () => {
    const taken = [...EYE_KEYS, ...Object.keys(SCRUBS), PAUSE, DIAGNOSTICS_KEY];
    for (const code of taken) {
      assert.equal(lookAsked(code, 'plain'), undefined, code);
    }
  });
});
