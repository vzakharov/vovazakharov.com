import type { Shot } from '@/clip/shared/timeline';

import { standIn } from './stand-in';

/** The chorus: the meadow, cut with the ward wall and the gig. */
export const CHORUS_SHOTS: readonly Shot[] = [
  standIn('chorus', 'broadcast', 6),
];
