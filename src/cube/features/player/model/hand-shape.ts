import {
  cross,
  dot,
  plus,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

// The hand's shape down to `NAIL` is in centimetres of a whole body, in the
// hand's own axes — along the fingers, across the palm towards the thumb,
// through it out of the palm — from the wrist.

/**
 * One finger or the thumb: where it leaves the palm, the way it points there
 * (`aim`) and the axis its joints turn about (`hinge`), both unit and square
 * to each other; its bones' lengths from the palm out; its half-width at the
 * root and at the tip.
 */
export type Digit = {
  root: Vec3;
  aim: Vec3;
  hinge: Vec3;
  bones: readonly number[];
  girth: readonly [root: number, tip: number];
};

/** How far each of a digit's joints is curled towards the palm, in radians. */
export type Curl = readonly number[];

/** A hand's five curls: index to little, then the thumb. */
type Curls = readonly [Curl, Curl, Curl, Curl, Curl];

/**
 * How a hand is held: its digits' curls, how far the thumb is swung round
 * from beside the palm to across it, in radians, and how many centimetres of
 * forearm its sleeve covers back from the wrist.
 */
export type HandPose = { curls: Curls; oppose: number; sleeve: number };

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
): Digit {
  const angle = (fan * Math.PI) / 180;
  return {
    root: [along, across, 0],
    aim: [Math.cos(angle), Math.sin(angle), 0],
    hinge: [-Math.sin(angle), Math.cos(angle), 0],
    bones: BONES.map((share) => share * long),
    girth,
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
};

/** The fingers from the thumb's side, index to little, then the thumb. */
export const HAND_DIGITS: readonly Digit[] = [
  finger([9.7, 3.05], 7, 7.4, [0.92, 0.72]),
  finger([10, 1], 2, 8.2, [0.95, 0.74]),
  finger([9.7, -1.05], -4, 7.6, [0.9, 0.7]),
  finger([9, -2.95], -11, 5.9, [0.78, 0.62]),
  THUMB,
];

/** Centimetres of forearm a sleeve covers when no more of the arm shows. */
const FOREARM = 28;

/** A hand held loose, as one looked at is. */
export const LOOSE: HandPose = {
  curls: [
    [0.14, 0.3, 0.2],
    [0.17, 0.33, 0.22],
    [0.2, 0.36, 0.24],
    [0.23, 0.4, 0.26],
    [0, 0.22, 0.28],
  ],
  oppose: 0,
  sleeve: FOREARM,
};

/** Thumb and forefinger closed on a pill, the other fingers folded out of the way. */
export const PINCH: HandPose = {
  curls: [
    [0.75, 0.86, 0.44],
    [0.95, 1.15, 0.6],
    [1.1, 1.25, 0.65],
    [1.2, 1.3, 0.7],
    [0.48, 0.5, 0.33],
  ],
  oppose: 0.6,
  sleeve: FOREARM,
};

/** A hand closed round a rung: the fingers over it, the thumb under. */
export const RUNG_GRIP: HandPose = {
  curls: [
    [1.15, 1.35, 0.5],
    [1.15, 1.4, 0.55],
    [1.15, 1.4, 0.55],
    [0.8, 1, 0.7],
    [0, 0, 1.3],
  ],
  oppose: -0.9,
  sleeve: FOREARM,
};

/**
 * Where a gripped rung's middle passes the hand, in its own axes: in the
 * crook of the fingers, the rung running across the palm.
 */
export const RUNG_AT: Vec3 = [8.6, 0, 2.5];

/** The pose `share` of the way from `from` to `to`. */
export function between(from: HandPose, to: HandPose, share: number): HandPose {
  const mixed = (a: number, b: number): number => a * (1 - share) + b * share;
  const curl = (index: 0 | 1 | 2 | 3 | 4): Curl =>
    from.curls[index].map((bend, joint) =>
      mixed(bend, to.curls[index][joint] ?? bend),
    );
  return {
    curls: [curl(0), curl(1), curl(2), curl(3), curl(4)],
    oppose: mixed(from.oppose, to.oppose),
    sleeve: mixed(from.sleeve, to.sleeve),
  };
}

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

/** The sleeve from `long` up the arm to its cuff, which closes on the wrist. */
export const sleeveOf = (long: number): readonly Slice[] => [
  [-long, 0, 4.4, 3.6],
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
