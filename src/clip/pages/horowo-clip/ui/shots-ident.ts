import { filmTime, PREROLL } from '@/clip/shared/score';
import { broadcast, staticScene, testCard } from '@/clip/shared/tape';
import type { Shot } from '@/clip/shared/timeline';

import { onChannel } from './channel';
import { IDENT_CUES } from './ident-cues';
import { warningCard } from './warning-card';

const { warning, warned, snow, tuned, lines, address } = IDENT_CUES;
// The pre-roll opens the film, so a cue's song time is its film time less it.
const song = (cue: number) => cue - PREROLL;

/**
 * The pre-roll before the first note: the photosensitivity warning, a beat
 * of black, snow, then the channel's test card spelling its ident out line by
 * line and holding until the song's first hit.
 */
export const IDENT_SHOTS: readonly Shot[] = [
  { from: song(warning), to: song(warned), draw: warningCard },
  {
    from: song(snow),
    to: song(tuned),
    draw: (pen) => {
      broadcast(pen, staticScene, { osd: null, unbranded: true });
    },
  },
  {
    from: song(tuned),
    to: 0,
    draw: (pen, local) => {
      const at = filmTime(pen.playhead);
      const written = lines.filter((cue) => cue <= at).length;
      onChannel(
        pen,
        local,
        (inner) => {
          testCard(inner, written, at < address);
        },
        1,
      );
    },
  },
];
