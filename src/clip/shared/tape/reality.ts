import { type Pen, reseed, STAGE } from '../ink';
import { fillNoise } from './noise-tiles';
import { TAPE_PALETTE } from './palette-tape';

// Film grain changes at film's rate, not video's.
const GRAIN_FPS = 24;

/**
 * Draws `scene` on the full 16:9 stage and finishes it as film rather than
 * tape: a fine grain, and a vignette far gentler than the tube's. `grain`
 * scales both, `1` by default.
 */
export function reality(pen: Pen, scene: (pen: Pen) => void, grain = 1): void {
  const { ctx, t } = pen;
  ctx.save();
  scene(pen);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.09 * grain;
  fillNoise(
    ctx,
    'grain',
    [0, 0, STAGE.width, STAGE.height],
    [1.2, 1.2],
    reseed(0x6f_11, Math.floor(t * GRAIN_FPS)),
  );
  const cx = STAGE.width / 2;
  const cy = STAGE.height / 2;
  const vignette = ctx.createRadialGradient(
    cx,
    cy,
    STAGE.height * 0.45,
    cx,
    cy,
    STAGE.width * 0.66,
  );
  vignette.addColorStop(0, TAPE_PALETTE.transparent);
  vignette.addColorStop(1, TAPE_PALETTE.black);
  ctx.globalAlpha = 0.45 * grain;
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}
