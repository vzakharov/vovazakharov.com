import {
  plus,
  type Setting,
  times,
  UP,
  type Vec3,
  WALL_HALF,
} from '@/cube/entities/world';

/** A room's sides by their place in the world's step order. */
export const SIDES = [0, 1, 2, 3] as const;
export type Side = (typeof SIDES)[number];

/**
 * A side of a room as a frame to build on: `base` is the end of the room's
 * edge that `along` runs from, a room side long, and `into` points into the
 * room, so that `along × up = into`.
 */
export type SideFrame = { base: Vec3; along: Vec3; into: Vec3 };

export const SIDE_FRAMES: Readonly<Record<Side, SideFrame>> = {
  0: { base: [1, 0, 0], along: [0, 0, 1], into: [-1, 0, 0] },
  1: { base: [1, 0, 1], along: [-1, 0, 0], into: [0, 0, -1] },
  2: { base: [0, 0, 1], along: [0, 0, -1], into: [1, 0, 0] },
  3: { base: [0, 0, 0], along: [1, 0, 0], into: [0, 0, 1] },
};

/** The side across the room from `side`. */
export const facing = (side: Side): Side => SIDES[(side + 2) % 4] ?? side;

/** The side after `side`, whose `along` starts at the corner `side`'s ends at. */
export const next = (side: Side): Side => SIDES[(side + 1) % 4] ?? side;

/** How far in from the room's edge `side` begins: a closed one at its wall's face. */
export const inset = ({ closed }: Setting, side: Side): number =>
  closed[side] ? WALL_HALF : 0;

/** The point `along` the room's edge on `side`, `up` and `into` the room. */
export const spot = (
  side: Side,
  along: number,
  up: number,
  into: number,
): Vec3 => {
  const frame = SIDE_FRAMES[side];
  return plus(
    plus(plus(frame.base, times(frame.along, along)), times(UP, up)),
    times(frame.into, into),
  );
};

/**
 * `spot` counted from where `side` begins: `out` from the wall's face on a
 * closed side, from the room's edge on an open one.
 */
export const onSide = (
  setting: Setting,
  side: Side,
  along: number,
  up: number,
  out: number,
): Vec3 => spot(side, along, up, inset(setting, side) + out);

export const shutSides = ({ closed }: Setting): Side[] =>
  SIDES.filter((side) => closed[side]);

export const openSides = ({ closed }: Setting): Side[] =>
  SIDES.filter((side) => !closed[side]);

/** The side of `sides` that `chance` of `[0, 1)` falls on; null where there is none. */
export const sideAt = (sides: readonly Side[], chance: number): Side | null =>
  sides[Math.floor(chance * sides.length)] ?? null;

/** The sides that close a corner with the side after them. */
export const shutCorners = ({ closed }: Setting): Side[] =>
  SIDES.filter((side) => closed[side] && closed[next(side)]);

/**
 * The strip of floor things go across the room on: clear of the hole in every
 * quarter, whichever way they go.
 */
const LANE = { from: 0.42, wide: 0.16 } as const;

/** A place across the lane, `chance` of `[0, 1)` of the way over it. */
export const inLane = (chance: number): number =>
  LANE.from + LANE.wide * chance;
