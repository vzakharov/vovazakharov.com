import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bounceAt } from './bounce';

describe('bounceAt', () => {
  it('lands squashed and upright at 0', () => {
    const landing = bounceAt(0, 100);
    assert.equal(landing.airGap, 0);
    assert.equal(landing.tipDegrees, 0);
    assert.ok(landing.squash < 1);
  });

  it('comes down to the ground at the end of each bounce', () => {
    assert.ok(bounceAt(0.999_99, 100).airGap < 1);
    assert.deepEqual(bounceAt(2.5, 100), bounceAt(0.5, 100));
  });

  it('bounces higher the bigger the block', () => {
    assert.ok(bounceAt(0.5, 200).airGap > bounceAt(0.5, 100).airGap);
  });

  it('tips the way its lean says', () => {
    assert.ok(bounceAt(0.3, 100, 1).tipDegrees > 0);
    assert.ok(bounceAt(0.3, 100, -1).tipDegrees < 0);
  });
});
