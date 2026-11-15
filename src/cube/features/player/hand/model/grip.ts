import {
  cross,
  dot,
  minus,
  type Quad,
  type Room,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

import { type Axes, CM, hand, inAxes } from './hand';
import { RUNG_AT, RUNG_GRIP } from './hand-shape';

/**
 * One hand closed round a rung, in its room's frame: the rung's middle under
 * the hand is `at`, the palm faces `palm` as nearly as the arm from `arm` —
 * an elbow or a shoulder — lets it, and the rung runs square to both. The
 * thumb of a right hand lies to the left of a palm that faces away.
 */
export function grippingHand(
  at: Vec3,
  palm: Vec3,
  arm: Vec3,
  side: 'left' | 'right',
  scale: number,
  room: Room,
): Quad[] {
  const along = unit(minus(at, arm));
  const through = unit(minus(palm, times(along, dot(palm, along))));
  const across =
    side === 'right' ? cross(along, through) : cross(through, along);
  const axes: Axes = [along, across, through];
  const wrist = minus(at, times(inAxes(axes, RUNG_AT), scale * CM));
  return hand(wrist, axes, scale, room, {
    ...RUNG_GRIP,
    sleeve: Math.hypot(...minus(wrist, arm)) / (scale * CM),
  });
}
