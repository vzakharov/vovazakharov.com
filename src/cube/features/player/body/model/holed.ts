import {
  holeQuarter,
  planted,
  type Pose,
  type Quarter,
  type Room,
  roomKey,
  shelfOf,
} from '@/cube/entities/world';

import { looks } from './look';
import type { Holed } from './player';
import { plantedMaze } from './walls';

const plantedLook = looks(planted.seed);

/** The planted world's shelf and look for `room`, whose hole is in `quarter`. */
export const plantedHoledOf = (room: Room, quarter: Quarter): Holed => ({
  quarter,
  shelf: shelfOf(plantedMaze, room, quarter),
  shrinkLook: plantedLook(room),
});

/**
 * The planted world's hole, shelf and look of the room a pose stands in, for
 * `play`'s `here`. A room is looked up once, in the background, the first
 * time it is asked for, and reads as unholed until its answer is in; a lookup
 * that fails goes to `onError`.
 */
export function plantedHoled(
  onError: (error: Error) => void,
): (pose: Pose) => Holed | null {
  const known = new Map<string, Holed | null>();
  const asked = new Set<string>();
  return (pose) => {
    const key = roomKey(pose);
    const hit = known.get(key);
    if (hit !== undefined) return hit;
    if (!asked.has(key)) {
      asked.add(key);
      const { n, x, y } = pose;
      holeQuarter(planted, n, x, y)
        .then((quarter) => {
          known.set(key, quarter && plantedHoledOf({ n, x, y }, quarter));
        })
        .catch(onError);
    }
    return null;
  };
}
