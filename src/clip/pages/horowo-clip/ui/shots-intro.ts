import type { Shot } from '@/clip/shared/timeline';

import { standIn } from './stand-in';

/** The intro: a children's show, jolting on each bar's first beat. */
export const INTRO_SHOTS: readonly Shot[] = [standIn('intro', 'broadcast', 2)];
