import { filmTime, PREROLL } from '@/clip/shared/score';
import { broadcast, staticScene, testCard } from '@/clip/shared/tape';
import type { Shot } from '@/clip/shared/timeline';

import { onChannel } from './channel';

/** Film time the snow gives way to the test card. */
const TUNED = 0.5;
/** Film times each of the test card's ident lines appears. */
const LINES = [0.8, 1.5, 2.2];

const from = -PREROLL;
const to = 0;
// The ident opens the film, so its film time is its time since `from`.
const tuned = from + TUNED;

/** The channel's ident before the first note: snow, then the test card spelling itself out. */
export const IDENT_SHOTS: readonly Shot[] = [
  {
    from,
    to: tuned,
    draw: (pen) => {
      broadcast(pen, staticScene, { osd: null, unbranded: true });
    },
  },
  {
    from: tuned,
    to,
    draw: (pen, local) => {
      const lines = LINES.filter((at) => at <= filmTime(pen.playhead)).length;
      onChannel(
        pen,
        local,
        (inner) => {
          testCard(inner, lines);
        },
        1,
      );
    },
  },
];
