import type { WithEye } from '@/cube/shared/lib/vec';
import { cross, type Pose, type Vec3 } from '@/cube/entities/world';

/** An eye in its room's frame, and its gaze's own axes there. */
export type View = WithEye & { ahead: Vec3; right: Vec3; up: Vec3 };

export function viewOf({ u, v, eyeAbove, yaw, elevation }: Pose): View {
  const flat = Math.cos(elevation);
  const ahead: Vec3 = [
    flat * Math.cos(yaw),
    Math.sin(elevation),
    flat * Math.sin(yaw),
  ];
  const right: Vec3 = [-Math.sin(yaw), 0, Math.cos(yaw)];
  return { eye: [u, eyeAbove, v], ahead, right, up: cross(right, ahead) };
}
