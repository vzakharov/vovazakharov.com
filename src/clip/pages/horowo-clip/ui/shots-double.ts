import type { Shot } from '@/clip/shared/timeline';

import { standIn } from './stand-in';

/** Double time: the band live in the studio. */
export const DOUBLE_SHOTS: readonly Shot[] = [
  standIn('double time', 'broadcast', 3),
];
