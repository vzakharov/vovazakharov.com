import { DOORWAY } from '@/cube/shared/cube-boundary';
import { moved, scaled, type Vec3 } from '@/cube/shared/lib/vec';
import { f32, vecf, wgsl } from '@/cube/shared/shader';

import { islandHeight } from './island-height';
import { CUBE_AT, CUBE_BOX } from './place';

/**
 * Something that knows whether the ladder has gone from the doorway: it stands
 * until `ladderGone` is true.
 */
export type Laddered = { ladderGone?: boolean };

/** How steep an ordinary ladder is leant: four up for one out. */
const LEAN = Math.atan(4);

/** Its stiles' middles apart, and one stile's section: across, and through the ladder. */
const WIDE = 0.4;
const STILE = { across: 0.032, through: 0.07 };

/** A rung's section, a round bar 3 cm through, and how far apart rungs are: a step a person takes. */
const RUNG = { tall: 0.03, through: 0.03 };
const PITCH = 0.29;

/** How far the feet stand in the sand, and the top rung under the sill. */
const SUNK = 0.04;
const TOP_STEP = 0.27;

/**
 * The ladder leant to the doorway's sill: the middle of its foot, in the sand
 * east of the cube, and of its top, against the cube's east face under the
 * sill, in the world frame; its rungs' middles from the lowest up; and its
 * sizes, in metres.
 */
function ladder() {
  const z = CUBE_AT[2] + (DOORWAY.from + DOORWAY.to) / 2;
  const face = CUBE_BOX.max[0];
  // The stiles' backs touch the face, so their middles stand half a stile out.
  const top: Vec3 = [
    face + STILE.through / (2 * Math.sin(LEAN)),
    CUBE_AT[1] - 0.01,
    z,
  ];
  // The foot is where the lean meets the sand, which the sand's own slope
  // moves: a few rounds settle it.
  let foot: Vec3 = [top[0] + 1, 0, z];
  for (let round = 0; round < 8; round += 1) {
    const ground = islandHeight([foot[0], z]) - SUNK;
    foot = [top[0] + (top[1] - ground) / Math.tan(LEAN), ground, z];
  }
  const length = Math.hypot(top[0] - foot[0], top[1] - foot[1]);
  const steps = Math.floor((length - TOP_STEP - 0.2) / PITCH);
  const lowest = length - TOP_STEP - steps * PITCH;
  const rungs = Array.from({ length: steps + 1 }, (_, k) =>
    moved(foot, moved(top, foot, -1), (lowest + k * PITCH) / length),
  );
  return {
    foot,
    top,
    rungs,
    length,
    /** How far up the stiles the lowest and the highest rung are. */
    lowest,
    highest: length - TOP_STEP,
    wide: WIDE,
    stile: STILE,
    rung: RUNG,
    pitch: PITCH,
  };
}

export const DOOR_LADDER = ladder();

/** The ladder's unit directions: up its stiles, across its rungs, and out of its face, towards the sun's side. */
export const LADDER_UP: Vec3 = scaled(
  moved(DOOR_LADDER.top, DOOR_LADDER.foot, -1),
  1 / DOOR_LADDER.length,
);
export const LADDER_ACROSS: Vec3 = [0, 0, 1];
export const LADDER_OUT: Vec3 = [LADDER_UP[1], -LADDER_UP[0], 0];

/** The ladder in WGSL: its foot, directions and sizes as constants. */
export const LADDER_WGSL = wgsl(
  'outside/ladder',
  /* wgsl */ `
const LADDER_FOOT = ${vecf(DOOR_LADDER.foot)};
const LADDER_UP = ${vecf(LADDER_UP)};
const LADDER_ACROSS = ${vecf(LADDER_ACROSS)};
const LADDER_OUT = ${vecf(LADDER_OUT)};
/// Its length, its stiles' middles apart, a stile's width across, and the
/// rungs' pitch.
const LADDER_SIZE = vec4f(${f32(DOOR_LADDER.length)}, ${f32(WIDE)}, ${f32(STILE.across)}, ${f32(PITCH)});
/// How far up the stiles the lowest and the highest rung are, and a rung's height.
const LADDER_RUNGS = vec3f(${f32(DOOR_LADDER.lowest)}, ${f32(DOOR_LADDER.highest)}, ${f32(RUNG.tall)});
`,
);
