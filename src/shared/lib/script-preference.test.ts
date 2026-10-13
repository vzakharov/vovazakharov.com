import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SCRIPT_PREFERENCE_SCRIPT } from './script-preference';

describe('SCRIPT_PREFERENCE_SCRIPT', () => {
  it('holds no character React escapes in a <script> child', () => {
    assert.doesNotMatch(SCRIPT_PREFERENCE_SCRIPT, /["&'<>]/);
  });
});
