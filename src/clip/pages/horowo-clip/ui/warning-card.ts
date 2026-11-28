import { STAGE } from '@/clip/shared/ink';
import { writePlain } from '@/clip/shared/lettering';
import type { Drawing } from '@/clip/shared/timeline';

import { WARNING_PALETTE } from './palette-warning';

const HEADING = 'ВНИМАНИЕ';
const BODY =
  'В клипе много вспышек и мерцания.\nПри фоточувствительной эпилепсии\nлучше не смотреть.';
/** Seconds the card takes to come up from black, and to go back to it. */
const FADE = 0.6;

/**
 * The photosensitivity warning: white on black, set steady — the pen's boil
 * held, so not a line of it shivers — and faded in and out over the shot.
 */
export const warningCard: Drawing = (pen, { sinceCut, seconds }) => {
  const { ctx } = pen;
  ctx.fillStyle = WARNING_PALETTE.ground;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.globalAlpha = Math.max(
    0,
    Math.min(1, sinceCut / FADE, (seconds - sinceCut) / FADE),
  );
  const steady = { ...pen, boil: 0 };
  const x = STAGE.width / 2;
  writePlain(steady, HEADING, {
    letterHeight: 40,
    x,
    y: 240,
    alignment: 'center',
    tracking: 0.35,
    weight: 0.11,
    color: WARNING_PALETTE.text,
  });
  writePlain(steady, BODY, {
    letterHeight: 24,
    x,
    y: 350,
    alignment: 'center',
    leading: 2.1,
    weight: 0.1,
    color: WARNING_PALETTE.text,
  });
};
