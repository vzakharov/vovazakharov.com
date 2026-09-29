/**
 * The grass tufts as the child plants on them: which one a tap lands on, and
 * where on the ground a flower planted there stands. Only a tap nothing else
 * takes reaches the grass (`MeadowScene.tapMeadow`), so a tuft answers where
 * no mushroom, flower, insect or button is drawn.
 */

import type { Point } from '../../model/geometry';
import type { Camera, FlowerFoot } from '../../model/ground';
import { FLOWER_SIZE, groundOf } from './flower-layout';
import type { Tuft } from './grass';

/**
 * How far round its middle a tuft answers a tap at the least, in CSS px: a
 * small finger's pad round a tuft drawn smaller than one, and no more, so
 * the bare ground between the tufts stays bare.
 */
export const TUFT_REACH = 22;
/** How far round its middle a tuft drawn larger than that answers, in units of its size: its blades. */
const TUFT_BLADES = 1.4;

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
function middleOf({ x, y, size }: Tuft): Point {
  return { x, y: y - size };
}

/** How far round its middle `tuft` answers a tap. */
export function tuftReach({ size }: Tuft): number {
  return Math.max(TUFT_REACH, size * TUFT_BLADES);
}

/** The tuft of `tufts` a tap at `point` lands on: the nearest whose reach holds it. */
export function tuftAt(tufts: readonly Tuft[], point: Point): Tuft | undefined {
  let nearest: Tuft | undefined;
  let least = Infinity;
  for (const tuft of tufts) {
    const middle = middleOf(tuft);
    const away = Math.hypot(middle.x - point.x, middle.y - point.y);
    if (away <= tuftReach(tuft) && away < least) {
      nearest = tuft;
      least = away;
    }
  }
  return nearest;
}

/**
 * The foot on the ground a flower planted on `tuft` stands on, as `camera`
 * shows the tuft: at its root, in a seeded flower's size.
 */
export function tuftFoot(camera: Camera, { x, y }: Tuft): FlowerFoot {
  return { ...groundOf(camera, { x, y, size: 0 }), size: FLOWER_SIZE };
}
