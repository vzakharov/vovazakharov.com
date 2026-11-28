import {
  add,
  clamp,
  distance,
  mix,
  type Point,
  sub,
  times,
  turned,
} from '@/clip/shared/ink';

/** Sides are the viewer's, as on the head: `L` is the left of the picture. */
export const SIDES = ['L', 'R'] as const;

export type Side = (typeof SIDES)[number];

export const JOINTS = [
  'head',
  'neck',
  'shoulderL',
  'shoulderR',
  'elbowL',
  'elbowR',
  'wristL',
  'wristR',
  'hipL',
  'hipR',
  'kneeL',
  'kneeR',
  'footL',
  'footR',
] as const;

export type Joint = (typeof JOINTS)[number];

/**
 * Where every joint is, in the puppet's own units, x right and y down, the
 * base of the neck at the origin when it stands straight. `head` is the point
 * between the eyes: the head tilts along the line from `neck` to it.
 */
export type Pose = Readonly<Record<Joint, Point>>;

export const mapPose = (
  pose: Pose,
  move: (point: Point, joint: Joint) => Point,
): Pose => ({
  head: move(pose.head, 'head'),
  neck: move(pose.neck, 'neck'),
  shoulderL: move(pose.shoulderL, 'shoulderL'),
  shoulderR: move(pose.shoulderR, 'shoulderR'),
  elbowL: move(pose.elbowL, 'elbowL'),
  elbowR: move(pose.elbowR, 'elbowR'),
  wristL: move(pose.wristL, 'wristL'),
  wristR: move(pose.wristR, 'wristR'),
  hipL: move(pose.hipL, 'hipL'),
  hipR: move(pose.hipR, 'hipR'),
  kneeL: move(pose.kneeL, 'kneeL'),
  kneeR: move(pose.kneeR, 'kneeR'),
  footL: move(pose.footL, 'footL'),
  footR: move(pose.footR, 'footR'),
});

type Limb = readonly [Point, Point, Point];

export const armOf = (pose: Pose, side: Side): Limb => [
  pose[`shoulder${side}`],
  pose[`elbow${side}`],
  pose[`wrist${side}`],
];

export const legOf = (pose: Pose, side: Side): Limb => [
  pose[`hip${side}`],
  pose[`knee${side}`],
  pose[`foot${side}`],
];

/** The pose `t` of the way from `from` to `to`, each joint on a straight line. */
export const lerpPose = (from: Pose, to: Pose, t: number): Pose =>
  mapPose(from, (point, joint) => mix(point, to[joint], t));

/**
 * The middle joint of a two-bone limb from `root` to `target`, with bones
 * `upper` and `lower` long, and where its end lands: `target` itself, or the
 * nearest point the limb reaches. Of the two ways the limb can fold, it takes
 * the one whose middle joint lies further along `prefer`.
 */
export function fold(
  root: Point,
  target: Point,
  upper: number,
  lower: number,
  prefer: Point,
): { middle: Point; end: Point } {
  const span = distance(root, target);
  const reach = clamp(
    span,
    Math.abs(upper - lower) + 0.01,
    upper + lower - 0.01,
  );
  const [dx, dy] = span === 0 ? [0, 1] : times(sub(target, root), 1 / span);
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const off = Math.sqrt(Math.max(0, upper * upper - along * along));
  const base = add(root, [dx * along, dy * along]);
  const sides = [1, -1].map(
    (sign): Point => add(base, [-dy * off * sign, dx * off * sign]),
  );
  const score = (point: Point) => {
    const [x, y] = sub(point, root);
    return x * prefer[0] + y * prefer[1];
  };
  const [one = base, other = base] = sides;
  return {
    middle: score(one) >= score(other) ? one : other,
    end: add(root, [dx * reach, dy * reach]),
  };
}

// Where an elbow and a knee would rather be: out from the body, the elbow low.
const ELBOW_PREFERS: Record<Side, Point> = { L: [-1, 0.4], R: [1, 0.4] };
const KNEE_PREFERS: Record<Side, Point> = { L: [-1, -0.3], R: [1, -0.3] };

export type Reach = Partial<Record<Side, Point>>;

/**
 * `pose` with each hand named in `hands` put on its target, the elbow folded
 * to suit, the arm keeping the bone lengths it has in `pose`. A target out of
 * reach leaves the arm straight towards it. `palm` is how far past the wrist,
 * along the forearm, the point that lands on the target is: 0 the wrist
 * itself, a fist's depth for a hand closing on something.
 */
