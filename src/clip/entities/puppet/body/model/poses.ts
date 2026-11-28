import type { Point } from '@/clip/shared/ink';

import { carried, type Pose, reaching } from './pose';

/** Standing straight, arms hanging: the standard build every pose is drawn for. */
const STAND: Pose = {
  head: [0, -150],
  neck: [0, 0],
  shoulderL: [-54, 22],
  shoulderR: [54, 22],
  elbowL: [-84, 108],
  elbowR: [84, 108],
  wristL: [-76, 198],
  wristR: [76, 198],
  hipL: [-22, 192],
  hipR: [22, 192],
  kneeL: [-28, 302],
  kneeR: [28, 302],
  footL: [-32, 412],
  footR: [32, 412],
};

const hands = (left: Point, right: Point, from: Pose = STAND): Pose =>
  reaching(from, { L: left, R: right });

/** `STAND` with the soles moved to `left` and `right` and the knees folded to suit. */
const planted = (left: Point, right: Point, dip = 0): Pose =>
  carried({ ...STAND, footL: left, footR: right }, { dip });

const WIDE = planted([-86, 404], [86, 404], 6);

/**
 * Named poses for the standard build; `puppet` refits one to whatever build
 * it draws. Blend two with `lerpPose`, move one with `carried` and `reaching`.
 */
export const POSES = {
  stand: STAND,
  /** Feet apart, knees soft: what a player stands in. */
  wide: WIDE,
  /** Both fists in the air. */
  cheer: hands([-116, -128], [116, -128]),
  /** One fist up by the jaw, the other arm down: a singer mid-line. */
  sing: hands([-92, -34], [80, 196]),
  /** Arms thrown wide, palms out: a host greeting the camera. */
  welcome: hands([-178, -6], [178, -6], {
    ...STAND,
    head: [10, -150],
  }),
  /** The right arm out at something off to the right. */
  point: hands([-78, 196], [206, 4], { ...STAND, head: [14, -149] }),
  shrug: hands([-150, 70], [150, 70], {
    ...STAND,
    shoulderL: [-56, 8],
    shoulderR: [56, 8],
  }),
  /** Crouched, the hands over the head. */
  cower: hands(
    [-46, -188],
    [46, -188],
    carried({ ...STAND, head: [-8, -140] }, { dip: 56, lean: -4 }),
  ),
  /** Seated face-on, knees out, hands on them. */
  sit: hands([-72, 236], [72, 236], {
    ...STAND,
    kneeL: [-78, 236],
    kneeR: [78, 236],
    footL: [-70, 340],
    footR: [70, 340],
  }),
} as const satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
