import { pick } from '@/kernel/shared/lib/collections';

import {
  cross,
  dot,
  loft,
  plus,
  type Quad,
  type Ring,
  type Room,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

import { glimpse } from './look';
import type { Player } from './play';

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
type Digit = {
  root: Vec3;
  aim: Vec3;
  hinge: Vec3;
  bones: readonly number[];
  girth: readonly [root: number, tip: number];
  curl: readonly number[];
};

/** A cross-section of the palm or the sleeve: where, and its half-sizes. */
type Slice = readonly [
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
const HAND_DIGITS: readonly Digit[] = [
  finger([9.7, 3.05], 7, 7.4, [0.92, 0.72], [0.14, 0.3, 0.2]),
  finger([10, 1], 2, 8.2, [0.95, 0.74], [0.17, 0.33, 0.22]),
  finger([9.7, -1.05], -4, 7.6, [0.9, 0.7], [0.2, 0.36, 0.24]),
  finger([9, -2.95], -11, 5.9, [0.78, 0.62], [0.23, 0.4, 0.26]),
  THUMB,
];

/** The palm from inside the sleeve to the knuckles, where it is drawn shut. */
const PALM: readonly Slice[] = [
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
const SLEEVE: readonly Slice[] = [
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
const NAIL = {
  along: [0.42, 0.9, 1.06],
  arc: [0.62, 0.88],
  paint: 0xe9_cf_c6,
} as const;

/** `a·x + b·y + c·z`. */
const mix = ([x, y, z]: readonly [Vec3, Vec3, Vec3], [a, b, c]: Vec3): Vec3 =>
  plus(plus(times(x, a), times(y, b)), times(z, c));

/**
 * A hand's own axes, unit and square to each other: `along` the fingers,
 * `across` the palm towards the thumb, `through` it out of the palm.
 */
type Axes = readonly [along: Vec3, across: Vec3, through: Vec3];

/** A centimetre of a whole body, in room sides. */
const CM = 0.002;

/** Where the wrists are held before the eyes: ahead, to each side, below. */
const HELD: Vec3 = [0.07, 0.034, -0.04];
/** How far under that the hands hang before they rise into sight. */
const LOWERED = 0.09;

/** How many quads go round a digit, and round the palm and the sleeve. */
const DIGIT_SIDES = 8;
const BROAD_SIDES = 12;

/** A slice of the palm or the sleeve as a ring in the hand's own axes. */
const sliced = ([along, across, wide, thick]: Slice): Ring => ({
  centre: [along, across, 0],
  wide: [0, wide, 0],
  thick: [0, 0, thick],
});

/**
 * A digit's rings from its root to its tip, in the hand's own axes, and its
 * nail's: each bone a little waisted, each joint a little proud, the tip
 * drawn shut.
 */
function digitRings({ root, aim, hinge, bones, girth, curl }: Digit): {
  rings: Ring[];
  nail: Ring[];
} {
  const inward = cross(aim, hinge);
  /** Each bone's start, how far along the digit that is, and its bend. */
  const joints: Array<{ from: Vec3; before: number; bend: number }> = [];
  let from = root;
  let before = 0;
  let bend = 0;
  for (const [index, bone] of bones.entries()) {
    bend += curl[index] ?? 0;
    joints.push({ from, before, bend });
    const way = plus(times(aim, Math.cos(bend)), times(inward, Math.sin(bend)));
    from = plus(from, times(way, bone));
    before += bone;
  }
  const total = before;
  /**
   * The ring `share` of the way along bone `index`, `grown` times the
   * digit's girth there, squared to `tilt`, the bone's own bend by default.
   */
  const ringAt = (
    index: number,
    share: number,
    grown: number,
    tilt?: number,
  ): Ring => {
    const joint = joints[index];
    const bone = bones[index];
    if (joint === undefined || bone === undefined) {
      throw new RangeError(`A digit has no bone ${String(index)}`);
    }
    const way = plus(
      times(aim, Math.cos(joint.bend)),
      times(inward, Math.sin(joint.bend)),
    );
    const angle = tilt ?? joint.bend;
    const done = (joint.before + bone * share) / total;
    const half = (girth[0] + (girth[1] - girth[0]) * done) * grown;
    return {
      centre: plus(joint.from, times(way, bone * share)),
      wide: times(hinge, half),
      thick: times(
        plus(times(aim, -Math.sin(angle)), times(inward, Math.cos(angle))),
        half * 0.86,
      ),
    };
  };
  const last = bones.length - 1;
  const rings = [
    ringAt(0, 0, 1),
    ...joints.flatMap((joint, index) =>
      index === last
        ? [
            ringAt(index, 0.5, 0.97),
            ringAt(index, 0.8, 0.94),
            ringAt(index, 0.93, 0.76),
            ringAt(index, 1, 0.44),
            ringAt(index, 1.03, 0.03),
          ]
        : [
            ringAt(index, 0.5, 0.95),
            ringAt(
              index + 1,
              0,
              1.08,
              (joint.bend + (joints[index + 1]?.bend ?? joint.bend)) / 2,
            ),
          ],
    ),
  ];
  const [nailFrom, nailTo, proud] = NAIL.along;
  return {
    rings,
    nail: [
      ringAt(last, nailFrom, proud),
      ringAt(last, (nailFrom + nailTo) / 2, proud),
      ringAt(last, nailTo, proud * 0.93),
    ],
  };
}

/** One hand's quads, its wrist at `wrist`, at `scale` of a whole body's. */
function hand(wrist: Vec3, axes: Axes, scale: number, room: Room): Quad[] {
  const placed = (at: Vec3): Vec3 =>
    plus(wrist, times(mix(axes, at), scale * CM));
  const turned = (way: Vec3): Vec3 => times(mix(axes, way), scale * CM);
  const stood = (rings: readonly Ring[]): Ring[] =>
    rings.map(({ centre, wide, thick }) => ({
      centre: placed(centre),
      wide: turned(wide),
      thick: turned(thick),
    }));
  const digits = HAND_DIGITS.flatMap((digit) => {
    const { rings, nail } = digitRings(digit);
    return [
      ...loft(stood(rings), room, { surface: 'skin', sides: DIGIT_SIDES }),
      ...loft(stood(nail), room, {
        surface: 'skin',
        ...pick(NAIL, 'paint', 'arc'),
        sides: 3,
      }),
    ];
  });
  return [
    ...loft(stood(SLEEVE.map((slice) => sliced(slice))), room, {
      surface: 'fabric',
      sides: BROAD_SIDES,
    }),
    ...loft(stood(PALM.map((slice) => sliced(slice))), room, {
      surface: 'skin',
      sides: BROAD_SIDES,
    }),
    ...digits,
  ];
}

/**
 * The body's hands as it looks at them, in the frame of its pose's room:
 * `skin` hands out of `fabric` sleeves, held before the eyes, palms up and
 * then turned over, at the body's own scale. Empty whenever they are out of
 * sight, which is always but in a shrink's look at them.
 */
export function handsOf({ pose, act }: Player): Quad[] {
  if (act?.act !== 'shrinking') return [];
  const { handsUp, turned } = glimpse(act.shrinkLook, act.actFor);
  if (handsUp <= 0) return [];
  const { n, x, y, u, v, eyeAbove, scale, yaw, elevation } = pose;
  const flat = Math.cos(elevation);
  const ahead: Vec3 = [
    flat * Math.cos(yaw),
    Math.sin(elevation),
    flat * Math.sin(yaw),
  ];
  const right: Vec3 = [-Math.sin(yaw), 0, Math.cos(yaw)];
  const up = cross(right, ahead);
  const eye: Vec3 = [u, eyeAbove, v];
  const [forth, aside, under] = HELD;
  return ([1, -1] as const).flatMap((side) => {
    const view: readonly [Vec3, Vec3, Vec3] = [ahead, times(right, side), up];
    const wrist = plus(
      eye,
      times(mix(view, [forth, aside, under - (1 - handsUp) * LOWERED]), scale),
    );
    // Fingers ahead, a little up and in; the thumb outward while the palm
    // faces the eye, which is how the hands come up.
    const along = unit(mix(view, [0.9, -0.3, 0.45]));
    const outward = view[1];
    const across = unit(plus(outward, times(along, -dot(outward, along))));
    const square = cross(along, across);
    const through = dot(square, ahead) < 0 ? square : times(square, -1);
    const angle = turned * Math.PI;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    return hand(
      wrist,
      [
        along,
        plus(times(across, cos), times(through, sin)),
        plus(times(through, cos), times(across, -sin)),
      ],
      scale,
      { n, x, y },
    );
  });
}
