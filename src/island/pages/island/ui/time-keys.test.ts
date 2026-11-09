import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EYE_KEYS } from '@/island/features/eye/index.test-only';

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
