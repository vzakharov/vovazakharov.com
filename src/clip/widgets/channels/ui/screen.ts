import type { Pen, Point } from '@/clip/shared/ink';
import { dotText, SCREEN } from '@/clip/shared/tape';
import { type Arms, bunny } from '@/clip/entities/bunny';

import { CHANNELS_PALETTE } from './palette-channels';

export const { width: WIDTH, height: HEIGHT } = SCREEN;

/**
 * One channel's picture: 960 × 720 units drawn for a bunny `nearness` in
 * `[0, 1]`, `since` seconds after the zap landed on it.
 */
export type Show = (pen: Pen, nearness: number, since: number) => void;

/** A flat rectangle of `color`; the whole picture when no box is given. */
export function box(
  pen: Pen,
  color: string,
  [x, y, w, h]: readonly [number, number, number, number] = [
    0,
    0,
    WIDTH,
    HEIGHT,
  ],
): void {
  pen.ctx.fillStyle = color;
  pen.ctx.fillRect(x, y, w, h);
}

/** A line of the tape's dot face with a dark edge, its top at `y`. */
export function caption(
  pen: Pen,
  text: string,
  [x, y]: Point,
  dot = 8,
  color: string = CHANNELS_PALETTE.text,
): void {
  dotText(pen, text, [x, y], {
    dot,
    color,
    shadow: CHANNELS_PALETTE.textShadow,
    align: 'center',
  });
}

/**
 * The bunny in a show, its head at `head` when far, sliding toward the
 * picture's middle and growing as `nearness` climbs past the pre-bridge's.
 */
export function lurker(
  pen: Pen,
  nearness: number,
  [x, y]: Point,
  arms: Arms = 'down',
  seed = 0,
): void {
  const drift = Math.max(0, nearness - 0.5) * 1.2;
  bunny(pen, {
    x: x + (WIDTH / 2 - x) * drift,
    y: y + (HEIGHT * 0.38 - y) * drift,
    nearness,
    arms,
    swaying: 0.5,
    seed,
  });
}
