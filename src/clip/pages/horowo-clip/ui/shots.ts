import type { Shot } from '@/clip/shared/timeline';

import { BREAKDOWN_SHOTS } from './shots-breakdown';
import { BRIDGE_SHOTS } from './shots-bridge';
import { CHORUS_SHOTS } from './shots-chorus';
import { DOUBLE_SHOTS } from './shots-double';
import { IDENT_SHOTS } from './shots-ident';
import { INTRO_SHOTS } from './shots-intro';
import { PREBRIDGE_SHOTS, REVEAL_HOLD } from './shots-prebridge';
import { VERSE_SHOTS } from './shots-verse';

/**
 * The clip, shot by shot, a file per section of the song's map. Within a
 * section's list a later entry cuts into an earlier one where their spans
 * overlap.
 */
export const SHOTS: readonly Shot[] = [
  ...IDENT_SHOTS,
  ...INTRO_SHOTS,
  ...DOUBLE_SHOTS,
  ...VERSE_SHOTS,
  ...CHORUS_SHOTS,
  ...PREBRIDGE_SHOTS,
  ...BRIDGE_SHOTS,
  REVEAL_HOLD,
  ...BREAKDOWN_SHOTS,
];
