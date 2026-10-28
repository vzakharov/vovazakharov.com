import { mulberry32 } from '@/mushrooms/shared/lib/random';
import {
  FAR_FLOWERS,
  type Flower,
  visitFlowers,
} from '@/mushrooms/entities/flower/index.node-safe';
import type { Opener } from '@/mushrooms/entities/mushroom/index.node-safe';

import type { Reopened } from '../api/open-kept';
import { firstMeadow, type Meadow } from '../model/game';
import { reopened } from '../model/keeping';

/**
 * What the scene opens on: the kept meadow reopened, or a fresh one in full
 * day; the seeded flowers; and the mushrooms that lay them out. Both of those
 * grow from the visit seed alone, the openers being the fresh meadow's
 * mushrooms even under a kept one, so a pulled opening mushroom moves no
 * seeded flower.
 */
export function meadowOpening({ seed, kept }: Reopened): {
  meadow: Meadow;
  openers: readonly Opener[];
  flowers: Flower[];
} {
  const random = mulberry32(seed);
  const fresh = firstMeadow(random);
  // Drawn after the fresh meadow, off the same stream.
  const flowers = visitFlowers(random, seed, FAR_FLOWERS);
  const meadow = kept ? reopened(kept.meadow) : fresh;
  return { meadow, openers: fresh.mushrooms, flowers };
}
