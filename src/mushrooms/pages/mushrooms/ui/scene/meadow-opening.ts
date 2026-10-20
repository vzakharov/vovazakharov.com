<<<<<<< HEAD:src/mushrooms/pages/mushrooms/ui/scene/meadow-opening.ts
import type { Opening } from '../../api/open-kept';
=======
import type { Reopened } from '../../api/open-kept';
import type { Dusk } from '../../model/dusk';
>>>>>>> origin/main:src/pages/mushrooms/ui/scene/meadow-opening.ts
import type { Flower } from '../../model/flower-genes';
import { visitFlowers } from '../../model/flower-sounds';
import { firstMeadow, type Meadow } from '../../model/game';
import { reopened } from '../../model/keeping';
import { mulberry32 } from '../../model/random';
import type { Opener } from './clump-shade';
import { FAR_FLOWERS } from './far-band';

/**
 * What the scene opens on: the kept meadow reopened, or a fresh one in full
 * day; the seeded flowers; and the mushrooms that lay them out. Both of those
 * grow from the visit seed alone, the openers being the fresh meadow's
 * mushrooms even under a kept one, so a pulled opening mushroom moves no
 * seeded flower.
 */
<<<<<<< HEAD:src/mushrooms/pages/mushrooms/ui/scene/meadow-opening.ts
export function meadowOpening({ seed, kept }: Pick<Opening, 'seed' | 'kept'>): {
  meadow: Meadow;
  openers: readonly Opener[];
  flowers: Flower[];
} {
=======
export function meadowOpening(
  { seed, kept }: Reopened,
  dusk: Dusk,
): { meadow: Meadow; openers: readonly Opener[]; flowers: Flower[] } {
>>>>>>> origin/main:src/pages/mushrooms/ui/scene/meadow-opening.ts
  const random = mulberry32(seed);
  const fresh = firstMeadow(random);
  // Drawn after the fresh meadow, off the same stream.
  const flowers = visitFlowers(random, seed, FAR_FLOWERS);
  const meadow = kept ? reopened(kept.meadow) : fresh;
  return { meadow, openers: fresh.mushrooms, flowers };
}
