import {
  cross,
  dot,
  type Pose,
  unit as normalized,
  type Vec3,
} from '@/cube/entities/world';

import { multiply } from './matrix';

/** Vertical field of view, in radians. */
const FOV_Y = (70 * Math.PI) / 180;
/**
 * Clip planes in room sides of a whole person's floor: nearer than a hole's
 * side, and as far as the eye's sight reaches, which builds no room past
 * `FAR`. A smaller eye's shrink with it.
 */
const NEAR = 0.004;
export const FAR = 24;

/** Where the eye looks: yaw from east towards south, pitch up. */
export function forward({ yaw, elevation: pitch }: Pose): Vec3 {
  const flat = Math.cos(pitch);
  return [flat * Math.cos(yaw), Math.sin(pitch), flat * Math.sin(yaw)];
}

/** A right-handed view from `eye` along `ahead`, y up. */
function lookAlong(eye: Vec3, ahead: Vec3): Float32Array {
  const back = normalized([-ahead[0], -ahead[1], -ahead[2]]);
  const right = normalized(cross([0, 1, 0], back));
  const up = cross(back, right);
  return Float32Array.of(
    right[0],
    up[0],
    back[0],
    0,
    right[1],
    up[1],
    back[1],
    0,
    right[2],
    up[2],
    back[2],
    0,
    -dot(right, eye),
    -dot(up, eye),
    -dot(back, eye),
    1,
  );
}

/**
 * A perspective onto WebGPU's clip depth reversed, near at 1 and far at 0: a
 * float depth buffer then keeps its precision where a floor's slab meets the
 * tops of the walls beneath it, rooms away.
 */
function perspective(aspect: number, unit: number): Float32Array {
  const f = 1 / Math.tan(FOV_Y / 2);
  const near = NEAR * unit;
  const far = FAR * unit;
  const range = far - near;
  return Float32Array.of(
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    near / range,
    -1,
    0,
    0,
    (near * far) / range,
    0,
  );
}

/**
 * The view-projection of an eye at `eye` in the frame the mesh was built in,
 * looking where `pose` looks, onto a screen `aspect` wide per unit of height;
 * `unit` is a whole person's room side in that frame times the eye's scale.
 */
export const viewProjection = (
  pose: Pose,
  eye: Vec3,
  aspect: number,
  unit: number,
): Float32Array =>
  multiply(perspective(aspect, unit), lookAlong(eye, forward(pose)));
