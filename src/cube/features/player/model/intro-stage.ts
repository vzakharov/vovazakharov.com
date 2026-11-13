import {
  CUBE_BOX,
  CUBE_METRES,
  DOOR_LADDER,
  DOORWAY,
  islandHeight,
  toWorld,
  WAKE_AT,
  waterLevel,
} from '@/cube/shared/outside';

import type { Stage } from './scenes';
import { EYE_HEIGHT } from './step';

/**
 * How far inside the doorway the body arrives, and how far south of the
 * doorway's north jamb: past the potted plant that stands in the corner.
 */
const ARRIVES_IN = 0.9;
const ARRIVES_SOUTH = 0.64;

/** The pill's shelf on floor 1's west wall: metres south along it, and up. */
const SHELF_SOUTH = 3.75;
const SHELF_UP = 1;

/**
 * How far the body lies turned from straight out to sea, to its right: the
 * short way round to the cube is then to the right as well, which brings the
 * cube into frame ahead of the sun beside it.
 */
const ASKEW = 0.3;

/**
 * The intro's stage: the island, the cube over its crest, the ladder at the
 * doorway and the shore the body wakes on, its feet towards the sea and away
 * from the cube.
 */
const { foot, top, rungs, wide } = DOOR_LADDER;

export const INTRO_STAGE: Stage = {
  land: {
    height: (x, z) => islandHeight([x, z]),
    level: (x, z, seconds) => waterLevel([x, z], seconds),
    solids: [CUBE_BOX],
  },
  wake: {
    at: [WAKE_AT[0], WAKE_AT[2]],
    seaward:
      Math.atan2(
        WAKE_AT[2] - (CUBE_BOX.min[2] + CUBE_BOX.max[2]) / 2,
        WAKE_AT[0] - (CUBE_BOX.min[0] + CUBE_BOX.max[0]) / 2,
      ) + ASKEW,
  },
  cube: CUBE_BOX,
  ladder: {
    foot,
    top,
    rungs: rungs.map(([, y]) => y),
    solid: {
      min: [CUBE_BOX.max[0], foot[1], top[2] - wide / 2],
      max: [foot[0], top[1], top[2] + wide / 2],
    },
  },
  shelf: toWorld([0, SHELF_UP / CUBE_METRES, SHELF_SOUTH / CUBE_METRES]),
  arrival: toWorld([
    1 - ARRIVES_IN / CUBE_METRES,
    EYE_HEIGHT,
    (DOORWAY.from + (DOORWAY.to - DOORWAY.from) * ARRIVES_SOUTH) / CUBE_METRES,
  ]),
};
