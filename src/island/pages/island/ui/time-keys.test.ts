import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EYE_KEYS } from '@/island/features/eye/index.test-only';

import { PAUSE, SCRUBS } from './time-keys';

describe('time keys', () => {
  it('take no key the eye holds', () => {
    for (const code of [...Object.keys(SCRUBS), PAUSE]) {
      assert.ok(!EYE_KEYS.has(code), code);
    }
  });
});
