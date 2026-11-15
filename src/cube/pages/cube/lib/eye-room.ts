import {
  descend,
  parent,
  type Pose,
  type Room,
  roomKey,
} from '@/cube/entities/world';

/** An eye in the middle of `room`, looking level and east: a frame to build a mesh in. */
export const poseIn = (room: Room): Pose => ({
  ...room,
  u: 0.5,
  v: 0.5,
  yaw: 0,
  elevation: 0,
  scale: 1,
  eyeAbove: 0,
});

/**
 * The room an outside eye's frame is built in: floor 1's, whose sides are the
 * cube frame's units.
 */
export const FIRST_ROOM: Pose = poseIn({ n: 1, x: 0n, y: 0n });

/**
 * `pose` on the floor whose room holds its eye: the floor below once a
 * falling eye has passed under its slab, so the mesh is that room's.
 */
export const inEyeRoom = (pose: Pose): Pose =>
  pose.eyeAbove < 0 ? descend(pose) : pose;

/**
 * Whether a mesh built in the frame of `built` can stand in for `eye`'s own
 * until that is built: on its floor, or the room over or under it, as a fall
 * leaves it. A body a door carried to another floor is neither.
 */
export function standsIn(built: Room, eye: Room): boolean {
  if (built.n === eye.n) return true;
  const [over, under] = built.n < eye.n ? [built, eye] : [eye, built];
  return under.n - over.n === 1 && roomKey(parent(under)) === roomKey(over);
}
