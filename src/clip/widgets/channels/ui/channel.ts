import { smoothstep } from '@/clip/shared/ink';
import { broadcast, TAPE_FPS } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';

import { pressed, type Show } from './screen';
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

/**
 * How a channel is held. `zapFrames`: tape frames the zap's burst, roll,
 * grey and lock take together (4). `creep`: the nearness the bunny gains over
 * a held shot; set, the show also slows to a stop and its people turn to the
 * camera, and past a nearness of 0.85 the bunny's face is on the glass.
 */
export type ChannelHold = { zapFrames?: number; creep?: number };

// The nearness from which the bunny is pressed against the glass.
const PRESSED_FROM = 0.85;

/**
 * Channel `n` on the TV, zapped onto at the cut, the bunny on it at
 * `nearness`; the worse the dread, the worse the tape.
 */
export const channel =
  (n: number, nearness: number, hold: ChannelHold = {}): Drawing =>
  (pen, { sinceCut, p, seconds }) => {
    const show = SHOWS[((n % SHOWS.length) + SHOWS.length) % SHOWS.length];
    const { zapFrames = 4, creep } = hold;
    const held = creep !== undefined;
    // A held show runs down like a clock: its time eases to a stop.
    const slack = Math.max(0.1, seconds * 0.4);
    const since = held ? slack * (1 - Math.exp(-sinceCut / slack)) : sinceCut;
    const near = nearness + (creep ?? 0) * smoothstep(0, 1, p);
    const stare = held ? smoothstep(0.1, 0.55, p) : 0;
    const press = smoothstep(PRESSED_FROM - 0.05, 1, near);
    broadcast(
      pen,
      (tape) => {
        const slowed = { ...tape, playhead: tape.playhead - sinceCut + since };
        show?.(slowed, press > 0 ? Math.min(near, 0.8) : near, since, stare);
        if (press > 0) pressed(tape, press);
      },
      {
        zap: (sinceCut * TAPE_FPS) / zapFrames,
        wear: 0.25 + Math.max(0, near - 0.5) * 0.8 + (held ? 0.15 * p : 0),
      },
    );
  };
