import {
  CUBE_AT,
  CUBE_BOX,
  CUBE_METRES,
  DOORWAY,
  islandHeight,
  toWorld,
  WAKE_AT,
  waterLevel,
} from '@/cube/shared/outside';
import type { Vec3 } from '@/cube/entities/world';

import type { Footprint } from './roam';
import type { Stage } from './scenes';
import { EYE_HEIGHT } from './step';

/** The cube on the ground plan. */
const CUBE: Footprint = {
  west: CUBE_BOX.min[0],
  east: CUBE_BOX.max[0],
  north: CUBE_BOX.min[2],
  south: CUBE_BOX.max[2],
};

/** How steeply the ladder leans, from the sand, and its rungs' spacing and width. */
const LEAN = (75 * Math.PI) / 180;
const RUNG_EVERY = 0.28;
const LADDER_WIDE = 0.45;

/** The doorway's middle south of the cube frame's origin, in metres. */
const DOOR_MIDDLE = (DOORWAY.from + DOORWAY.to) / 2;

/** The ladder's top, on the sill under the doorway's middle. */
const LADDER_TOP: Vec3 = [CUBE.east, CUBE_AT[1], CUBE_AT[2] + DOOR_MIDDLE];

/**
 * The ladder's foot: east of its top on the sand, where a ladder leaning at
 * `LEAN` from the sill comes down.
 */
function ladderFoot(): Vec3 {
  const [x, top, z] = LADDER_TOP;
  // The sand falls away eastward, so the reach is found, not solved for.
  let out = (top - islandHeight([x, z])) / Math.tan(LEAN);
  for (let pass = 0; pass < 8; pass += 1) {
    out = (top - islandHeight([x + out, z])) / Math.tan(LEAN);
  }
  return [x + out, islandHeight([x + out, z]), z];
}

const LADDER_FOOT = ladderFoot();

/** The rungs' heights from the lowest, the last a step under the sill. */
const RUNGS = Array.from(
  { length: Math.floor((LADDER_TOP[1] - LADDER_FOOT[1]) / RUNG_EVERY - 0.5) },
  (_, index) => LADDER_FOOT[1] + RUNG_EVERY * (index + 1),
);

/**
 * How far inside the doorway the body arrives, and how far south of the
 * doorway's north jamb: past the potted plant that stands in the corner.
 */
const ARRIVES_IN = 0.9;
const ARRIVES_SOUTH = 0.64;

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
export const INTRO_STAGE: Stage = {
  land: {
    height: (x, z) => islandHeight([x, z]),
    level: (x, z, seconds) => waterLevel([x, z], seconds),
    solids: [
      CUBE,
      {
        west: LADDER_TOP[0],
        east: LADDER_FOOT[0],
        north: LADDER_TOP[2] - LADDER_WIDE / 2,
        south: LADDER_TOP[2] + LADDER_WIDE / 2,
      },
    ],
  },
  wake: {
    at: [WAKE_AT[0], WAKE_AT[2]],
    seaward:
      Math.atan2(
        WAKE_AT[2] - (CUBE.north + CUBE.south) / 2,
        WAKE_AT[0] - (CUBE.west + CUBE.east) / 2,
      ) + ASKEW,
  },
  cube: { ...CUBE, underside: CUBE_BOX.min[1] },
  ladder: { foot: LADDER_FOOT, top: LADDER_TOP, rungs: RUNGS },
  arrival: toWorld([
    1 - ARRIVES_IN / CUBE_METRES,
    EYE_HEIGHT,
    (DOORWAY.from + (DOORWAY.to - DOORWAY.from) * ARRIVES_SOUTH) / CUBE_METRES,
  ]),
  indoors: 1,
};
