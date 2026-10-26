import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '@/mushrooms/shared/lib/random';
import { FULL_DAY, FULL_DUSK } from '@/mushrooms/shared/world';

import { firstMeadow } from '../model/game';
import { reopened, settled } from '../model/keeping';
import { type Kept, KEPT_VERSION } from '../model/kept-record';
import { meadowOpening } from './meadow-opening';

const SEED = 0x5e_ed_18;

/** A meadow kept off another visit's, its first opening mushroom pulled. */
function kept(seed: number): Kept {
  const other = firstMeadow(mulberry32(seed + 1));
  const [, ...mushrooms] = other.mushrooms;
  return {
    version: KEPT_VERSION,
    seed,
    eye: { x: 0.5, y: -1, heading: 0.2 },
    gait: 'flight',
    meadow: settled({ ...other, mushrooms, dusk: FULL_DUSK }, 0),
  };
}

describe('meadowOpening', () => {
  it('opens a fresh visit on its first meadow, in full day', () => {
    const opened = meadowOpening({ seed: SEED });
    const fresh = firstMeadow(mulberry32(SEED));
    assert.deepEqual(opened.meadow, fresh);
    assert.deepEqual(opened.meadow.dusk, FULL_DAY);
    assert.deepEqual(opened.openers, fresh.mushrooms);
  });

  it('reopens a kept meadow as it was kept, dusk and all', () => {
    const record = kept(SEED);
    const opened = meadowOpening({ seed: SEED, kept: record });
    assert.deepEqual(opened.meadow, reopened(record.meadow));
  });

  it('lays out the seeded flowers off the seed alone, kept or not', () => {
    const fresh = meadowOpening({ seed: SEED });
    const again = meadowOpening({ seed: SEED, kept: kept(SEED) });
    assert.deepEqual(again.flowers, fresh.flowers);
    assert.deepEqual(again.openers, fresh.openers);
    assert.notDeepEqual(again.meadow.mushrooms, fresh.openers);
  });
});
