import {
  add,
  at,
  clipped,
  distance,
  heading,
  ink,
  INK_PALETTE,
  limb,
  mix,
  type Path,
  type Pen,
  type Point,
  polygon,
  sub,
  times,
} from '@/clip/shared/ink';

import { head, type Look } from '../../head';
import {
  armOf,
  type Build,
  heftOf,
  legOf,
  type Pose,
  type Side,
  SIDES,
  SOLE,
  STANDARD_BUILD,
} from '../model/pose';
import { fingertips, type Grip, hand } from './hands';
import { collar, type Outfit, OUTFIT_GRIP, trim } from './outfits';
import { OUTFIT_PALETTE } from './palette-outfit';

/** What a figure wears and the face it makes; every member has a default. */
export type Worn = {
  outfit?: Outfit;
  look?: Partial<Look>;
  /** Tells this figure's boil from another's: the seed its ink starts from. */
  mark?: number;
};

/** How a figure is dressed and what it carries; every member has a default. */
export type Dress = Worn & {
  build?: Build;
  /** What each hand does; the outfit decides for a hand left out. */
  grips?: Partial<Record<Side, Grip>>;
  /**
   * Something in a hand, drawn in the puppet's units just under that hand:
   * it is given where the wrist is and which way the forearm points, in
   * degrees clockwise off straight down.
   */
  held?: Partial<Record<Side, (wrist: Point, forearm: number) => void>>;
  /** Drawn behind the whole figure, in the puppet's units. */
  behind?: () => void;
  /**
   * Drawn over the body and head and under the arms: what the hands are on.
   * A `wrap` hand's arm goes under it too, and only its fingers over.
   */
  front?: () => void;
  /** Arms that pass behind the torso instead of in front of it. */
  tucked?: readonly Side[];
  /** A figure cut off at the hips by whatever it stands behind. */
  legless?: boolean;
};

// The standard build's limb widths, and how far past its joints the torso runs.
const ARM_WIDTH = 27;
const LEG_WIDTH = 25;
const NECK_WIDTH = 32;
const SHOULDER_PAD = 9;
const HIP_PAD = 23;

const BOOT = polygon([
  [-17, -12],
  [17, -12],
  [48, SOLE],
  [-19, SOLE],
]);

function torsoOutline(pose: Pose, pad: number): Path {
  const { shoulderL, shoulderR, hipL, hipR } = pose;
  const up = times(
    sub(mix(shoulderL, shoulderR, 0.5), mix(hipL, hipR, 0.5)),
    0.08,
  );
  const out = (from: Point, to: Point, by: number): Point =>
    add(to, times(sub(to, from), by / Math.max(1, distance(from, to))));
  const [tl, tr] = [
    add(out(shoulderR, shoulderL, SHOULDER_PAD * pad), up),
    add(out(shoulderL, shoulderR, SHOULDER_PAD * pad), up),
  ];
  const [bl, br] = [
    sub(out(hipR, hipL, HIP_PAD * pad), times(up, 0.6)),
    sub(out(hipL, hipR, HIP_PAD * pad), times(up, 0.6)),
  ];
  return [
    { kind: 'M', points: [tl] },
    {
      kind: 'C',
      points: [add(mix(tl, tr, 0.25), up), add(mix(tl, tr, 0.75), up), tr],
    },
    { kind: 'L', points: [br] },
    { kind: 'Q', points: [sub(mix(bl, br, 0.5), times(up, 0.5)), bl] },
    { kind: 'L', points: [tl] },
    { kind: 'Z', points: [] },
  ];
}

/**
 * A figure in the pose it is handed, joint for joint, in the puppet's units:
 * `pose` is already fitted to `dress.build`.
 */
