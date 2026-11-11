import {
  cross,
  dot,
  plus,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

/**
 * A hand's shape, in centimetres of a whole body and in the hand's own axes:
 * along the fingers from the wrist, across the palm towards the thumb, and
 * through the palm, out of it.
 */

/**
 * One finger or the thumb: where it leaves the palm, the way it points there
 * (`aim`) and the axis its joints turn about (`hinge`), both unit and square
 * to each other; its bones' lengths from the palm out; its half-width at the
 * root and at the tip; and how far each joint is curled at rest, in radians.
 */
export type Digit = {
  root: Vec3;
  aim: Vec3;
  hinge: Vec3;
  bones: readonly number[];
  girth: readonly [root: number, tip: number];
  curl: readonly number[];
};

/** A cross-section of the palm or the sleeve: where, and its half-sizes. */
export type Slice = readonly [
  along: number,
  across: number,
  wide: number,
  thick: number,
];

/** The share of a finger's length each of its bones takes, from the palm out. */
const BONES = [0.45, 0.3, 0.25];

/**
 * A finger leaving the knuckles at `along` and `across`, fanned `fan` degrees
 * towards the thumb in the palm's plane, `long` from knuckle to tip.
 */
function finger(
  [along, across]: readonly [number, number],
  fan: number,
  long: number,
  girth: Digit['girth'],
  curl: Digit['curl'],
): Digit {
  const angle = (fan * Math.PI) / 180;
  return {
    root: [along, across, 0],
    aim: [Math.cos(angle), Math.sin(angle), 0],
    hinge: [-Math.sin(angle), Math.cos(angle), 0],
    bones: BONES.map((share) => share * long),
    girth,
    curl,
  };
}

/** The thumb leaves the heel of the palm sideways and curls across it. */
const THUMB_AIM = unit([0.68, 0.7, 0.2]);
const THUMB_CURLS_TO: Vec3 = [0.6, -0.5, 0.62];
const THUMB: Digit = {
  root: [2.6, 2.7, 0.3],
  aim: THUMB_AIM,
  hinge: unit(
    cross(
      plus(THUMB_CURLS_TO, times(THUMB_AIM, -dot(THUMB_CURLS_TO, THUMB_AIM))),
      THUMB_AIM,
    ),
  ),
  bones: [4.2, 3.4, 3],
  girth: [1.4, 0.85],
  curl: [0, 0.22, 0.28],
};

/** The fingers from the thumb's side, index to little, then the thumb. */
export const DIGITS: readonly Digit[] = [
  finger([9.7, 3.05], 7, 7.4, [0.92, 0.72], [0.14, 0.3, 0.2]),
  finger([10, 1], 2, 8.2, [0.95, 0.74], [0.17, 0.33, 0.22]),
  finger([9.7, -1.05], -4, 7.6, [0.9, 0.7], [0.2, 0.36, 0.24]),
  finger([9, -2.95], -11, 5.9, [0.78, 0.62], [0.23, 0.4, 0.26]),
  THUMB,
];

/** The palm from inside the sleeve to the knuckles, where it is drawn shut. */
export const PALM: readonly Slice[] = [
  [-2.5, 0, 2.7, 1.5],
  [-0.5, 0, 2.9, 1.45],
  [1.5, 0.1, 3.7, 1.6],
  [4.5, 0.1, 4.2, 1.5],
  [7.5, 0, 4.3, 1.25],
  [9.6, 0, 4.2, 0.95],
  [10.3, 0, 3.9, 0.5],
  [10.5, 0, 3.6, 0.03],
];

/** The sleeve down the forearm to its cuff, which closes on the wrist. */
export const SLEEVE: readonly Slice[] = [
  [-28, 0, 4.4, 3.6],
  [-12, 0, 3.9, 3],
  [-3.4, 0, 3.6, 2.5],
  [-3.2, 0, 3.85, 2.75],
  [-1.2, 0, 3.85, 2.75],
  [-0.9, 0, 3.4, 2.3],
  [-0.8, 0, 2.8, 1.5],
];

/**
 * A nail: the stretch of its digit's last bone it covers and how proud of
 * the skin it stands, the arc of the way round it takes — the back of the
 * digit — and its paint, paler than the skin around it.
 */
export const NAIL = {
  along: [0.42, 0.9, 1.06],
  arc: [0.62, 0.88],
  paint: 0xe9_cf_c6,
} as const;
