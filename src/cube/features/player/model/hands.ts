import {
  cross,
  dot,
  plus,
  type Pose,
  type Quad,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

import { hand, inAxes } from './hand';
import { LOOSE } from './hand-shape';
import { takingHand } from './held';
import { glimpse, type Look } from './look';
import type { Player } from './player';
import { viewOf } from './view';

/** Where the wrists are held before the eyes: ahead, to each side, below. */
const HELD: Vec3 = [0.07, 0.034, -0.04];
/** How far under that the hands hang before they rise into sight. */
const LOWERED = 0.09;

/**
 * Both hands as a shrink's `look` has them `t` seconds in: held before the
 * eyes, palms up and then turned over.
 */
function lookedAt(pose: Pose, look: Look, t: number): Quad[] {
  const { handsUp, turned } = glimpse(look, t);
  if (handsUp <= 0) return [];
  const { n, x, y, scale } = pose;
  const { eye, ahead, right, up } = viewOf(pose);
  const [forth, aside, under] = HELD;
  return ([1, -1] as const).flatMap((side) => {
    const view: readonly [Vec3, Vec3, Vec3] = [ahead, times(right, side), up];
    const wrist = plus(
      eye,
      times(
        inAxes(view, [forth, aside, under - (1 - handsUp) * LOWERED]),
        scale,
      ),
    );
    // Fingers ahead, a little up and in; the thumb outward while the palm
    // faces the eye, which is how the hands come up.
    const along = unit(inAxes(view, [0.9, -0.3, 0.45]));
    const outward = view[1];
    const across = unit(plus(outward, times(along, -dot(outward, along))));
    const square = cross(along, across);
    const through = dot(square, ahead) < 0 ? square : times(square, -1);
    const angle = turned * Math.PI;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    return hand(
      wrist,
      [
        along,
        plus(times(across, cos), times(through, sin)),
        plus(times(through, cos), times(across, -sin)),
      ],
      scale,
      { n, x, y },
      LOOSE,
    );
  });
}

/**
 * The body's hands where it sees them, in the frame of its pose's room, at
 * its own scale: `skin` hands out of `fabric` sleeves. Taking a pill, the one
 * hand that takes it, the pill in it once it is; in a shrink's look, both,
 * held before the eyes. Empty whenever they are out of sight.
 */
export function handsOf({ pose, act }: Player): Quad[] {
  if (act?.act === 'taking') return takingHand(pose, act);
  if (act?.act === 'shrinking') {
    return lookedAt(pose, act.shrinkLook, act.actFor);
  }
  return [];
}
