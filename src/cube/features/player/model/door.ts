import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  type Ajar,
  type DoorWall,
  type InRoom,
  isSameWall,
  type Leaf,
  type Pose,
  type Walls,
} from '@/cube/entities/world';

import { rise } from './ease';
import { canReach, HAND_REACH } from './press';

/**
 * Walls a body walks among: `isDoor` says which are doors, none where it is
 * absent, and `ajar` is the door the body holds open.
 */
export type Ways = Walls & {
  isDoor?: (wall: DoorWall) => boolean;
  ajar?: Ajar | null;
};

/**
 * A door the body opened, which is its own and no one else's: its wall, the
 * room its leaf swings into (`toward`, away from the body), the seconds since
 * it was opened, and how many of them had passed when it began to shut — null
 * while the body is still within reach of it.
 */
export type OpenDoor = DoorWall & {
  toward: Leaf['toward'];
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
const doorwayAt = (pose: Pose, wall: DoorWall): InRoom =>
  onWall(pose, wall, DOORWAY_CUT.middle, 0);

/**
 * The closed door a body at `pose` opens with its hand: of its room's four
 * walls, the nearest door it reaches and faces, swinging away from it.
 */
export function doorFaced(
  pose: Pose,
  isDoor: (wall: DoorWall) => boolean,
): OpenDoor | null {
  const { n, x, y } = pose;
  const walls: ReadonlyArray<DoorWall & { toward: Leaf['toward'] }> = [
    { n, x, y, isEast: true, toward: 1 },
    { n, x, y, isEast: false, toward: 1 },
    { n, x: x - 1n, y, isEast: true, toward: -1 },
    { n, x, y: y - 1n, isEast: false, toward: -1 },
  ];
  const reached = walls
    .filter((wall) => canReach(pose, doorwayAt(pose, wall)) && isDoor(wall))
    .map((wall) => {
      const { u, v } = doorwayAt(pose, wall);
      return { wall, distance: Math.hypot(u - pose.u, v - pose.v) };
    })
    .toSorted((a, b) => a.distance - b.distance);
  const nearest = reached[0]?.wall;
  return nearest === undefined
    ? null
    : { ...nearest, openFor: 0, shutAt: null };
}

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

/** Whether a frame pressed the hand, and whether the body stood all through it. */
type Pressed = { use: boolean; standing: boolean };

/**
 * The body's door after a frame of `dt` seconds that left it at `pose`,
 * `standing` or not: the one it had, swung on, unless a press of the hand
 * (`use`) while standing opens the closed door it faces among `ways`.
 */
export function doorAfter(
  door: OpenDoor | null,
  pose: Pose,
  { use, standing }: Pressed,
  dt: number,
  { isDoor }: Ways,
): OpenDoor | null {
  const kept = door === null ? null : swung(door, pose, dt);
  if (!use || !standing || isDoor === undefined) return kept;
  const faced = doorFaced(pose, isDoor);
  const holding = kept !== null && kept.shutAt === null;
  return faced === null || (holding && isSameWall(kept, faced)) ? kept : faced;
}
