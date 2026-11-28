import type { Scaling } from '@/scene/shared/lib/plane';

import { at, ellipse, ink, type Pen, reseed } from '../ink';
import { buffer, context2d, fitUnits, wipe } from './buffers';
import { frameAt, zapState } from './curves';
import { dotText } from './dot-text';
import { SCREEN } from './lines';
import { fillNoise } from './noise-tiles';
import { TAPE_PALETTE } from './palette-tape';
import { snow } from './snow';

/** A broadcast scene: draws the 4:3 picture, 960 × 720 units, from its own origin. */
export type Scene = (pen: Pen) => void;

// Tape resolves fewer columns than lines, and colour fewer still: the picture
// is recorded narrower than it plays, and the chroma narrower again, so the
// stretch back is the tape's own softness and colour bleed, at no cost.
const LUMA_RES = 0.8;
const CHROMA_RES = 0.4;
const CHROMA_LINES = 0.5;

/** The channel's bug: a disc in the top-right corner with «ГБ» on it. */
function bug(pen: Pen): void {
  at(pen, { x: 872, y: 72 }, () => {
    ink(pen, ellipse([0, 0], 36), {
      fill: TAPE_PALETTE.bugDisc,
      width: 5,
      seed: 0x6b,
    });
    dotText(pen, 'ГБ', [0, -13], {
      dot: 4,
      color: TAPE_PALETTE.osdShadow,
      align: 'center',
    });
  });
}

/** How a scene goes onto tape. */
export type Taping = {
  /** How damaged the tape is, `0` new to `1` chewed. */
  wear?: number;
  /** A channel change's progress, `1` locked; see `zapState`. */
  zap?: number;
  /** Leaves out the channel's «ГБ» from the picture's corner. */
  unbranded?: boolean;
};

type Recording = Required<Taping> & Scaling;

/**
 * `scene` recorded to tape at `scale` device pixels a unit, its red channel
 * taken out and laid back offset and smeared at a fraction of the resolution:
 * the chroma split. The tape's noise and lifted black are recorded with it,
 * so the tears carry them. A channel not yet locked (`zap` below 1) records
 * snowed over, dimmed and greyed.
 */
export function record(
  pen: Pen,
  scene: Scene,
  { scale, zap, wear, unbranded }: Recording,
): HTMLCanvasElement {
  const { ctx, playhead: t } = pen;
  const state = zapState(zap);
  const luma = buffer(
    ctx,
    'tape:luma',
    SCREEN.width * scale * LUMA_RES,
    SCREEN.height * scale,
  );
  const lc = context2d(luma);
  fitUnits(lc, SCREEN.width, SCREEN.height);
  wipe(lc, TAPE_PALETTE.black, SCREEN.width, SCREEN.height);
  const inner: Pen = { ...pen, ctx: lc };
  lc.save();
  scene(inner);
  lc.restore();
  if (!unbranded) bug(inner);
  if (state.colour < 1) {
    lc.globalCompositeOperation = 'saturation';
    lc.globalAlpha = 1 - state.colour;
    lc.fillStyle = TAPE_PALETTE.grey;
    lc.fillRect(0, 0, SCREEN.width, SCREEN.height);
  }
  if (state.light < 1) {
    lc.globalCompositeOperation = 'source-over';
    lc.globalAlpha = 1 - state.light;
    lc.fillStyle = TAPE_PALETTE.black;
    lc.fillRect(0, 0, SCREEN.width, SCREEN.height);
  }
  lc.globalCompositeOperation = 'source-over';
  lc.globalAlpha = 1;
  if (state.snow > 0) snow(inner, state.snow);
  const whole = [0, 0, SCREEN.width, SCREEN.height] as const;
  lc.globalAlpha = 0.06 + wear * 0.2;
  fillNoise(lc, 'grain', whole, [2.2, 1], reseed(0x7a_9f, frameAt(t)));
  // Tape never quite reaches black.
  lc.globalCompositeOperation = 'lighter';
  lc.globalAlpha = 0.5 + wear * 0.5;
  lc.fillStyle = TAPE_PALETTE.lift;
  lc.fillRect(...whole);

  const chroma = buffer(
    ctx,
    'tape:chroma',
    SCREEN.width * scale * CHROMA_RES,
    SCREEN.height * scale * CHROMA_LINES,
  );
  const cc = context2d(chroma);
  cc.setTransform(1, 0, 0, 1, 0, 0);
  cc.globalAlpha = 1;
  cc.globalCompositeOperation = 'copy';
  cc.drawImage(luma, 0, 0, chroma.width, chroma.height);
  cc.globalCompositeOperation = 'multiply';
  cc.fillStyle = TAPE_PALETTE.red;
  cc.fillRect(0, 0, chroma.width, chroma.height);
  lc.globalCompositeOperation = 'multiply';
  lc.globalAlpha = 1;
  lc.fillStyle = TAPE_PALETTE.cyan;
  lc.fillRect(...whole);
  // Red is laid back offset, stretched wider than the picture so the fringes
  // grow towards the sides.
  const split = 1.5 + wear * 6.5;
  const spread = SCREEN.width * (0.008 + wear * 0.014);
  lc.globalCompositeOperation = 'lighter';
  lc.drawImage(
    chroma,
    -spread / 2 - split,
    0,
    SCREEN.width + spread,
    SCREEN.height,
  );
  lc.globalCompositeOperation = 'source-over';
  return luma;
}
