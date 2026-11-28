import type { WithHeight } from '@/kernel/shared/typings';

import type { Ordinate } from '@/scene/shared/lib/plane';

import { noise, reseed } from '../ink';

/** The 4:3 picture's own size: what a broadcast scene draws in. */
export const SCREEN = { width: 960, height: 720 } as const;

// Band heights: coarse where the picture holds, fine where it tears.
const COARSE = 12;
const FINE = 2;
// The head-switching strip along the bottom edge.
const HEAD = 14;

/**
 * A strip of the picture as the tape plays it: drawn at `y`, `height` tall, from
 * the recorded picture's row `sourceRow`, pushed `dx` sideways.
 */
export type TapeLine = Ordinate &
  WithHeight & { sourceRow: number; dx: number };

type Tear = {
  /** The video frame, which reseeds the lines' shake. */
  frame: number;
  wear: number;
  /** The tracking bar, if one is crossing. */
  bar: { y: number; height: number; strength: number } | null;
  /** How far up the picture has slipped, as a fraction of its height. */
  slip: number;
  /** Extra shake in `[0, 1]`, from a channel not yet locked. */
  jitter: number;
};

/**
 * The picture cut into the strips the tape plays it as, top to bottom,
 * covering its height with no gap: lines shake with `wear`, tear sideways in
 * the tracking bar and along the head-switching strip, and wrap where a
 * rolling picture crosses its own edge.
 */
export function tapeLines({
  frame,
  wear,
  bar,
  slip,
  jitter,
}: Tear): TapeLine[] {
  const key = reseed(0x3c_11, frame);
  const offset = (((slip % 1) + 1) % 1) * SCREEN.height;
  const lines: TapeLine[] = [];
  let y = 0;
  for (let n = 0; y < SCREEN.height; n += 1) {
    const inHead = y >= SCREEN.height - HEAD;
    const barAt = bar ? Math.abs(y - bar.y) / (bar.height / 2) : 2;
    const h = Math.min(
      inHead || barAt < 1.4 ? FINE : COARSE,
      SCREEN.height - y,
    );
    // A worn tape's picture sways in a slow wave down its height, and every
    // line shakes on top of it.
    const sway = wear * wear * 7 * Math.sin(y * 0.011 + frame * 0.21);
    let dx = sway + noise(key, n) * (0.4 + wear * 2.6 + jitter * 18);
    if (bar && barAt < 1) {
      const profile = Math.cos((barAt * Math.PI) / 2);
      dx += bar.strength * profile * (10 + 26 * (noise(key + 1, n) + 1));
    }
    if (inHead) {
      const depth = (y - (SCREEN.height - HEAD)) / HEAD;
      dx += depth * (5 + wear * 16) + noise(key + 2, n) * 3;
    }
    const source = (y + offset) % SCREEN.height;
    const rest = SCREEN.height - source;
    if (rest < h) {
      lines.push(
        { y, height: rest, sourceRow: source, dx },
        { y: y + rest, height: h - rest, sourceRow: 0, dx },
      );
    } else {
      lines.push({ y, height: h, sourceRow: source, dx });
    }
    y += h;
  }
  return lines;
}
