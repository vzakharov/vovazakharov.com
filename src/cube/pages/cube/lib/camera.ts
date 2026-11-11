import type { Pose, Vec3 } from '@/cube/entities/world';

/** Vertical field of view, in radians. */
const FOV_Y = (70 * Math.PI) / 180;
/** Clip planes in the eye floor's room sides: under a hole's side, past the fog. */
const NEAR = 0.004;
const FAR = 24;

/** Where the eye looks: yaw from east towards south, pitch up. */
export function forward({ yaw, pitch }: Pose): Vec3 {
  const flat = Math.cos(pitch);
  return [flat * Math.cos(yaw), Math.sin(pitch), flat * Math.sin(yaw)];
}

const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

const unit = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v);
  return [v[0] / length, v[1] / length, v[2] / length];
};

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += (a[k * 4 + row] ?? 0) * (b[column * 4 + k] ?? 0);
      }
      out[column * 4 + row] = sum;
    }
  }
  return out;
}

/** A right-handed view from `eye` along `ahead`, y up. */
function lookAlong(eye: Vec3, ahead: Vec3): Float32Array {
  const back = unit([-ahead[0], -ahead[1], -ahead[2]]);
  const right = unit(cross([0, 1, 0], back));
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

/** A perspective onto WebGPU's clip depth of `[0, 1]`. */
function perspective(aspect: number): Float32Array {
  const f = 1 / Math.tan(FOV_Y / 2);
  const range = NEAR - FAR;
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
    FAR / range,
    -1,
    0,
    0,
    (NEAR * FAR) / range,
    0,
  );
}

/**
 * The view-projection of an eye at `eye` in the frame the mesh was built in,
 * looking where `pose` looks, onto a screen `aspect` wide per unit of height.
 */
export const viewProjection = (
  pose: Pose,
  eye: Vec3,
  aspect: number,
): Float32Array => multiply(perspective(aspect), lookAlong(eye, forward(pose)));
