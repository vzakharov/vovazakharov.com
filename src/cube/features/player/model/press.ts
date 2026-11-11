import type { Pose, WallMounted } from '@/cube/entities/world';

import { LEVER_REACH } from './shrink';

/** How far from the body's middle a sign can be pressed: a lever's reach. */
const SIGN_REACH = LEVER_REACH;

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
