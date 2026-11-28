import { type Point, smoothstep } from '@/clip/shared/ink';
import { lerpPose, POSES } from '@/clip/entities/puppet';

type Pose = typeof POSES.stand;

const STAND = POSES.stand;

const flip = ([x, y]: Point): Point => [-x, y];

/** `pose` seen in a mirror: left and right swapped. */
const swapped = (pose: Pose): Pose => ({
  head: flip(pose.head),
  neck: flip(pose.neck),
  shoulderL: flip(pose.shoulderR),
  shoulderR: flip(pose.shoulderL),
  elbowL: flip(pose.elbowR),
  elbowR: flip(pose.elbowL),
  wristL: flip(pose.wristR),
  wristR: flip(pose.wristL),
  hipL: flip(pose.hipR),
  hipR: flip(pose.hipL),
  kneeL: flip(pose.kneeR),
  kneeR: flip(pose.kneeL),
  footL: flip(pose.footR),
  footR: flip(pose.footL),
});

const JACK_OUT: Pose = {
  ...STAND,
  elbowL: [-120, -50],
  elbowR: [120, -50],
  wristL: [-142, -150],
  wristR: [142, -150],
  kneeL: [-64, 300],
  kneeR: [64, 300],
  footL: [-112, 404],
  footR: [112, 404],
};

const SQUAT: Pose = {
  head: [0, -92],
  neck: [0, 58],
  shoulderL: [-56, 80],
  shoulderR: [56, 80],
  elbowL: [-144, 78],
  elbowR: [144, 78],
  wristL: [-232, 72],
  wristR: [232, 72],
  hipL: [-26, 250],
  hipR: [26, 250],
  kneeL: [-100, 318],
  kneeR: [100, 318],
  footL: [-62, 412],
  footR: [62, 412],
};

/** Bent to the viewer's left, the right arm arched over the head, the left fist on the hip. */
const BEND: Pose = {
  ...STAND,
  head: [-52, -138],
  neck: [-16, 0],
  shoulderL: [-72, 32],
  shoulderR: [36, 8],
  elbowL: [-124, 112],
  elbowR: [70, -84],
  wristL: [-42, 182],
  wristR: [-26, -176],
  kneeL: [-46, 302],
  kneeR: [46, 302],
  footL: [-64, 410],
  footR: [64, 410],
};

/**
 * Feet wide, the right fist punched up and out past the head — straight up,
 * the mask would hide it — the left cocked at the chest.
 */
const PUNCH: Pose = {
  ...JACK_OUT,
  head: [-10, -148],
  elbowL: [-104, 96],
  wristL: [-48, 34],
  elbowR: [124, -40],
  wristR: [188, -128],
};

/**
 * The routine, four counts a move: each move swings between its two
 * positions, one a count.
 */
const ROUTINE: ReadonlyArray<readonly [Pose, Pose]> = [
  [BEND, swapped(BEND)],
  [STAND, JACK_OUT],
  [STAND, SQUAT],
  [PUNCH, swapped(PUNCH)],
];

const COUNTS_A_MOVE = 4;

/** Which move of the routine count `count` is in. */
export const moveAt = (count: number): number => {
  const n = ROUTINE.length;
  return ((Math.floor(count / COUNTS_A_MOVE) % n) + n) % n;
};

function held(count: number): Pose {
  const [first, second] = ROUTINE[moveAt(count)] ?? [STAND, STAND];
  return count % 2 === 0 ? first : second;
}

/**
 * The routine `fraction` through count `count`: it snaps into the count's
 * position in the first third of the count, then holds it.
 */
export const routineAt = (count: number, fraction: number): Pose =>
  lerpPose(held(count - 1), held(count), smoothstep(0, 0.34, fraction));
