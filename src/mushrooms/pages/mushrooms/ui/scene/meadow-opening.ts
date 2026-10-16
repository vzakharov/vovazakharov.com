import type { Opening } from '../../api/open-kept';
import type { Dusk } from '../../model/dusk';
import type { Flower } from '../../model/flower-genes';
import { visitFlowers } from '../../model/flower-sounds';
import { firstMeadow, type Meadow } from '../../model/game';
import { reopened } from '../../model/keeping';
import { mulberry32 } from '../../model/random';
import type { Opener } from './clump-shade';
import { FAR_FLOWERS } from './far-band';

/**
 * What the scene opens on: the kept meadow reopened, or a fresh one at
 * `dusk`; the seeded flowers; and the mushrooms that lay them out. Both of
 * those grow from the visit seed alone, the openers being the fresh meadow's
 * mushrooms even under a kept one, so a pulled opening mushroom moves no
 * seeded flower.
 */
export function meadowOpening(
  { seed, kept }: Pick<Opening, 'seed' | 'kept'>,
  dusk: Dusk,
): { meadow: Meadow; openers: readonly Opener[]; flowers: Flower[] } {
  const random = mulberry32(seed);
  const fresh = firstMeadow(random);
  // Drawn after the fresh meadow, off the same stream.
  const flowers = visitFlowers(random, seed, FAR_FLOWERS);
  const meadow = kept ? reopened(kept.meadow) : { ...fresh, dusk };
  return { meadow, openers: fresh.mushrooms, flowers };
}
