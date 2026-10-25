import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { releaseKind } from './release-kind.ts';

describe('releaseKind', () => {
  it('makes 25 minutes and up an album, however few the tracks', () => {
    assert.equal(releaseKind([1500]), 'album');
    assert.equal(releaseKind([600, 600, 300]), 'album');
  });

  it('makes a shorter release of up to three tracks a maxi single', () => {
    assert.equal(releaseKind([110]), 'maxi-single');
    assert.equal(releaseKind([200, 180, 185]), 'maxi-single');
    assert.equal(releaseKind([600, 600, 299]), 'maxi-single');
  });

  it('makes a shorter release of four tracks and up an EP', () => {
    assert.equal(releaseKind([240, 240, 240, 240]), 'ep');
    assert.equal(releaseKind(Array.from({ length: 13 }, () => 46)), 'ep');
  });
});
