import { lerp } from '@/cube/shared/lib/ease';
import {
  face,
  plus,
  type Quad,
  type Room,
  times,
  UP,
  type Vec3,
} from '@/cube/entities/world';

import { pick } from '../lib/pick';
import {
  inLane,
  onSide,
  shutSides,
  type Side,
  SIDE_FRAMES,
  sideAt,
  SIDES,
} from '../lib/side';
import { bar, block, forward, heading, type Made, tilted } from '../lib/solid';
import { type Act, shown } from './staging';

/** An arm: swung forward from hanging and spread out from the body, radians. */
type Arm = { armSwing: number; splayed: number };

/** How a figure holds itself. */
type Stance = {
  arms: readonly [left: Arm, right: Arm];
  /** The head's turn to the figure's right, radians. */
  headTurn: number;
  /** The body's lean forward from the hips, radians. */
  bowed: number;
};

const HANGING: Arm = { armSwing: 0, splayed: 0.06 };

/** What a figure's clothes and its head are made of. */
type Dress = { clothes: Made; flesh: Made };

/** A grown figure's height in room sides: 1.75 m on its own floor. */
export const GROWN = 0.35;

/**
 * How far a figure `tall` reaches from where it stands, whatever its stance:
 * a thing set this far from a wall stays inside the room.
 */
export const reachOf = (tall: number): number => 0.62 * tall;

/**
 * A figure of six boxes standing at `feet`, looking along `yaw`: two legs, a
 * body, two arms and a head.
 */
export function figureAt(
  room: Room,
  feet: Vec3,
  yaw: number,
  tall: number,
  { arms, headTurn, bowed }: Stance,
  { clothes, flesh }: Dress,
): Quad[] {
  const ahead = forward(yaw);
  const right = forward(yaw + Math.PI / 2);
  const down = times(UP, -1);
  const hips = plus(feet, times(UP, 0.48 * tall));
  const spine = tilted(UP, ahead, bowed);
  const neck = plus(hips, times(spine, 0.34 * tall));
  const limb = 0.1 * tall;
  const legs = [-1, 1].flatMap((side) => {
    const out = times(right, side * 0.075 * tall);
    return bar(
      room,
      [plus(feet, out), plus(hips, out)],
      [limb, limb],
      right,
      clothes,
    );
  });
  const body = bar(
    room,
    [hips, neck],
    [0.3 * tall, 0.14 * tall],
    right,
    clothes,
  );
  const held = arms.flatMap(({ armSwing: swung, splayed }, index) => {
    const out = times(right, index === 0 ? -1 : 1);
    const along = tilted(tilted(down, ahead, swung), out, splayed);
    const shoulder = plus(
      plus(neck, times(spine, -0.04 * tall)),
      times(out, 0.19 * tall),
    );
    return bar(
      room,
      [shoulder, plus(shoulder, times(along, 0.36 * tall))],
      [0.08 * tall, 0.08 * tall],
      ahead,
      clothes,
    );
  });
  const skull = block(
    room,
    plus(neck, times(spine, 0.1 * tall)),
    [0.13 * tall, 0.14 * tall, 0.12 * tall],
    heading(yaw + headTurn),
    flesh,
  );
  return [...legs, ...body, ...held, ...skull];
}

const SUIT: Dress = {
  clothes: { stuff: 'fabric', tint: 0x16_16_1a },
  flesh: { stuff: 'fabric', tint: 0x1e_1a_16 },
};

/** The yaw looking out of the room through `side`. */
const yawOut = (side: Side): number => {
  const { into } = SIDE_FRAMES[side];
  return Math.atan2(-into[2], -into[0]);
};

/**
 * Someone at the far wall, facing it, barely moving; there for a few seconds
 * and then not. In a room with no wall it faces an open side from the lane.
 */
export const figure: Act = ({ setting, age, chance }) => {
  const side =
    sideAt(shutSides(setting), chance('side')) ?? pick(SIDES, chance('side'));
  const tall = GROWN * (0.94 + 0.12 * chance('spot'));
  const feet = onSide(setting, side, inLane(chance('u')), 0, 0.09);
  return shown(
    figureAt(
      setting.room,
      feet,
      yawOut(side),
      tall,
      {
        arms: [HANGING, HANGING],
        headTurn: 0.12 * Math.sin(age * 0.7),
        bowed: 0.02 * Math.sin(age * 0.9),
      },
      SUIT,
    ),
  );
};

const DUMMY: Dress = {
  clothes: { stuff: 'plastic', tint: 0xd8_d2_c4 },
  flesh: { stuff: 'plastic', tint: 0xd8_d2_c4 },
};

/** How long a mannequin holds a pose, in seconds. */
const POSE_HELD = 60;

/**
 * A shop mannequin on its stand, in a pose of its own for each minute it is
 * there: nobody sees it move.
 */
export const mannequin: Act = ({ setting, age, chance }) => {
  const pose = Math.floor(age / POSE_HELD);
  const arm = (index: number): Arm => ({
    armSwing: 2.6 * chance('raise', 2 * pose + index),
    splayed: 1.2 * chance('spread', 2 * pose + index),
  });
  const reach = reachOf(GROWN);
  const feet: Vec3 = [
    lerp(reach, 1 - reach, chance('u')),
    0.004,
    inLane(chance('v')),
  ];
  return shown([
    face(
      [feet[0] - 0.04, 0.004, feet[2] - 0.04],
      [0, 0, 0.08],
      [0.08, 0, 0],
      setting.room,
      'metal',
    ),
    ...figureAt(
      setting.room,
      feet,
      2 * Math.PI * chance('yaw'),
      GROWN,
      {
        arms: [arm(0), arm(1)],
        headTurn: 2.4 * (chance('head', pose) - 0.5),
        bowed: 0.3 * (chance('lean', pose) - 0.5),
      },
      DUMMY,
    ),
  ]);
};
