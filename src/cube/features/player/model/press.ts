import type { InRoom, Pose, WallMounted } from '@/cube/entities/world';

/**
 * How far from the body's middle a sign or a door can be reached, in room
 * sides: 2.4 m on floor 1.
 */
export const HAND_REACH = 0.48;

/** How far off the gaze, in radians, a thing may be and still be reached: 50°. */
const GAZE = (50 * Math.PI) / 180;

/**
 * Whether a body at `pose` reaches `at`, in the frame of its room: within
 * reach of its foot and looking at it, the elevation aside.
 */
export function canReach(pose: Pose, at: InRoom): boolean {
  const du = at.u - pose.u;
  const dv = at.v - pose.v;
  const distance = Math.hypot(du, dv);
  if (distance > HAND_REACH) return false;
  const facing = Math.cos(pose.yaw) * du + Math.sin(pose.yaw) * dv;
  return facing >= distance * Math.cos(GAZE);
}

/** Whether a body at `pose`, in the room `sign` hangs in, can press it. */
export const canPress = (pose: Pose, { at }: WallMounted): boolean =>
  canReach(pose, at);
