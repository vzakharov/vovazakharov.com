import { type Pen, STAGE } from '../ink';
import { buffer, context2d, deviceScale, fitUnits, wipe } from './buffers';
import { tubeOffState } from './curves';
import { SCREEN } from './lines';
import { TAPE_PALETTE } from './palette-tape';
import { PICTURE } from './tube';

/** The part of the stage a switch-off collapses: the 4:3 tube, or the whole frame. */
export type TubeArea = 'tube' | 'stage';

/**
 * The tube switching off at `progress` in `[0, 1]`: what `draw` paints on the
 * stage collapses to a white line, the line to a dot, and the dot's
 * afterglow fades out. Paints the whole stage.
 */
export function tubeOff(
  pen: Pen,
  progress: number,
  draw: (pen: Pen) => void,
  area: TubeArea = 'tube',
): void {
  const { ctx } = pen;
  const state = tubeOffState(progress);
  const [ax, ay, aw, ah] =
    area === 'tube'
      ? [PICTURE.x, PICTURE.y, SCREEN.width, SCREEN.height]
      : [0, 0, STAGE.width, STAGE.height];
  const cx = ax + aw / 2;
  const cy = ay + ah / 2;

  ctx.save();
  wipe(ctx, TAPE_PALETTE.bezel, STAGE.width, STAGE.height);

  const w = aw * state.width;
  const h = Math.max(ah * state.height, 1.5);
  if (state.picture > 0) {
    const scale = deviceScale(ctx);
    const picture = buffer(
      ctx,
      'tape:off',
      STAGE.width * scale,
      STAGE.height * scale,
    );
    const pc = context2d(picture);
    fitUnits(pc, STAGE.width, STAGE.height);
    wipe(pc, TAPE_PALETTE.bezel, STAGE.width, STAGE.height);
    draw({ ...pen, ctx: pc });
    const px = picture.width / STAGE.width;
    ctx.drawImage(
      picture,
      ax * px,
      ay * px,
      aw * px,
      ah * px,
      cx - w / 2,
      cy - h / 2,
      w,
      h,
    );
  }
  // The beam, its sweep collapsing, piles its light into what is left.
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = state.flash;
  ctx.fillStyle = TAPE_PALETTE.phosphor;
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  if (state.glow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = state.glow;
    const radius = 10 + 60 * state.glow;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, TAPE_PALETTE.phosphor);
    glow.addColorStop(0.12, TAPE_PALETTE.phosphor);
    glow.addColorStop(1, TAPE_PALETTE.phosphorEdge);
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }
  ctx.restore();
}
