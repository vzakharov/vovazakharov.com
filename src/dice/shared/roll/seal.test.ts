import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { roll } from './roll';
import { sealHash, sealWith } from './seal';

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

describe('sealWith', () => {
  it("seals a key under its name, as roll addresses a struct's field", async () => {
    const seals = sealWith('42', {
      hole: roll.key({ n: roll.int, x: roll.big }),
    });
    assert.equal(
      await seals.hole.at({ n: 66, x: 36_893_488_147_419_103_231n }),
      await sealHash('42')('hole/66/36893488147419103231'),
    );
  });
});
