import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { sealHash } from './seal';

describe('sealHash', () => {
  it('is SHA-256 of the world, a slash and the path, in hex', async () => {
    const path = 'hole/66/36893488147419103231/0';
    assert.equal(
      await sealHash('42')(path),
      createHash('sha256').update(`42/${path}`).digest('hex'),
    );
  });

  it('takes only a world number', () => {
    assert.throws(() => sealHash('07'), /Not a world number/);
  });
});
