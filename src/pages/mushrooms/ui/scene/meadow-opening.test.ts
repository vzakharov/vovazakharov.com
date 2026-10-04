import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FULL_DAY, FULL_DUSK } from '../../model/dusk';
import { firstMeadow } from '../../model/game';
import { reopened, settled } from '../../model/keeping';
import { type Kept, KEPT_VERSION } from '../../model/kept-record';
import { mulberry32 } from '../../model/random';
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
  it('opens a fresh visit on its first meadow at the dusk given', () => {
    const opened = meadowOpening({ seed: SEED }, FULL_DAY);
    const fresh = firstMeadow(mulberry32(SEED));
    assert.deepEqual(opened.meadow, { ...fresh, dusk: FULL_DAY });
    assert.deepEqual(opened.openers, fresh.mushrooms);
  });

  it('reopens a kept meadow as it was kept, whatever the dusk given', () => {
    const record = kept(SEED);
    const opened = meadowOpening({ seed: SEED, kept: record }, FULL_DAY);
    assert.deepEqual(opened.meadow, reopened(record.meadow));
  });

  it('lays out the seeded flowers off the seed alone, kept or not', () => {
    const fresh = meadowOpening({ seed: SEED }, FULL_DAY);
    const again = meadowOpening({ seed: SEED, kept: kept(SEED) }, FULL_DUSK);
    assert.deepEqual(again.flowers, fresh.flowers);
    assert.deepEqual(again.openers, fresh.openers);
    assert.notDeepEqual(again.meadow.mushrooms, fresh.openers);
  });
});
