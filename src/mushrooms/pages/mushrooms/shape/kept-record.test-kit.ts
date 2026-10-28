import { FULL_DAY } from '@/mushrooms/shared/sky';
import { NO_NIGHT_RUNS } from '@/mushrooms/features/mice-run/index.node-safe';

import { type Kept, KEPT_VERSION } from './kept-record';
import type { KeptMeadow } from './meadow';

/** A kept meadow with nothing grown in it yet. */
const EMPTY_MEADOW = {
  mushrooms: [],
  spores: [],
  scattered: 0,
  insects: [],
  planted: [],
  pulled: [],
  grown: 0,
  released: 0,
  dusk: FULL_DAY,
  nightRuns: NO_NIGHT_RUNS,
} satisfies KeptMeadow;

/** A kept record told apart from the others by its seed. */
export function keptRecord(seed: number): Kept {
  return {
    version: KEPT_VERSION,
    seed,
    eye: { x: 0.5, y: -1, heading: 0.2 },
    gait: 'flight',
    meadow: EMPTY_MEADOW,
  };
}
