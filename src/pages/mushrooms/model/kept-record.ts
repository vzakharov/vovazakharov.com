/**
 * What a reload brings back of a visit: one record per meadow, its meadow
 * settled at rest (`keeping.ts`), every moment in it on the next load's
 * clock.
 */

import type { Meadow } from './game';
import type { Eyed } from './ground';
import type { Seeded } from './random';
import type { WithGait } from './stride';

/** A meadow as it is kept: the selection, the pickers and the shower belong to the load that had them. */
export type KeptMeadow = Omit<
  Meadow,
  'selected' | 'picking' | 'furnishing' | 'planting' | 'rain'
>;

/** Where the child stands, facing which way, and whether on foot or in flight. */
type Stance = Eyed & WithGait;

/** One kept meadow, the visit seed that grew its world, and the child's stance in it. */
export type Kept = Seeded &
  Stance & {
    version: 1;
    meadow: KeptMeadow;
  };
