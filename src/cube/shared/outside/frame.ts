import { ROOM_HEIGHT, ROOM_METRES } from '../lib/room-shape';
import type { Vec2, Vec3 } from '../lib/vec';
import { f32, vecf, wgsl } from '../lib/wgsl';
import { islandHeight } from './island-height';

/** The cube's side in metres: one side of floor 1's room. */
export const CUBE_METRES = ROOM_METRES;

/** How far the cube's underside hangs over the sand beneath its middle. */
const HOVER = 1.1;

/** The cube's middle on the ground plan of the world frame. */
const CUBE_MIDDLE: Vec2 = [0, 0];

/**
 * Where the cube frame's origin — the north-west corner of floor 1's room, on
 * its slab — stands in the world frame W: metres, x east, y up from the still
 * sea, z south. The two frames differ by this and the cube's side, no turn.
 */
export const CUBE_AT: Vec3 = [
  CUBE_MIDDLE[0] - CUBE_METRES / 2,
  islandHeight(CUBE_MIDDLE) + HOVER + ROOM_HEIGHT * CUBE_METRES,
  CUBE_MIDDLE[1] - CUBE_METRES / 2,
];

/** A point of the cube frame, in floor 1's room sides, in the world frame. */
export const toWorld = ([x, y, z]: Vec3): Vec3 => [
  CUBE_AT[0] + x * CUBE_METRES,
  CUBE_AT[1] + y * CUBE_METRES,
  CUBE_AT[2] + z * CUBE_METRES,
];

/** A point of the world frame in the cube frame. */
export const toCube = ([x, y, z]: Vec3): Vec3 => [
  (x - CUBE_AT[0]) / CUBE_METRES,
  (y - CUBE_AT[1]) / CUBE_METRES,
  (z - CUBE_AT[2]) / CUBE_METRES,
];

/** A box square to the axes, by its least and greatest corners. */
export type Box = { min: Vec3; max: Vec3 };

/** The space the cube fills, in the world frame. */
export const CUBE_BOX: Box = {
  min: toWorld([0, -ROOM_HEIGHT, 0]),
  max: toWorld([1, ROOM_HEIGHT, 1]),
};

/**
 * The doorway in the east wall of floor 1's room, in metres of that room:
 * `from` and `to` south of the north-east corner, its sill on the slab.
 */
export const DOORWAY = { from: 0.274, to: 1.244, height: 2.1 };

/** The doorway's opening in the cube's east face, in the world frame. */
export const DOORWAY_BOX: Box = {
  min: [CUBE_BOX.max[0], CUBE_AT[1], CUBE_AT[2] + DOORWAY.from],
  max: [CUBE_BOX.max[0], CUBE_AT[1] + DOORWAY.height, CUBE_AT[2] + DOORWAY.to],
};

/** How far off the eye's far plane is whenever a frame shows the outside. */
export const FAR_METRES = 20_000;

/**
 * Metres over the still sea of the sand the player's head wakes on: the
 * highest swash of the hour reaches 0.24 m, where their toes lie, and nothing
 * is ever wet from 0.3 m.
 */
const WAKE_BED = 0.34;

/**
 * Where the beach stands `level` metres over the still sea, going out from
 * the cube's middle along unit `[x, z]`.
 */
function beachAlong([x, z]: Vec2, level: number): Vec2 {
  const at = (metres: number): Vec2 => [
    CUBE_MIDDLE[0] + x * metres,
    CUBE_MIDDLE[1] + z * metres,
  ];
  let above = 0;
  let below = 200;
  for (let step = 0; step < 40; step += 1) {
    const middle = (above + below) / 2;
    if (islandHeight(at(middle)) > level) above = middle;
    else below = middle;
  }
  return at(above);
}

const WAKE_SPOT = beachAlong([-Math.SQRT1_2, Math.SQRT1_2], WAKE_BED);

/**
 * Where the player's head lies on waking: on dry sand up the beach south-west
 * of the cube, the body down the slope and the sea reaching for the feet.
 */
export const WAKE_AT: Vec3 = [WAKE_SPOT[0], WAKE_BED, WAKE_SPOT[1]];

/**
 * The frames in WGSL: `CUBE_AT`, `CUBE_METRES`, the cube's and the doorway's
 * boxes as `CUBE_MIN`, `CUBE_MAX`, `DOORWAY_MIN`, `DOORWAY_MAX`, and `toWorld`
 * and `toCube` between a point of each.
 */
export const WORLD = wgsl(
  'outside/world',
  /* wgsl */ `
const CUBE_AT = ${vecf(CUBE_AT)};
const CUBE_METRES = ${f32(CUBE_METRES)};
const CUBE_MIN = ${vecf(CUBE_BOX.min)};
const CUBE_MAX = ${vecf(CUBE_BOX.max)};
const DOORWAY_MIN = ${vecf(DOORWAY_BOX.min)};
const DOORWAY_MAX = ${vecf(DOORWAY_BOX.max)};

fn toWorld(c: vec3f) -> vec3f {
  return CUBE_AT + c * CUBE_METRES;
}

fn toCube(w: vec3f) -> vec3f {
  return (w - CUBE_AT) / CUBE_METRES;
}
`,
);
