/**
 * What a reload brings back of a visit: one record per meadow, its meadow
 * settled at rest (`keeping.ts`), every moment in it on the next load's
 * clock.
 */

import type { Meadow } from './game';
import type { Seeded } from './random';
import type { WalkStart } from './walk';

/** A meadow as it is kept: the selection, the pickers and the shower belong to the load that had them. */
export type KeptMeadow = Omit<
  Meadow,
  'selected' | 'picking' | 'furnishing' | 'planting' | 'rain'
>;

/** One kept meadow, the visit seed that grew its world, and where the child stood in it and how, as the walk reopens there. */
export type Kept = Seeded &
  WalkStart & {
    version: 1;
    meadow: KeptMeadow;
  };
