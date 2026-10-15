import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseSetting } from './use-stored-setting';

describe('parseSetting', () => {
  it('reads a stored switch', () => {
    assert.equal(parseSetting('lossless', 'on'), true);
    assert.equal(parseSetting('shuffle', 'off'), false);
  });

  it('plays the MP3 at full volume for a reader who never chose', () => {
    assert.equal(parseSetting('lossless', null), false);
    assert.equal(parseSetting('volume', null), 1);
  });

  it('reads a stored volume', () => {
    assert.equal(parseSetting('volume', '0'), 0);
    assert.equal(parseSetting('volume', '0.35'), 0.35);
  });

  it('falls back to the default for what it cannot read', () => {
    assert.equal(parseSetting('remaining', 'true'), false);
    assert.equal(parseSetting('volume', ''), 1);
    assert.equal(parseSetting('volume', 'loud'), 1);
    assert.equal(parseSetting('volume', '1.5'), 1);
    assert.equal(parseSetting('volume', '-0.1'), 1);
  });
});
