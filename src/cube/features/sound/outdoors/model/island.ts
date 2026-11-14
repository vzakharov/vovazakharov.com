import type { Sound } from '@/cube/shared/lib/acoustics';
import type { Vec2 } from '@/cube/shared/lib/vec';
import { DOORWAY } from '@/cube/shared/outside';
import { CUBE_BOX, islandHeight, waterLevelAt } from '@/cube/entities/island';
import { isOutside, type Whereabouts } from '@/cube/entities/world';

import { indoors, type OutsideMix, outsideMix, type Scene } from './mix';
import { coastOf } from './shore';

const CUBE_MIDDLE: Vec2 = [
  (CUBE_BOX.min[0] + CUBE_BOX.max[0]) / 2,
  (CUBE_BOX.min[2] + CUBE_BOX.max[2]) / 2,
];

/** How many stretches the island's shore is heard as. */
const STRETCHES = 32;

/** The island the cube hangs over, as the ear has it. */
export const SOUNDING_ISLAND: Scene = {
  coast: coastOf(
    { islandHeight, waterAt: waterLevelAt },
    CUBE_MIDDLE,
    STRETCHES,
  ),
  cube: CUBE_MIDDLE,
};

/**
 * How the open beach sounds with nobody on it: no lamps, no walls to ring off,
 * and its air is the wind's own layer.
 */
export const BEACH: Sound = { footing: 'sand', hum: 0, air: 0, echo: 0.12 };

/** The doorway's middle on the world's ground plan. */
const DOOR_OUTSIDE: Vec2 = [
  CUBE_BOX.max[0],
  CUBE_BOX.min[2] + (DOORWAY.from + DOORWAY.to) / 2,
];

/** The deepest floor the cube's hum is heard on at all. */
const HEARD_DOWN_TO = 4;

/**
 * What an eye at `at` hears of `scene`'s outside, `seconds` into the hour: all
 * of it in the open; nothing of the sea or the wind indoors, and the hum only
 * on the floors below the entrance hall; and null — nothing to keep sounding —
 * below the last floor it reaches.
 */
export function heardFrom(
  scene: Scene,
  at: Whereabouts,
  seconds: number,
): OutsideMix | null {
  if (isOutside(at)) {
    const { eye, yaw } = at;
    return outsideMix(scene, { at: [eye[0], eye[2]], gaze: yaw }, seconds);
  }
  if (at.n > HEARD_DOWN_TO) return null;
  return indoors(outsideMix(scene, { at: DOOR_OUTSIDE, gaze: 0 }, seconds), {
    floorsBelow: at.n - 1,
  });
}
