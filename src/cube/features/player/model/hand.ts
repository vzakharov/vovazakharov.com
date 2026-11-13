import { pick } from '@/kernel/shared/lib/collections';

import {
  cross,
  dot,
  loft,
  minus,
  plus,
  type Quad,
  type Ring,
  type Room,
  times,
  type Vec3,
} from '@/cube/entities/world';

import {
  type Curl,
  type Digit,
  HAND_DIGITS,
  type HandPose,
  NAIL,
  PALM,
  sleeveOf,
  type Slice,
} from './hand-shape';

/** `a·x + b·y + c·z`. */
export const inAxes = (
  [x, y, z]: readonly [Vec3, Vec3, Vec3],
  [a, b, c]: Vec3,
): Vec3 => plus(plus(times(x, a), times(y, b)), times(z, c));

/**
 * A hand's own axes, unit and square to each other: `along` the fingers,
 * `across` the palm towards the thumb, `through` it out of the palm.
 */
export type Axes = readonly [along: Vec3, across: Vec3, through: Vec3];

/** A centimetre of a whole body, in room sides. */
export const CM = 0.002;

/** How many quads go round a digit, and round the palm and the sleeve. */
const DIGIT_SIDES = 8;
const BROAD_SIDES = 12;

/** A slice of the palm or the sleeve as a ring in the hand's own axes. */
const sliced = ([along, across, wide, thick]: Slice): Ring => ({
  centre: [along, across, 0],
  wide: [0, wide, 0],
  thick: [0, 0, thick],
});

/** `way` turned `angle` about `axis`, a unit vector square to it. */
const turnedAbout = (way: Vec3, axis: Vec3, angle: number): Vec3 =>
  plus(times(way, Math.cos(angle)), times(cross(axis, way), Math.sin(angle)));

/** Where the thumb comes among a hand's digits. */
const THUMB_INDEX = 4;

/** The axis the thumb swings about to come across the palm: the hand's length. */
const SWING: Vec3 = [1, 0, 0];

/** `digit` with its root's aim and hinge swung `oppose` round the hand's length. */
function opposed(digit: Digit, oppose: number): Digit {
  const swung = (way: Vec3): Vec3 => {
    const along = times(SWING, dot(way, SWING));
    return plus(along, turnedAbout(minus(way, along), SWING, -oppose));
  };
  return { ...digit, aim: swung(digit.aim), hinge: swung(digit.hinge) };
}

/**
 * A digit's bones curled by `curl`: the way a bone bent `bend` runs, each
 * bone's start with how far along the digit that is and its bend, where the
 * tip ends up, and the digit's whole length.
 */
function bonesOf({ root, aim, hinge, bones }: Digit, curl: Curl) {
  const inward = cross(aim, hinge);
  const wayAt = (bend: number): Vec3 =>
    plus(times(aim, Math.cos(bend)), times(inward, Math.sin(bend)));
  const joints: Array<{ from: Vec3; before: number; bend: number }> = [];
  let from = root;
  let before = 0;
  let bend = 0;
  for (const [index, bone] of bones.entries()) {
    bend += curl[index] ?? 0;
    joints.push({ from, before, bend });
    from = plus(from, times(wayAt(bend), bone));
    before += bone;
  }
  return { inward, wayAt, joints, tip: from, total: before };
}

/**
 * A digit's rings from its root to its tip, in the hand's own axes, and its
 * nail's: each bone a little waisted, each joint a little proud, the tip
 * drawn shut.
 */
function digitRings(
  digit: Digit,
  curl: Curl,
): {
  rings: Ring[];
  nail: Ring[];
} {
  const { aim, hinge, bones, girth } = digit;
  const { inward, wayAt, joints, total } = bonesOf(digit, curl);
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
    const angle = tilt ?? joint.bend;
    const done = (joint.before + bone * share) / total;
    const half = (girth[0] + (girth[1] - girth[0]) * done) * grown;
    return {
      centre: plus(joint.from, times(wayAt(joint.bend), bone * share)),
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

/** The digits of a hand held as `pose` has it, each with its curl. */
const digitsOf = ({ curls, oppose }: HandPose): Array<[Digit, Curl]> =>
  curls.map((curl, index) => {
    const digit = HAND_DIGITS[index];
    if (digit === undefined) throw new RangeError('A hand has five digits');
    return [index === THUMB_INDEX ? opposed(digit, oppose) : digit, curl];
  });

/**
 * Where digit `index` of a hand held as `pose` touches what it holds, in
 * centimetres in the hand's own axes: the pad of its last bone.
 */
export function padOf(pose: HandPose, index: 0 | 1 | 2 | 3 | 4): Vec3 {
  const found = digitsOf(pose)[index];
  if (found === undefined) throw new RangeError('A hand has five digits');
  const [digit, curl] = found;
  const { inward, wayAt, joints, tip } = bonesOf(digit, curl);
  const bend = joints.at(-1)?.bend ?? 0;
  const last = digit.bones.at(-1) ?? 0;
  // Back from the tip a third of the last bone, and out of the pad's skin.
  const padWay = plus(
    times(digit.aim, -Math.sin(bend)),
    times(inward, Math.cos(bend)),
  );
  return plus(
    plus(tip, times(wayAt(bend), -last * 0.3)),
    times(padWay, digit.girth[1] * 0.86),
  );
}

/**
 * One hand's quads, its wrist at `wrist`, at `scale` of a whole body's, held
 * as `pose` has it. `axes` that are left-handed make a left hand.
 */
export function hand(
  wrist: Vec3,
  axes: Axes,
  scale: number,
  room: Room,
  pose: HandPose,
): Quad[] {
  const placed = (at: Vec3): Vec3 =>
    plus(wrist, times(inAxes(axes, at), scale * CM));
  const turned = (way: Vec3): Vec3 => times(inAxes(axes, way), scale * CM);
  const stood = (rings: readonly Ring[]): Ring[] =>
    rings.map(({ centre, wide, thick }) => ({
      centre: placed(centre),
      wide: turned(wide),
      thick: turned(thick),
    }));
  const digits = digitsOf(pose).flatMap(([digit, curl]) => {
    const { rings, nail } = digitRings(digit, curl);
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
    ...loft(stood(sleeveOf(pose.sleeve).map((slice) => sliced(slice))), room, {
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
