import type { Pose, WallMounted } from '@/cube/entities/world';

/**
 * How far from the body's middle a sign can be pressed, in room sides: 2.4 m
 * on floor 1.
 */
const SIGN_REACH = 0.48;

/** How far off the gaze, in radians, a sign may be and still be pressed: 50°. */
const SIGN_GAZE = (50 * Math.PI) / 180;

/**
 * Whether a body at `pose`, in the room `sign` hangs in, can press it: within
 * reach of its foot and looking at it, the elevation aside.
 */
export function canPress(pose: Pose, { at }: WallMounted): boolean {
  const du = at.u - pose.u;
  const dv = at.v - pose.v;
  const distance = Math.hypot(du, dv);
  if (distance > SIGN_REACH) return false;
  const facing = Math.cos(pose.yaw) * du + Math.sin(pose.yaw) * dv;
  return facing >= distance * Math.cos(SIGN_GAZE);
}
