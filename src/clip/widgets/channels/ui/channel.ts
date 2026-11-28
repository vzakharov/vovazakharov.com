import { broadcast, TAPE_FPS } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';

import type { Show } from './screen';
import { forecast, postcardShow, quizBoard, teleshop } from './shows-day';
import { bunnyCard, newsDesk, stationClock, workout } from './shows-night';

/** The channels in zapping order; `channel(n)` wraps round past the last. */
export const SHOWS: readonly Show[] = [
  teleshop,
  forecast,
  quizBoard,
  postcardShow,
  newsDesk,
  bunnyCard,
  workout,
  stationClock,
];

// The zap's burst, roll, grey and lock take a tape frame each.
const ZAP_FRAMES = 4;

/**
 * Channel `n` on the TV, zapped onto at the cut, the bunny on it at
 * `nearness`; the worse the dread, the worse the tape.
 */
export const channel =
  (n: number, nearness: number): Drawing =>
  (pen, { sinceCut }) => {
    const show = SHOWS[((n % SHOWS.length) + SHOWS.length) % SHOWS.length];
    broadcast(
      pen,
      (tape) => {
        show?.(tape, nearness, sinceCut);
      },
      {
        zap: (sinceCut * TAPE_FPS) / ZAP_FRAMES,
        wear: 0.25 + Math.max(0, nearness - 0.5) * 0.8,
      },
    );
  };
