import type { Sound } from '@/cube/shared/lib/acoustics';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Vec2 } from '@/cube/shared/lib/vec';
import {
  CUBE_BOX,
  DOORWAY,
  islandHeight,
  waterLevelAt,
} from '@/cube/shared/outside';
import { isOutside, type Whereabouts } from '@/cube/entities/world';

import { bearingOf } from '../../cues';
import { type OutsideMix, outsideMix, type Scene, throughDoorway } from './mix';
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

/** The doorway's middle in floor 1's room, in metres from its north-west corner. */
const DOOR_IN_ROOM = { u: ROOM_METRES, v: (DOORWAY.from + DOORWAY.to) / 2 };

/** The doorway's middle on the world's ground plan. */
const DOOR_OUTSIDE: Vec2 = [CUBE_BOX.max[0], CUBE_BOX.min[2] + DOOR_IN_ROOM.v];

/** The deepest floor the outside is heard on at all. */
const HEARD_DOWN_TO = 4;

/**
 * What an eye at `at` hears of `scene`'s outside, `seconds` into the hour: all
 * of it in the open; through the doorway on floor 1, from where the doorway
 * is; a floor's slab fainter on each floor below; and null — nothing, and
 * nothing to keep sounding — below the last floor it reaches.
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
  const ear = { u: at.u * ROOM_METRES, v: at.v * ROOM_METRES };
  const { rightward, roomsAway: inward } = bearingOf(ear, at.yaw, DOOR_IN_ROOM);
  return throughDoorway(
    outsideMix(scene, { at: DOOR_OUTSIDE, gaze: 0 }, seconds),
    { inward, rightward, floorsBelow: at.n - 1 },
  );
}
