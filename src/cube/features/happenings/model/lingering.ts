import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';
import { CEILING_HEIGHT } from '@/cube/shared/lib/room-shape';
import { nearestTurn } from '@/cube/shared/lib/turn';
import {
  plus,
  type Quad,
  type Room,
  UP,
  type Vec3,
} from '@/cube/entities/world';

import { pick } from '../lib/pick';
import {
  about,
  bar,
  block,
  heading,
  type Made,
  turned,
  yawTo,
} from '../lib/solid';
import { type Act, shown, sounding } from './staging';

const BALLOON_PAINTS = [
  0xc8_1e_28, 0xe0_b8_1a, 0x1e_62_c0, 0xe6_e2_d6, 0x2a_9a_4a,
] as const;

const BALLOON: Vec3 = [0.042, 0.052, 0.042];
const STRING = 0.12;
const THREAD: Made = { stuff: 'fabric', tint: 0xe0_dc_d0 };
/** How long before the act's end the balloon bursts and its string falls. */
const BURST = 0.6;
const QUARTER = Math.PI / 4;

/**
 * A balloon against the ceiling, wandering a little on the air, its string
 * hanging; at the end it bursts and the string drops.
 */
export const balloon: Act = (staging) => {
  const { setting, age, lastsFor, chance } = staging;
  const { room } = setting;
  const made: Made = {
    stuff: 'rubber',
    tint: pick(BALLOON_PAINTS, chance('paint')),
  };
  const at: Vec3 = [
    0.25 + 0.5 * chance('u') + 0.03 * Math.sin(age * 0.11),
    CEILING_HEIGHT - 0.042 - 0.003 * (1 + Math.sin(age * 0.9)),
    0.25 + 0.5 * chance('v') + 0.03 * Math.cos(age * 0.07),
  ];
  const knot = plus(at, [0, -0.03, 0]);
  const burst = age - (lastsFor - BURST);
  if (burst >= 0) {
    const fallen = Math.max(0.003, knot[1] - 2.5 * burst * burst);
    return shown(
      bar(
        room,
        [
          [knot[0], fallen, knot[2]],
          [knot[0] + STRING, fallen, knot[2]],
        ],
        [0.002, 0.002],
        UP,
        THREAD,
      ),
      sounding(staging, 'pop', at, 0.8, [lastsFor - BURST, 0.3]),
    );
  }
  const sway = 0.01 * Math.sin(age * 0.6);
  return shown([
    ...[
      about(UP, age * 0.05),
      turned(about(UP, QUARTER), about(UP, age * 0.05)),
      turned(about([1, 0, 0], QUARTER), about(UP, age * 0.05)),
    ].flatMap((turn) => block(room, at, BALLOON, turn, made)),
    ...bar(
      room,
      [knot, plus(knot, [sway, -STRING, sway / 2])],
      [0.002, 0.002],
      [1, 0, 0],
      THREAD,
    ),
  ]);
};

const CHAIRS = 5;
const SEAT: Made = { stuff: 'plastic', tint: 0x9a_5a_2a };
const LEG: Made = { stuff: 'metal' };

/** A chair of six boxes standing at `at`, looking along `yaw`. */
function chairAt(room: Room, at: Vec3, yaw: number): Quad[] {
  const turn = heading(yaw);
  const part = (offset: Vec3, size: Vec3, made: Made) =>
    block(room, plus(at, turn(offset)), size, turn, made);
  return [
    ...part([0, 0.086, 0], [0.09, 0.008, 0.09], SEAT),
    ...part([-0.041, 0.135, 0], [0.008, 0.09, 0.09], SEAT),
    ...[-1, 1].flatMap((fore) =>
      [-1, 1].flatMap((side) =>
        part([fore * 0.038, 0.041, side * 0.038], [0.008, 0.082, 0.008], LEG),
      ),
    ),
  ];
}

/**
 * Chairs left about the room every which way, which turn, all at once and
 * with one scrape, to face one point — and stay so.
 */
export const chairs: Act = (staging) => {
  const { setting, age, chance } = staging;
  const stare: Vec3 = [chance('u'), 0, chance('v')];
  const turns = 8 + 10 * chance('hold');
  const turnedBy = smooth(ramp(age, turns, turns + 2.5));
  const ring = 2 * Math.PI * chance('yaw');
  return shown(
    Array.from({ length: CHAIRS }, (_, index) => {
      const bearing =
        ring + ((index + 0.5 * chance('spread', index)) * 2 * Math.PI) / CHAIRS;
      const far = lerp(0.17, 0.22, chance('raise', index));
      const at: Vec3 = [
        0.5 + far * Math.cos(bearing),
        0,
        0.5 + far * Math.sin(bearing),
      ];
      const left = 2 * Math.PI * chance('head', index);
      return chairAt(
        setting.room,
        at,
        lerp(left, nearestTurn(left, yawTo(at, stare)), turnedBy),
      );
    }).flat(),
    sounding(staging, 'scrape', [0.5, 0, 0.5], 0.6, [turns, 2.5]),
  );
};
