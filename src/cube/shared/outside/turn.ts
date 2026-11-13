import { ROOM_METRES } from '../lib/room-shape';
import type { Vec3 } from '../lib/vec';
import { f32, wgsl } from '../lib/wgsl';

/** A count of quarter turns. */
export type Quarters = 0 | 1 | 2 | 3;

export const QUARTER_TURNS: readonly Quarters[] = [0, 1, 2, 3];

/**
 * How the cube's interior sits in its shell: quarter turns counter-clockwise,
 * seen from above, about the cube's upright axis. Every floor turns as one,
 * so their hatches stay over one another. The shell — its faces, its doorway,
 * its ladder — is the world's and does not turn; the room frame every floor
 * is built in turns under it, and the doorway opens into whichever of floor
 * 1's walls is behind it. At 1 the room's east is the world's north, and the
 * doorway in the shell's east face opens in the room's south wall.
 *
 * It is the turn at which the sun's beam through the doorway misses the
 * quarter of floor 1 its hole is in, which `interior-turn.test.ts` holds
 * against the planted world.
 */
export const INTERIOR_TURN: Quarters = 1;

/** `[x, z]` about the origin turned `turn` quarters clockwise from above. */
function swung(x: number, z: number, turn: number): [number, number] {
  switch (((turn % 4) + 4) % 4) {
    case 1: {
      return [-z, x];
    }
    case 2: {
      return [-x, -z];
    }
    case 3: {
      return [z, -x];
    }
    default: {
      return [x, z];
    }
  }
}

/** A way turned `turn` quarters clockwise from above about the upright. */
const quarterTurned = ([x, y, z]: Vec3, turn: number): Vec3 => {
  const [east, south] = swung(x, z, turn);
  return [east, y, south];
};

/**
 * A way in the room frame as the shell frame has it: x east, y up, z south in
 * both, the shell's being the world's.
 */
export const turnedToShell = (
  way: Vec3,
  turn: Quarters = INTERIOR_TURN,
): Vec3 => quarterTurned(way, -turn);

/** A way in the shell frame as the room frame has it. */
export const turnedToRoom = (way: Vec3, turn: Quarters = INTERIOR_TURN): Vec3 =>
  quarterTurned(way, turn);

/** `point` turned by `turning` about the upright through the middle of a square `side` across. */
const about = (
  [x, y, z]: Vec3,
  side: number,
  turning: (way: Vec3) => Vec3,
): Vec3 => {
  const half = side / 2;
  const [east, , south] = turning([x - half, 0, z - half]);
  return [east + half, y, south + half];
};

/**
 * A point of the room frame, from the north-west corner of floor 1's room as
 * the room has it, in the shell frame, from the cube's north-west corner as
 * the world has it; `side` is the room's side in the point's units.
 */
export const toShell = (
  point: Vec3,
  side = 1,
  turn: Quarters = INTERIOR_TURN,
): Vec3 => about(point, side, (way) => turnedToShell(way, turn));

/** A point of the shell frame in the room frame. */
export const toRoom = (
  point: Vec3,
  side = 1,
  turn: Quarters = INTERIOR_TURN,
): Vec3 => about(point, side, (way) => turnedToRoom(way, turn));

/** A yaw of the room frame, from east towards south, as the shell frame has it. */
export const yawToShell = (yaw: number, turn: Quarters = INTERIOR_TURN) =>
  yaw - (turn * Math.PI) / 2;

/** A yaw of the shell frame as the room frame has it. */
export const yawToRoom = (yaw: number, turn: Quarters = INTERIOR_TURN) =>
  yaw + (turn * Math.PI) / 2;

/** The two columns of the turn a way takes from one frame to the other, as WGSL. */
function columns(to: (way: Vec3) => Vec3): string {
  const [ex, , ez] = to([1, 0, 0]);
  const [sx, , sz] = to([0, 0, 1]);
  return `mat2x2f(${f32(ex)}, ${f32(ez)}, ${f32(sx)}, ${f32(sz)})`;
}

/**
 * The turn in WGSL, for a room `ROOM_METRES` across: `turnedToShell` and
 * `turnedToRoom` of a way, `toShell` and `toRoom` of a point in metres.
 */
export const SHELL_TURN = wgsl(
  'outside/turn',
  /* wgsl */ `
const ROOM_TO_SHELL = ${columns((way) => turnedToShell(way))};
const SHELL_TO_ROOM = ${columns((way) => turnedToRoom(way))};
const TURN_ABOUT = vec2f(${f32(ROOM_METRES / 2)});

fn turnedToShell(way: vec3f) -> vec3f {
  let flat = ROOM_TO_SHELL * way.xz;
  return vec3f(flat.x, way.y, flat.y);
}

fn turnedToRoom(way: vec3f) -> vec3f {
  let flat = SHELL_TO_ROOM * way.xz;
  return vec3f(flat.x, way.y, flat.y);
}

fn toShell(p: vec3f) -> vec3f {
  let flat = ROOM_TO_SHELL * (p.xz - TURN_ABOUT) + TURN_ABOUT;
  return vec3f(flat.x, p.y, flat.y);
}

fn toRoom(p: vec3f) -> vec3f {
  let flat = SHELL_TO_ROOM * (p.xz - TURN_ABOUT) + TURN_ABOUT;
  return vec3f(flat.x, p.y, flat.y);
}
`,
);
