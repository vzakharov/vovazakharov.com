import type { Shot } from '@/clip/shared/timeline';

import { standIn } from './stand-in';

/** The breakdown and the ending: the tape tearing, the snow globe, the tube going dark. */
export const BREAKDOWN_SHOTS: readonly Shot[] = [
  standIn('breakdown', 'broadcast', 9),
];
