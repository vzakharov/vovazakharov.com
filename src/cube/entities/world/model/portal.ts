import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import type { Facing } from './door';
import { portalAt, portalTarget } from './portal.stub';
import type { InRoom, Pose } from './pose';
import type { Room } from './room';
import type { DoorWall } from './wall-frame';

/** Whether `wall` holds a portal: a door that leads to another floor. */
export const isPortal = (wall: DoorWall): boolean => portalAt(wall) !== null;

/**
 * Where the portal door `door` leads at `epochMs`, null where it is no
 * portal: the far portal's wall, come out of the way it was gone into, east
 * or south for east or south.
 */
export function farSideOf(door: Facing, epochMs: number): Facing | null {
  const portal = portalAt(door);
  if (portal === null) return null;
  const { toward } = door;
  const { n, x, y, isEast } = portalTarget(portal, epochMs);
  return { n, x, y, isEast, toward };
}

/**
 * `wall` as an eye in `eye`, a room of its floor, looks through it: toward
 * the side of it the eye is not on.
 */
export const wayThrough = (wall: DoorWall, eye: Room): Facing => {
  const { n, x, y, isEast } = wall;
  const before = isEast ? eye.x <= x : eye.y <= y;
  return { n, x, y, isEast, toward: before ? 1 : -1 };
};

/** The room `door` is gone through into. */
export const roomBeyond = ({ n, x, y, isEast, toward }: Facing): Room => {
  if (toward < 0) return { n, x, y };
  return isEast ? { n, x: x + 1n, y } : { n, x, y: y + 1n };
};

/** A direction or an offset on a floor, east and south. */
type Flat = readonly [number, number];

/** The unit step through `door`. */
const headingOf = ({ isEast, toward }: Facing): Flat =>
  isEast ? [toward, 0] : [0, toward];

/** `[east, south]` turned a quarter, east to south. */
const quarterOn = ([east, south]: Flat): Flat => [-south, east];

/** The middle of `wall`'s doorway on its line, in the frame of `frame`, a room of its floor. */
function doorwayIn(frame: Room, { x, y, isEast }: DoorWall): Flat {
  const { middle } = DOORWAY_CUT;
  const [u, v] = isEast ? [1, middle] : [middle, 1];
  return [u + Number(x - frame.x), v + Number(y - frame.y)];
}

/**
 * How what lies through a portal sits before an eye: the middle of the far
 * doorway, `from`, in the frame of the room beyond it; the middle of the near
 * one, `to`, in the eye's; and `turn`, the radians east to south that bring
 * the far frame round to the near one.
 */
export type Beyond = { from: InRoom; to: InRoom; turn: number };

/** The radians, east to south, that turn `from` to `to`: within half a turn. */
const turnBetween = (from: Flat, to: Flat): number =>
  Math.atan2(
    from[0] * to[1] - from[1] * to[0],
    from[0] * to[0] + from[1] * to[1],
  );

/**
 * Where the rooms through `near`, which leads to `far`, sit for an eye in
 * `eye`, a room of `near`'s floor: the far doorway laid on the near one, the
 * way out of the one along the way into the other.
 */
export function beyondOf(eye: Room, near: Facing, far: Facing): Beyond {
  const [fromU, fromV] = doorwayIn(roomBeyond(far), far);
  const [toU, toV] = doorwayIn(eye, near);
  return {
    from: { u: fromU, v: fromV },
    to: { u: toU, v: toV },
    turn: turnBetween(headingOf(far), headingOf(near)),
  };
}

/**
 * `pose`, a body just through `near`, as it stands through `far` instead: as
 * far past the far doorway and as far off its middle, its gaze turned as the
 * way through is. Its height, size and elevation are its own.
 */
export function carried(pose: Pose, near: Facing, far: Facing): Pose {
  const way = headingOf(near);
  const side = quarterOn(way);
  const [nearU, nearV] = doorwayIn(pose, near);
  const off: Flat = [pose.u - nearU, pose.v - nearV];
  const past = off[0] * way[0] + off[1] * way[1];
  const aside = off[0] * side[0] + off[1] * side[1];
  const room = roomBeyond(far);
  const farWay = headingOf(far);
  const farSide = quarterOn(farWay);
  const [farU, farV] = doorwayIn(room, far);
  return {
    ...pose,
    ...room,
    u: farU + past * farWay[0] + aside * farSide[0],
    v: farV + past * farWay[1] + aside * farSide[1],
    yaw: pose.yaw + turnBetween(way, farWay),
  };
}

/**
 * Whether `room`, of `far`'s floor, lies on the side of `far`'s wall an eye
 * looking through it sees: no line through a doorway reaches a room on the
 * near side of its wall.
 */
export function isBeyond(far: Facing, room: Room): boolean {
  const { x, y } = roomBeyond(far);
  const [east, south] = headingOf(far);
  return Number(room.x - x) * east + Number(room.y - y) * south >= 0;
}

/** How far through `far`'s wall the point `(u, v)` of the room beyond it lies, in room sides. */
export function pastDoorway(far: Facing, u: number, v: number): number {
  const [farU, farV] = doorwayIn(roomBeyond(far), far);
  const [east, south] = headingOf(far);
  return (u - farU) * east + (v - farV) * south;
}
