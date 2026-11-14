import type { Seen } from '@/cube/shared/lib/vec';
import { CUBE_METRES, yawToRoom } from '@/cube/shared/outside';
import { toCube, toWorld } from '@/cube/entities/island';
import {
  cross,
  dot,
  type Gazing,
  type Outside,
  unit as normalized,
  type Vec3,
} from '@/cube/entities/world';
import { FAR_METRES } from '@/cube/widgets/outdoors';

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
export function forward({ yaw, elevation: pitch }: Gazing): Vec3 {
  const flat = Math.cos(pitch);
  return [flat * Math.cos(yaw), Math.sin(pitch), flat * Math.sin(yaw)];
}

/** `a` scaled by `s` plus `b` scaled by `t`. */
const blend = (a: Vec3, s: number, b: Vec3, t: number): Vec3 => [
  a[0] * s + b[0] * t,
  a[1] * s + b[1] * t,
  a[2] * s + b[2] * t,
];

/**
 * A right-handed view from `eye` along `ahead`, y up, the head then tipped
 * `roll` radians clockwise about its gaze.
 */
function lookAlong(eye: Vec3, ahead: Vec3, roll: number): Float32Array {
  const back = normalized([-ahead[0], -ahead[1], -ahead[2]]);
  const level = normalized(cross([0, 1, 0], back));
  const upright = cross(back, level);
  const right = blend(level, Math.cos(roll), upright, -Math.sin(roll));
  const up = blend(upright, Math.cos(roll), level, Math.sin(roll));
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
function perspective(aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(FOV_Y / 2);
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
 * looking where `gaze` looks, onto a screen `aspect` wide per unit of height;
 * `unit` is a whole person's room side in that frame times the eye's scale.
 * `roll` is radians the head is tipped clockwise about its gaze, and `far`
 * the far plane in the frame's units, where sight alone is too near.
 */
export const viewProjection = (
  gaze: Gazing,
  eye: Vec3,
  aspect: number,
  unit: number,
  { roll = 0, far = FAR * unit } = {},
): Float32Array =>
  multiply(
    perspective(aspect, NEAR * unit, far),
    lookAlong(eye, forward(gaze), roll),
  );

/** The far plane of a frame that shows the outside, in the cube frame's units. */
export const OUTSIDE_FAR = FAR_METRES / CUBE_METRES;

/** The world frame to the cube frame, as a matrix: `toCube` of the axes. */
const WORLD_TO_CUBE = ((): Float32Array => {
  const origin = toCube([0, 0, 0]);
  const axis = (along: Vec3): number[] =>
    toCube(along).map((value, i) => value - (origin[i] ?? 0));
  return Float32Array.of(
    ...axis([1, 0, 0]),
    0,
    ...axis([0, 1, 0]),
    0,
    ...axis([0, 0, 1]),
    0,
    ...origin,
    1,
  );
})();

/**
 * Where an eye outside the cube looks, in the cube frame: its yaw is the
 * world's, and the interior is turned in its shell.
 */
export const gazeInCube = ({ yaw, elevation }: Outside): Gazing => ({
  yaw: yawToRoom(yaw),
  elevation,
});

/**
 * `seen`, a view in the cube frame — floor 1's room sides — as the same view
 * of the world frame.
 */
export const seenInWorld = ({ viewProjection: matrix, eye }: Seen): Seen => ({
  viewProjection: multiply(matrix, WORLD_TO_CUBE),
  eye: toWorld(eye),
});

/**
 * What an eye outside the cube sees, in the world frame and reckoned in it
 * alone, so nothing outdoors depends on how the interior sits in its shell:
 * the same view `gazeInCube` and `toCube` give of the cube frame.
 */
export const seenOutside = (
  { eye, yaw, elevation, roll }: Outside,
  aspect: number,
): Seen => ({
  viewProjection: viewProjection({ yaw, elevation }, eye, aspect, CUBE_METRES, {
    roll,
    far: FAR_METRES,
  }),
  eye,
});
