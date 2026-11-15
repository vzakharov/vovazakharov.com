import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  type Ajar,
  carried,
  type Doors,
  type DoorWall,
  type Facing,
  type InRoom,
  isSameWall,
  type Pose,
  type Posed,
  type Room,
  roomBeyond,
  type Walls,
  wallsAround,
} from '@/cube/entities/world';

import { rise } from './ease';
import { canReach, HAND_REACH } from './press';

/**
 * Walls a body walks among: `isDoor` says which are doors, none where it is
 * absent, `ajar` is the door the body holds open, and `beyond` says where a
 * door gone through as `door` faces leads this instant, null for one that
 * leads to the room behind it, as every door does where it is absent.
 */
export type Ways = Walls &
  Partial<Doors> & {
    ajar?: Ajar | null;
    beyond?: (door: Facing) => Facing | null;
  };

/**
 * A door the body opened, which is its own and no one else's: its wall, the
 * room its leaf swings into (`toward`, away from the body), the seconds since
 * it was opened, and how many of them had passed when it began to shut — null
 * while the body is still within reach of it.
 */
export type OpenDoor = Facing & {
  openFor: number;
  shutAt: number | null;
};

/** Seconds a leaf takes to swing open, and to swing shut. */
export const LEAF_SWING = 0.9;

/** How far a leaf swings open, in radians. */
export const OPEN_ANGLE = Math.PI / 2;

/** The angle `door`'s leaf has turned to: up to `OPEN_ANGLE`, then back to 0 once it shuts. */
export function leafAngle({ openFor, shutAt }: OpenDoor): number {
  const opened = (t: number) => OPEN_ANGLE * rise(t, 0, LEAF_SWING);
  if (shutAt === null) return opened(openFor);
  return opened(shutAt) * (1 - rise(openFor - shutAt, 0, LEAF_SWING));
}

const leafOf = (door: OpenDoor): Ajar => {
  const { n, x, y, isEast, toward } = door;
  return { n, x, y, isEast, toward, angle: leafAngle(door) };
};

/** The door a body holds open, which it walks through: null once it begins to shut. */
export const ajarOf = (door: OpenDoor | null): Ajar | null =>
  door?.shutAt === null ? leafOf(door) : null;

/** The door an eye sees open, and its leaf: until it has swung shut. */
export const swingingOf = (door: OpenDoor | null): Ajar | null =>
  door === null ? null : leafOf(door);

/**
 * The point `along` `wall` from its north or west end and `across` it east
 * or south, in the frame of `pose`'s room.
 */
export function onWall(
  { x, y }: Pose,
  wall: DoorWall,
  along: number,
  across: number,
): InRoom {
  const [u, v] = wall.isEast ? [1 + across, along] : [along, 1 + across];
  return { u: u + Number(wall.x - x), v: v + Number(wall.y - y) };
}

/** The middle of `wall`'s doorway on its line, in the frame of `pose`'s room. */
export const doorwayAt = (pose: Pose, wall: DoorWall): InRoom =>
  onWall(pose, wall, DOORWAY_CUT.middle, 0);

/**
 * The closed doors a body at `pose` could open with its hand: of its room's
 * four walls, every door it reaches and faces, each swinging away from it.
 */
export const doorsFaced = (pose: Pose, isDoor: Doors['isDoor']): OpenDoor[] =>
  wallsAround(pose)
    .filter((wall) => canReach(pose, doorwayAt(pose, wall)) && isDoor(wall))
    .map((wall) => ({ ...wall, openFor: 0, shutAt: null }));

/**
 * `door` `dt` seconds on, the body at `pose`: it begins to shut once the body
 * is out of its reach on either side, and is gone once shut, or as soon as
 * the body is on another floor.
 */
export function swung(door: OpenDoor, pose: Pose, dt: number): OpenDoor | null {
  if (pose.n !== door.n) return null;
  const openFor = door.openFor + dt;
  if (door.shutAt !== null) {
    return openFor - door.shutAt >= LEAF_SWING ? null : { ...door, openFor };
  }
  const { u, v } = doorwayAt(pose, door);
  const away = Math.hypot(u - pose.u, v - pose.v) > HAND_REACH;
  return { ...door, openFor, shutAt: away ? openFor : null };
}

/**
 * The body's door after a frame of `dt` seconds that left it at `pose`: the
 * one it had, swung on, unless the frame's press `opened` another, or the
 * same one again once it had begun to shut.
 */
export function doorAfter(
  door: OpenDoor | null,
  pose: Pose,
  opened: OpenDoor | null,
  dt: number,
): OpenDoor | null {
  const kept = door === null ? null : swung(door, pose, dt);
  const holding = kept !== null && kept.shutAt === null;
  return opened === null || (holding && isSameWall(kept, opened))
    ? kept
    : opened;
}

const isIn = (pose: Pose, { n, x, y }: Room): boolean =>
  pose.n === n && pose.x === x && pose.y === y;

/**
 * A body that stepped from `from` to `to` through `door`, a portal by
 * `beyond`, as it stands through the far portal instead, and that portal's
 * door, as open behind it as `door` was and swung the same way: null for any
 * other step.
 */
export function carriedThrough(
  from: Pose,
  to: Pose,
  door: OpenDoor | null,
  beyond: Ways['beyond'],
): { pose: Pose; door: OpenDoor } | null {
  if (door === null || beyond === undefined) return null;
  const back: Facing = { ...door, toward: door.toward === 1 ? -1 : 1 };
  const gone = [door, back].find(
    (way) =>
      isIn(to, roomBeyond(way)) &&
      isIn(from, roomBeyond({ ...way, toward: way.toward === 1 ? -1 : 1 })),
  );
  const far = gone === undefined ? null : beyond(gone);
  if (gone === undefined || far === null) return null;
  const { n, x, y, isEast } = far;
  return { pose: carried(to, gone, far), door: { ...door, n, x, y, isEast } };
}

/** A body at its pose, and the door it opened, until that door has shut behind it. */
export type HoldingDoor = Posed & { door: OpenDoor | null };

/** Whether the frame that left `from` and made a body with `door` open at `pose` carried it through a portal. */
export const isCarried = (from: Pose, { pose, door }: HoldingDoor): boolean =>
  door !== null && pose.n !== from.n;
