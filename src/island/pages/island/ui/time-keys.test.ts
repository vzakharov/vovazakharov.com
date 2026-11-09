import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EYE_KEYS } from '@/island/features/eye/index.test-only';

import { DIAGNOSTICS_KEY } from './diagnostics';
import { PAUSE, SCRUBS } from './time-keys';
import { WHERE_KEY } from './where';

describe('time keys', () => {
  it('take no key the eye holds', () => {
    for (const code of [...Object.keys(SCRUBS), PAUSE]) {
      assert.ok(!EYE_KEYS.has(code), code);
    }
  });
});

describe('where key', () => {
  it('is no key the eye or the clock holds', () => {
    assert.ok(!EYE_KEYS.has(WHERE_KEY));
    assert.ok(![...Object.keys(SCRUBS), PAUSE].includes(WHERE_KEY));
  });
});

describe('diagnostics key', () => {
  it('is no key the eye, the clock or the where-line holds', () => {
    assert.ok(!EYE_KEYS.has(DIAGNOSTICS_KEY));
    assert.ok(
      ![...Object.keys(SCRUBS), PAUSE, WHERE_KEY].includes(DIAGNOSTICS_KEY),
    );
  });
});
