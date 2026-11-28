import { at, lerp, type Pen, smoothstep, STAGE } from '@/clip/shared/ink';
import { KICKS, punch } from '@/clip/shared/score';
import { reality, TAPE_FPS, torn } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { head } from '@/clip/entities/puppet';

import { ENDING_PALETTE } from './palette-ending';

const FRAME = 1 / TAPE_FPS;

/** The kicks from `start` up to `t`. */
const kicksBefore = (t: number, start: number): number[] =>
  KICKS.filter((k) => k >= start && k <= t);

/**
 * A hole in the song as a picture gone still: `picture` frozen on the frame
 * it opened on, its lines no longer boiling, the camera creeping in. Each
 * soft kick inside it tears one frame and leaves the picture a step further
 * askew, as if something under it had moved.
 */
export const stillHole =
  (picture: Drawing): Drawing =>
  (pen: Pen, local: Local) => {
    const { ctx, playhead } = pen;
    const { sinceCut, p } = local;
    const start = playhead - sinceCut;
    const kicks = kicksBefore(playhead, start);
    const askew = kicks.length;
    const hit = punch(KICKS, playhead);
    const place = {
      x: STAGE.width / 2 + askew * 14,
      y: STAGE.height / 2 - askew * 6,
      scale: lerp(1.02, 1.16, smoothstep(0, 1, p)) + askew * 0.03,
      rot: askew * -1.4,
    };
    const still = (inner: Pen) => {
      at(inner, place, () => {
        at(inner, { x: -STAGE.width / 2, y: -STAGE.height / 2 }, () => {
          picture(
            { ...inner, playhead: start, boil: 0 },
            { ...local, sinceCut: 0, p: 0 },
          );
        });
      });
    };
    const last = kicks.at(-1);
    if (last !== undefined && playhead - last < FRAME) {
      torn(pen, still, { amount: 0.9, seed: askew });
      return;
    }
    still(pen);
    // The light sinks as the hole goes on; a kick lifts it for an instant.
    ctx.save();
    ctx.globalAlpha = Math.max(0, 0.15 + 0.35 * p - 0.3 * hit);
    ctx.fillStyle = ENDING_PALETTE.black;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    ctx.restore();
  };

/**
 * His head alone on black, stock-still, staring into the lens with the jaw
 * shut, a step nearer at each of `steps` (song times); the LED eye the only
 * thing alive, blinking slow.
 */
export const staringHead =
  (steps: readonly number[]): Drawing =>
  (pen: Pen, local: Local) => {
    const t = pen.playhead;
    const step = steps.filter((s) => s <= t).length;
    const lit = Math.floor(local.sinceCut * 1.6) % 2 === 0;
    reality(pen, (inner) => {
      inner.ctx.fillStyle = ENDING_PALETTE.black;
      inner.ctx.fillRect(0, 0, STAGE.width, STAGE.height);
      at(
        inner,
        { x: STAGE.width / 2, y: 330 + step * 40, scale: 3.4 + step * 1.5 },
        () => {
          head(
            { ...inner, boil: 0 },
            {
              jaw: 0,
              gaze: [0, 0],
              brow: -0.6,
              lid: 0,
              led: lit ? ENDING_PALETTE.ledLit : ENDING_PALETTE.ledDark,
              sweat: 0.4 + 0.2 * step,
            },
            161,
          );
        },
      );
    });
  };
