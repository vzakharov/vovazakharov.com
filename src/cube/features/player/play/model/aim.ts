import { shortTurn } from '@/cube/shared/lib/turn';
import type {
  Doors,
  InRoom,
  Pose,
  Shelf,
  WallMounted,
} from '@/cube/entities/world';

import {
  bearing,
  canPress,
  canTake,
  doorsFaced,
  doorwayAt,
  type OpenDoor,
} from '../../body';

/** What a press of the hand answers: the room's pill, its sign, or a closed door, opened. */
export type Aim =
  | { at: 'pill' }
  | { at: 'sign' }
  | { at: 'door'; door: OpenDoor };

/**
 * What a body can press in its room: the pill's shelf and the sign where the
 * room has them, and which walls hold a door, none where it is absent.
 */
export type Pressable = Partial<Doors> & {
  shelf: Shelf | null;
  sign: WallMounted | null;
};

/** How far off the gaze of a body at `pose` the point `at` is, in radians. */
const offGaze = (pose: Pose, { u, v }: InRoom): number =>
  Math.abs(shortTurn(Math.atan2(v - pose.v, u - pose.u) - pose.yaw));

/**
 * What a press of the hand by a body at `pose` answers, of the pill it can
 * take, the sign it can press and the closed doors it faces: the one nearest
 * its gaze, a tie going in that order; null where it reaches none.
 */
export function aimOf(
  pose: Pose,
  { shelf, sign, isDoor }: Pressable,
): Aim | null {
  const aims: Array<{ aim: Aim; off: number }> = [];
  if (shelf !== null && canTake(pose, shelf)) {
    const { yaw } = bearing(pose, shelf);
    aims.push({
      aim: { at: 'pill' },
      off: Math.abs(shortTurn(yaw - pose.yaw)),
    });
  }
  if (sign !== null && canPress(pose, sign)) {
    aims.push({ aim: { at: 'sign' }, off: offGaze(pose, sign.at) });
  }
  for (const door of isDoor === undefined ? [] : doorsFaced(pose, isDoor)) {
    aims.push({
      aim: { at: 'door', door },
      off: offGaze(pose, doorwayAt(pose, door)),
    });
  }
  return aims.toSorted((a, b) => a.off - b.off)[0]?.aim ?? null;
}
