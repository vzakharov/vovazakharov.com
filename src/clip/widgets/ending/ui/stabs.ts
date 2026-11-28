import { at, lerp, type Pen } from '@/clip/shared/ink';
import { broadcast, dotText, SCREEN } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { head } from '@/clip/entities/puppet';
import { CONFETTI_PALETTE, serotoninFall } from '@/clip/entities/serotonin';

import { ENDING_PALETTE } from './palette-ending';

/** The whole picture under one loud colour. */
function wash({ ctx }: Pen, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
}

/** The grin filling the screen, eyes lit. */
function grin(pen: Pen, nearness: number): void {
  wash(pen, ENDING_PALETTE.magenta);
  bunny(pen, {
    x: SCREEN.width / 2,
    y: 380,
    nearness,
    eyes: 'glow',
    grin: 1,
    arms: 'reach',
    seed: 101,
  });
}

/** His head, mask and all, screaming. */
function scream(pen: Pen): void {
  wash(pen, ENDING_PALETTE.yellow);
  at(pen, { x: SCREEN.width / 2, y: 300, scale: 2.6 }, () => {
    head(pen, { jaw: 1, brow: 1, lid: 0, sweat: 1, gaze: [0, -0.2] }, 102);
  });
}

/** The word in the channel's dots, over the bunny's shadow. */
function word(pen: Pen, nearness: number): void {
  wash(pen, ENDING_PALETTE.red);
  bunny(pen, {
    x: SCREEN.width / 2,
    y: 420,
    nearness,
    rendering: 'shadow',
    arms: 'up',
    seed: 103,
  });
  dotText(pen, 'ХОРОШО', [SCREEN.width / 2, 300], {
    dot: 22,
    color: ENDING_PALETTE.paleDot,
    align: 'center',
  });
}

/** The bunny conducting a storm of confetti pills. */
function party(pen: Pen, nearness: number): void {
  wash(pen, ENDING_PALETTE.cyan);
  serotoninFall(pen, {
    ...SCREEN,
    density: 2,
    seed: 104,
    palette: CONFETTI_PALETTE,
  });
  bunny(pen, {
    x: SCREEN.width / 2,
    y: 400,
    nearness,
    arms: 'conduct',
    beat: pen.playhead % 1,
    grin: 1,
    seed: 105,
  });
}

const PICTURES = [grin, scream, word, party] as const;

/**
 * The `n`th of `count` stabs: a full-colour picture on a tape torn by
 * tracking errors, the bunny nearer at each.
 */
export const stab =
  (n: number, count: number): Drawing =>
  (pen: Pen, { p }: Local) => {
    const nearness = lerp(0.9, 1, n / Math.max(1, count - 1));
    const picture = PICTURES[n % PICTURES.length] ?? grin;
    broadcast(
      pen,
      (inner) => {
        picture(inner, nearness);
      },
      {
        wear: lerp(0.85, 1, p),
      },
    );
  };