export function figure(pen: Pen, pose: Pose, dress: Dress = {}): void {
  const {
    build = STANDARD_BUILD,
    outfit = 'jacket',
    look = {},
    grips = {},
    held = {},
    tucked = [],
    legless = false,
    behind,
    front,
    mark: seed = 0,
  } = dress;
  const colors = OUTFIT_PALETTE[outfit];
  const { size } = build;
  const heft = heftOf(build);

  const armSeedOf = (side: Side) => seed + (side === 'L' ? 60 : 70);
  const atHand = (side: Side, draw: () => void) => {
    const [, elbow, wrist] = armOf(pose, side);
    const forearm = heading(elbow, wrist);
    const place = { x: wrist[0], y: wrist[1], rot: forearm, scale: heft };
    at(pen, { ...place, flip: side === 'L' }, draw);
  };
  const arm = (side: Side) => {
    const [shoulder, elbow, wrist] = armOf(pose, side);
    const armSeed = armSeedOf(side);
    limb(pen, [shoulder, elbow, wrist], colors.body, ARM_WIDTH * heft, armSeed);
    held[side]?.(wrist, heading(elbow, wrist));
    atHand(side, () => {
      hand(
        pen,
        grips[side] ?? OUTFIT_GRIP[outfit],
        colors.body,
        armSeed + 1,
        colors.stripe,
      );
    });
  };
  // A wrapping hand's arm goes under what `front` draws, its fingers over it.
  const wraps = (side: Side) =>
    grips[side] === 'wrap' && !tucked.includes(side);

  behind?.();
  for (const side of SIDES) if (tucked.includes(side)) arm(side);
  if (!legless) {
    for (const side of SIDES) {
      const leg = legOf(pose, side);
      const foot = leg[2];
      const legSeed = seed + (side === 'L' ? 80 : 90);
      limb(pen, leg, colors.leg, LEG_WIDTH * heft, legSeed);
      at(
        pen,
        { x: foot[0], y: foot[1], scale: size, flip: side === 'L' },
        () => {
          ink(pen, BOOT, { fill: colors.shoe, seed: legSeed + 1 });
        },
      );
    }
  }

  const outline = torsoOutline(pose, heft);
  const top = mix(pose.shoulderL, pose.shoulderR, 0.5);
  const hips = mix(pose.hipL, pose.hipR, 0.5);
  ink(pen, outline, { fill: colors.body, stroke: null });
  clipped(pen, outline, () => {
    at(pen, { x: top[0], y: top[1], rot: heading(top, hips) }, () => {
      trim(
        pen,
        outfit,
        {
          shoulders:
            distance(pose.shoulderL, pose.shoulderR) / 2 + SHOULDER_PAD * heft,
          hips: distance(pose.hipL, pose.hipR) / 2 + HIP_PAD * heft,
          hem: distance(top, hips),
        },
        seed + 100,
      );
    });
  });
  ink(pen, outline, { width: 6, seed: seed + 101 });

  const tilt = heading(pose.head, pose.neck);
  const headSize = size * build.head;
  limb(
    pen,
    [pose.neck, mix(pose.neck, pose.head, 0.5)],
    INK_PALETTE.skin,
    NECK_WIDTH * headSize,
    seed + 102,
  );
  at(
    pen,
    {
      x: pose.neck[0],
      y: pose.neck[1],
      rot: heading(top, hips),
      scale: outfit === 'jacket' ? heft : heft * 0.8,
    },
    () => {
      collar(pen, outfit, seed + 103);
    },
  );
  at(
    pen,
    { x: pose.head[0], y: pose.head[1], rot: tilt, scale: headSize },
    () => {
      head(pen, look, seed + 200);
    },
  );

  for (const side of SIDES) if (wraps(side)) arm(side);
  front?.();
  for (const side of SIDES) {
    if (!tucked.includes(side) && !wraps(side)) arm(side);
  }
  for (const side of SIDES) {
    if (wraps(side)) {
      atHand(side, () => {
        fingertips(pen, armSeedOf(side) + 3);
      });
    }
  }
}
