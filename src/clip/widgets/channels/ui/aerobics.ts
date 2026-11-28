import { type Pen, type Point, smoothstep } from '@/clip/shared/ink';
import { pulse } from '@/clip/shared/score';
import { bunny } from '@/clip/entities/bunny';
import { FORM_LOOKS, lerpPose, POSES, puppet } from '@/clip/entities/puppet';

import { CHANNELS_PALETTE } from './palette-channels';
import { box, caption, HEIGHT, type Show, WIDTH } from './screen';

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

/** The routine, a move every four counts, each swinging between its two positions a count at a time. */
const ROUTINE: ReadonlyArray<readonly [Pose, Pose]> = [
  [BEND, swapped(BEND)],
  [STAND, JACK_OUT],
  [STAND, SQUAT],
  [PUNCH, swapped(PUNCH)],
];
const COUNTS_A_MOVE = 4;

function held(count: number): Pose {
  const n = ROUTINE.length;
  const move = ((Math.floor(count / COUNTS_A_MOVE) % n) + n) % n;
  const [first, second] = ROUTINE[move] ?? [STAND, STAND];
  return count % 2 === 0 ? first : second;
}

/** The routine `fraction` through count `count`: it snaps into the count's position in the first third, then holds it. */
const routineAt = (count: number, fraction: number): Pose =>
  lerpPose(held(count - 1), held(count), smoothstep(0, 0.34, fraction));

const { aerobics } = CHANNELS_PALETTE;

const COUNTS = ['РАЗ', 'ДВА', 'ТРИ', 'ЧЕТЫРЕ'] as const;
const FLOOR = 520;
// The backing line, each a count behind the instructor: x, floor, scale, mark.
const LINE = [
  [140, 590, 0.42, 5100],
  [820, 590, 0.42, 5200],
] as const;
// The nearness over which the backing line stops dead and turns to the camera.
const LINE_FREEZES = [0.55, 0.68] as const;

function studio(pen: Pen): void {
  box(pen, aerobics.wall);
  for (let n = 0; n < 7; n += 1) {
    box(pen, aerobics.band, [n * 160 - 40, 0, 56, FLOOR]);
  }
  box(pen, aerobics.floor, [0, FLOOR, WIDTH, HEIGHT - FLOOR]);
  box(pen, aerobics.stripe, [0, FLOOR - 10, WIDTH, 14]);
  caption(pen, 'ЗАРЯДКА', [WIDTH / 2, 34], 8);
}

/**
 * Morning exercises: the puppet in his toy suit leads the routine — side
 * bends, jumping jacks, squats, punches — and shouts each count. Two more of
 * him follow a count behind; past a nearness of 0.55 they stop dead and turn
 * to the camera. The bunny is in the class, stepping forward through it as it
 * comes nearer.
 */
export const workout: Show = (pen, nearness, _since, stare) => {
  const { index, fraction } = pulse(pen.playhead);
  const moving = 1 - stare;
  const frozen = smoothstep(LINE_FREEZES[0], LINE_FREEZES[1], nearness);
  studio(pen);

  for (const [x, y, scale, mark] of LINE) {
    const late = frozen > 0.5 ? index - 1 - (index % 4) : index - 1;
    puppet(pen, {
      place: { x, y, scale },
      pose: routineAt(late, frozen > 0.5 ? 1 : fraction),
      outfit: 'toy',
      look: {
        ...FORM_LOOKS.vocal,
        jaw: 0.25 * (1 - frozen),
        gaze: [0, 0],
        turn: 0.5 * (x < WIDTH / 2 ? 1 : -1) * (1 - frozen),
        brow: frozen * 0.8,
      },
      mark,
    });
  }

  const step = smoothstep(0.45, 0.8, nearness);
  bunny(pen, {
    x: 600 - 20 * step,
    y: 330 + 60 * step,
    nearness,
    scale: 0.32 + 0.3 * step,
    hop: index % 2 === 0 ? fraction : undefined,
    arms: index % 2 === 0 ? 'hop' : 'up',
    swaying: 0.4,
    seed: 15,
  });

  // A shout on each count, its jaw falling shut through it.
  const shout = 0.7 * (1 - smoothstep(0, 0.6, fraction)) * moving;
  puppet(pen, {
    place: { x: 380, y: 690, scale: 0.72 },
    pose: routineAt(index, stare > 0.5 ? 1 : fraction),
    outfit: 'toy',
    look: {
      ...FORM_LOOKS.vocal,
      jaw: 0.2 + shout,
      gaze: [0.6 * moving, 0],
      turn: 0.55 * moving,
      brow: stare * 0.7 - 0.6 * moving,
    },
    mark: 5000,
  });

  const count = COUNTS[((index % 4) + 4) % 4] ?? COUNTS[0];
  caption(pen, count, [760, 600], 10 - 3 * fraction, aerobics.count);
};
