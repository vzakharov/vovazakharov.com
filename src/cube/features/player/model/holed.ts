import {
  holeQuarter,
  leverOf,
  planted,
  type Pose,
  roomKey,
} from '@/cube/entities/world';

import type { Holed } from './shrink';
import { plantedMaze } from './walls';

/**
 * The planted world's hole and lever of the room a pose stands in, for
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
          known.set(
            key,
            quarter && {
              quarter,
              lever: leverOf(plantedMaze, { n, x, y }, quarter),
            },
          );
        })
        .catch(onError);
    }
    return null;
  };
}