export function reaching(pose: Pose, hands: Reach, palm = 0): Pose {
  const arms = { ...pose };
  for (const side of SIDES) {
    const target = hands[side];
    if (!target) continue;
    const [shoulder, elbow, wrist] = armOf(pose, side);
    const folded = (aim: Point) =>
      fold(
        shoulder,
        aim,
        distance(shoulder, elbow),
        distance(elbow, wrist),
        ELBOW_PREFERS[side],
      );
    // The forearm's direction is only known once the arm is folded, so the
    // wrist is aimed twice: at the target, then short of it by the palm.
    const first = folded(target);
    const span = Math.max(1, distance(first.middle, first.end));
    const { middle, end } = folded(
      add(target, times(sub(first.middle, first.end), palm / span)),
    );
    arms[`elbow${side}`] = middle;
    arms[`wrist${side}`] = end;
  }
  return arms;
}

/** How the body above the feet is carried, off the pose it starts from. */
export type Carriage = {
  /** The body moved sideways, in the puppet's units. */
  sway?: number;
  /** The body lowered: positive bends the knees. */
  dip?: number;
  /** The body tipped about the hips, clockwise, in degrees. */
  lean?: number;
};

const ABOVE_THE_KNEES: ReadonlySet<Joint> = new Set<Joint>([
  'head',
  'neck',
  'shoulderL',
  'shoulderR',
  'elbowL',
  'elbowR',
  'wristL',
  'wristR',
  'hipL',
  'hipR',
]);

/**
 * `pose` with everything above the knees moved as one, the feet left where
 * they stand and the knees folded to suit — a sway, a bounce, a lean that
 * keeps the soles on the floor.
 */
export function carried(pose: Pose, carriage: Carriage): Pose {
  const { sway = 0, dip = 0, lean = 0 } = carriage;
  const pivot = mix(pose.hipL, pose.hipR, 0.5);
  const body = mapPose(pose, (point, joint) =>
    ABOVE_THE_KNEES.has(joint)
      ? add(turned(point, pivot, lean), [sway, dip])
      : point,
  );
  const legs = { ...body };
  for (const side of SIDES) {
    const [hip, knee, foot] = legOf(pose, side);
    legs[`knee${side}`] = fold(
      body[`hip${side}`],
      foot,
      distance(hip, knee),
      distance(knee, foot),
      KNEE_PREFERS[side],
    ).middle;
  }
  return legs;
}

/**
 * What a body's proportions are measured by: `size` the whole figure, head
 * and all; `wide` the shoulders and hips across; `torso` neck to hips; `head`
 * the head, over and above `size`.
 */
const PROPORTIONS = ['size', 'wide', 'torso', 'arms', 'legs', 'head'] as const;

/** A body's proportions, each a factor on the standard puppet's. */
export type Build = Readonly<Record<(typeof PROPORTIONS)[number], number>>;

/** How far below the ankle the sole is, on the standard build. */
export const SOLE = 24;
const PALM = 17;

/** How heavy a build's limbs and hands are drawn: a wide body thickens them, though less than it widens. */
export const heftOf = ({ size, wide }: Build): number => size * Math.sqrt(wide);

/** How far past the wrist a fist closes on `build`: `reaching`'s `palm` for a hand taking hold. */
export const palmOf = (build: Build): number => PALM * heftOf(build);

export const STANDARD_BUILD: Build = {
  size: 1,
  wide: 1,
  torso: 1,
  arms: 1,
  legs: 1,
  head: 1,
};

/**
 * `pose` — drawn for the standard build — refitted to `build`: the trunk
 * stretched, each limb scaled from the joint it hangs on, so a pose keeps its
 * gesture on any body.
 */
export function fitted(pose: Pose, build: Build): Pose {
  const { size, wide, torso, arms, legs, head } = build;
  const trunk = ([x, y]: Point): Point => [x * wide * size, y * torso * size];
  const hung = (
    root: Point,
    onto: Point,
    point: Point,
    factor: number,
  ): Point => add(onto, times(sub(point, root), factor * size));
  const limbsOf = (side: Side) => {
    const shoulder = trunk(pose[`shoulder${side}`]);
    const hip = trunk(pose[`hip${side}`]);
    const elbow = hung(
      pose[`shoulder${side}`],
      shoulder,
      pose[`elbow${side}`],
      arms,
    );
    const knee = hung(pose[`hip${side}`], hip, pose[`knee${side}`], legs);
    return {
      shoulder,
      elbow,
      wrist: hung(pose[`elbow${side}`], elbow, pose[`wrist${side}`], arms),
      hip,
      knee,
      foot: hung(pose[`knee${side}`], knee, pose[`foot${side}`], legs),
    };
  };
  const neck = trunk(pose.neck);
  const [left, right] = [limbsOf('L'), limbsOf('R')];
  return {
    head: hung(pose.neck, neck, pose.head, head),
    neck,
    shoulderL: left.shoulder,
    shoulderR: right.shoulder,
    elbowL: left.elbow,
    elbowR: right.elbow,
    wristL: left.wrist,
    wristR: right.wrist,
    hipL: left.hip,
    hipR: right.hip,
    kneeL: left.knee,
    kneeR: right.knee,
    footL: left.foot,
    footR: right.foot,
  };
}
