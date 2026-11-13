import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { DOORWAY } from '@/cube/shared/outside';
import { isOutside, type Pose, type Whereabouts } from '@/cube/entities/world';

import { forward } from './camera';
import { OUTSIDE_LENS, type OutsideLens } from './outside-lens';

/**
 * The eye's adaptation, as the outside lens's `indoors`: 1 for an eye used to
 * floor 1's lamps, 0 for one used to daylight. It is the body's own, like its
 * pose: it changes what one player sees, never the world.
 */

/** The view's rays the daylight is counted along, across and up. */
const COLUMNS = 9;
const ROWS = 7;
/** Half the view those rays span, in radians of yaw and of elevation. */
const HALF_ACROSS = 0.85;
const HALF_UP = 0.6;
/** The share of the view in daylight at which the eye is wholly used to it. */
const FILLED = 0.3;
/** Seconds to get most of the way used to the light, and to the dark. */
const TO_LIGHT = 0.5;
const TO_DARK = 2.5;

/** Whether the ray from `pose`'s eye turned by `yaw` and `elevation` leaves by the doorway. */
function leaves(pose: Pose, yaw: number, elevation: number): boolean {
  const [east, up, south] = forward({
    yaw: pose.yaw + yaw,
    elevation: pose.elevation + elevation,
  });
  if (east <= 0) return false;
  const run = (1 - pose.u) / east;
  const z = (pose.v + run * south) * ROOM_METRES;
  const y = (pose.eyeAbove + run * up) * ROOM_METRES;
  return z > DOORWAY.from && z < DOORWAY.to && y > 0 && y < DOORWAY.height;
}

/** The share of `pose`'s view that the doorway fills, on floor 1. */
function daylightSeen(pose: Pose): number {
  let through = 0;
  for (let i = 0; i < COLUMNS; i += 1) {
    for (let j = 0; j < ROWS; j += 1) {
      const yaw = HALF_ACROSS * ((2 * i) / (COLUMNS - 1) - 1);
      const elevation = HALF_UP * ((2 * j) / (ROWS - 1) - 1);
      if (leaves(pose, yaw, elevation)) through += 1;
    }
  }
  return through / (COLUMNS * ROWS);
}

/**
 * What an eye left at `at` for good gets used to: 0 out of doors, 1 in a room
 * that shows no daylight, and on floor 1 less the more of the view the
 * doorway fills — from its sill, looking out, 0.
 */
export function settled(at: Whereabouts): number {
  if (isOutside(at)) return 0;
  if (at.n !== 1) return 1;
  return 1 - Math.min(1, daylightSeen(at) / FILLED);
}

/**
 * `indoors` after `seconds` more at `at`: it nears what the eye settles to
 * there, to the light within the second and to the dark over several.
 */
export function adapted(
  indoors: number,
  at: Whereabouts,
  seconds: number,
): number {
  const target = settled(at);
  const over = target < indoors ? TO_LIGHT : TO_DARK;
  return target + (indoors - target) * Math.exp(-seconds / over);
}

/** The outside's lens for an eye `indoors` of the way used to the room. */
export const lensAdapted = (
  indoors: number,
  { exposure, eyelids }: OutsideLens = OUTSIDE_LENS,
): OutsideLens => ({ exposure, eyelids, indoors });
