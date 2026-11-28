import { type Pen, reseed } from '../ink';
import { frameAt } from './curves';
import { SCREEN } from './lines';
import { fillNoise } from './noise-tiles';
import { TAPE_PALETTE } from './palette-tape';

/**
 * Static over the 4:3 picture at `alpha`: fine grain, coarser streaks over
 * it, and the dark band of a lost sync rolling down through both.
 */
export function snow(pen: Pen, alpha = 1): void {
  const { ctx, t } = pen;
  const key = reseed(0x51_a7, frameAt(t));
  const whole = [0, 0, SCREEN.width, SCREEN.height] as const;
  ctx.save();
  const base = ctx.globalAlpha * alpha;
  ctx.globalAlpha = base;
  fillNoise(ctx, 'snow', whole, [1.6, 1.3], reseed(key, 0));
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = base * 0.22;
  fillNoise(ctx, 'snow', whole, [4.5, 1.3], reseed(key, 1));
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = base * 0.35;
  ctx.fillStyle = TAPE_PALETTE.black;
  const band = 110;
  const y = ((t * 260) % (SCREEN.height + band)) - band;
  ctx.fillRect(0, y, SCREEN.width, band);
  ctx.restore();
}

/** A full picture of static: a scene of its own, for the broadcast to carry. */
export function staticScene(pen: Pen): void {
  snow(pen);
}
