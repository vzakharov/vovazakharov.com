import type { Ranged, Timed } from '@/kernel/shared/typings';

import { INK_PALETTE, type Pen, STAGE } from '@/clip/shared/ink';
import { through, within } from '@/clip/shared/score';

/** A shot's own clock, handed to its drawing alongside the clip's; `seconds` is the shot's length. */
export type Local = Timed & {
  /** Seconds since the shot began. */
  sinceCut: number;
  /** How far through the shot, 0 at its first frame to 1 at its cut. */
  p: number;
};

/** Draws one frame of a shot on the whole stage, as a pure function of its arguments. */
export type Drawing = (pen: Pen, local: Local) => void;

/** One shot of the clip: what is on screen from `from` until `to`. */
export type Shot = Ranged & {
  draw: Drawing;
};

/** The shot on screen at `t`: the last listed whose span holds it, so a later shot cuts into an earlier one. */
export const shotAt = (shots: readonly Shot[], t: number): Shot | undefined =>
  shots.findLast((shot) => within(shot, t));

export const localTime = (shot: Shot, t: number): Local => ({
  sinceCut: t - shot.from,
  p: through(shot, t),
  seconds: shot.to - shot.from,
});

/**
 * Paints the clip at `pen.playhead` over the whole stage: ink where no shot is, the
 * shot on screen otherwise, its context state restored after it.
 */
export function frame(pen: Pen, shots: readonly Shot[]): void {
  const { ctx, playhead } = pen;
  ctx.save();
  ctx.fillStyle = INK_PALETTE.ink;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const shot = shotAt(shots, playhead);
  shot?.draw(pen, localTime(shot, playhead));
  ctx.restore();
}
