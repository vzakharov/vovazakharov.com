import { turnedToRoom } from '@/cube/shared/outside';
import { LADDER_OUT, toCube } from '@/cube/entities/island';
import { type Quad, type Room, times, type Vec3 } from '@/cube/entities/world';

import { grippingHand } from './grip';
import type { Stage } from './scenes';

/** Floor 1's room, whose frame the body's quads are in out of doors. */
const DOOR_ROOM: Room = { n: 1, x: 0n, y: 0n };

/** How far from its shoulder a whole body's hand holds a rung. */
const ARM = 0.7;
/** A whole body's shoulders: under the eye, and each side of it. */
const SHOULDER_UNDER = 0.22;
const SHOULDER_OUT = 0.19;
/** How far from the ladder's middle each hand holds a rung. */
const HAND_OUT = 0.11;

const BOTH_HANDS = ['left', 'right'] as const;

/**
 * The hands of a body of `scale` climbing `ladder` with its eye at `eye`, in
 * the frame of floor 1's room: each closed round a rung, the left on every
 * other rung and the right on those between, each on the one nearest the
 * eye's height. A hand whose rung is out of its arm's reach is not drawn.
 */
export function handsOnLadder(
  eye: Vec3,
  { foot, top, rungs }: Stage['ladder'],
  scale: number,
): Quad[] {
  const [, eyeY, eyeZ] = eye;
  const palm = turnedToRoom(times(LADDER_OUT, -1));
  return BOTH_HANDS.flatMap((side, parity) => {
    const mine = rungs.filter((_, index) => index % 2 === parity);
    const [rung] = mine.toSorted(
      (a, b) => Math.abs(a - eyeY) - Math.abs(b - eyeY),
    );
    // It faces west up the ladder, so its right hand is the northern one.
    const out = side === 'left' ? 1 : -1;
    if (rung === undefined) return [];
    const share = (rung - foot[1]) / (top[1] - foot[1]);
    const at: Vec3 = [
      foot[0] + (top[0] - foot[0]) * share,
      rung,
      foot[2] + out * HAND_OUT * scale,
    ];
    const shoulder: Vec3 = [
      eye[0],
      eyeY - SHOULDER_UNDER * scale,
      eyeZ + out * SHOULDER_OUT * scale,
    ];
    const far = Math.hypot(at[0] - shoulder[0], at[1] - shoulder[1]);
    if (far > ARM * scale) return [];
    return grippingHand(
      toCube(at),
      palm,
      toCube(shoulder),
      side,
      scale,
      DOOR_ROOM,
    );
  });
}
