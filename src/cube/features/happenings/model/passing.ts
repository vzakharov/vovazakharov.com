import type { Quad, Room, Vec3 } from '@/cube/entities/world';

import { lerp, pick, ramp, smooth } from '../lib/ease';
import {
  facing,
  inLane,
  inset,
  onSide,
  openSides,
  type Side,
  SIDE_FRAMES,
  SIDES,
} from '../lib/side';
import {
  about,
  added,
  bar,
  between,
  block,
  crossed,
  distance,
  forward,
  heading,
  type Made,
  scaled,
  type Turn,
  turned,
  UP,
  yawTo,
} from '../lib/solid';
import { type Act, shown, sounding, type Staging } from './staging';

const BALL_PAINTS = [0xc0_28_1e, 0xd9_a4_1c, 0x1e_5a_b4, 0xe8_e4_d8] as const;

/** A ball's radius in room sides: a football on its own floor. */
const BALL = 0.022;

const EIGHTH = Math.PI / 4;

/** Three cubes inside one sphere, each turned its own way: a ball of boxes. */
function ballAt(
  room: Room,
  centre: Vec3,
  radius: number,
  spin: Turn,
  made: Made,
): Quad[] {
  const side = (2 * radius) / Math.sqrt(3);
  const size: Vec3 = [side, side, side];
  return [
    spin,
    turned(about([1, 0, 0], EIGHTH), about(UP, EIGHTH), spin),
    turned(about([0, 0, 1], EIGHTH), about([1, 0, 0], EIGHTH), spin),
  ].flatMap((turn) => block(room, centre, size, turn, made));
}

/** The side a thing crossing the room starts from: an open way through first. */
function crossingFrom({ setting, chance }: Staging): Side {
  const ways = (side: Side) =>
    Number(!setting.closed[side]) + Number(!setting.closed[facing(side)]);
  const most = Math.max(...SIDES.map((side) => ways(side)));
  const best = SIDES.filter((side) => ways(side) === most);
  return best[Math.floor(chance('side') * best.length)] ?? 0;
}

/**
 * A ball rolling through, side to side: on out of an open side, or into a
 * wall, off it a little and to rest.
 */
export const ball: Act = (staging) => {
  const { setting, age, lastsFor, chance } = staging;
  const from = crossingFrom(staging);
  const to = facing(from);
  const start = onSide(setting, from, inLane(chance('spot')), BALL, BALL);
  const run = 1 - inset(setting, from) - inset(setting, to) - 2 * BALL;
  const stopped = setting.closed[to];
  const arrives = 0.7 * lastsFor;
  const rebound =
    0.12 * Math.sin(Math.PI * ramp(age, arrives, lastsFor)) * (stopped ? 1 : 0);
  const rolled =
    run * (stopped ? ramp(age, 0, arrives) - rebound : age / lastsFor);
  const { into } = SIDE_FRAMES[from];
  return shown(
    ballAt(
      setting.room,
      added(start, scaled(into, rolled)),
      BALL,
      about(crossed(UP, into), rolled / BALL),
      { stuff: 'rubber', tint: pick(BALL_PAINTS, chance('paint')) },
    ),
    stopped
      ? sounding(staging, 'thud', added(start, scaled(into, run)), 0.35, [
          arrives,
          0.4,
        ])
      : [],
  );
};

/** A sheet's sides in room sides: A4 on its own floor. */
const SHEET: Vec3 = [0.042, 0.0004, 0.06];
const GUSTS = 3;

/** A sheet of paper sliding over the floor, a gust at a time. */
export const paper: Act = (staging) => {
  const { setting, age, lastsFor, chance } = staging;
  const gust = (age / lastsFor) * GUSTS;
  const blown = smooth((gust % 1) * 2.2);
  const slid = (Math.floor(gust) + blown) / GUSTS;
  const from: Vec3 = [inLane(chance('u')), 0, 0.2 + 0.6 * chance('v')];
  const to: Vec3 = [inLane(chance('spot')), 0, 0.2 + 0.6 * chance('way')];
  const lift = 0.002 + 0.008 * Math.sin(Math.PI * blown);
  const at = added(between(from, to, slid), scaled(UP, lift));
  const yaw = 2 * Math.PI * chance('yaw') + 2.5 * slid;
  return shown(
    block(setting.room, at, SHEET, heading(yaw), { stuff: 'paper' }),
    Array.from({ length: GUSTS }, (_, index) =>
      sounding(staging, 'rustle', at, 0.2, [(index * lastsFor) / GUSTS, 1.2]),
    ).flat(),
  );
};

const CAT_PAINTS = [0x0c_0c_0e, 0xb0_5a_1c, 0x5a_5a_5e, 0xd8_d4_cc] as const;

/** A cat's pace in room sides a second: a walk of a metre a second. */
const CAT_PACE = 0.2;
/** How far in from a side a cat keeps its middle: its own length and a bit. */
const CAT_CLEAR = 0.07;
const SETTLING = 0.6;
/** How far over the floor a leg's foot is, so a leg swung keeps its corners above it. */
const PAW = 0.003;

/** How a cat is at an instant: where, which way, how far sat, how far walked. */
type CatPose = { at: Vec3; facingYaw: number; sat: number; trod: number };

function catAt(
  room: Room,
  { at, facingYaw: yaw, sat, trod: walked }: CatPose,
  look: number,
  made: Made,
): Quad[] {
  const ahead = forward(yaw);
  const right = forward(yaw + Math.PI / 2);
  const rear = added(
    added(at, scaled(ahead, lerp(-0.035, -0.018, sat))),
    scaled(UP, lerp(0.04, 0.022, sat)),
  );
  const chest = added(
    added(at, scaled(ahead, lerp(0.035, 0.015, sat))),
    scaled(UP, lerp(0.04, 0.062, sat)),
  );
  const turn = heading(yaw + look * sat);
  const skull = added(chest, added(scaled(ahead, 0.012), scaled(UP, 0.018)));
  const ears = [-1, 1].flatMap((side) =>
    block(
      room,
      added(skull, turn([0, 0.016, side * 0.009])),
      [0.006, 0.01, 0.006],
      turn,
      made,
    ),
  );
  const stride = 0.012 * (1 - sat) * Math.sin(walked * 90);
  const legs = [chest, rear].flatMap((joint, pair) =>
    [-1, 1].flatMap((side) => {
      const top = added(joint, scaled(right, side * 0.01));
      const swing = stride * side * (pair === 0 ? 1 : -1);
      const foot: Vec3 = [
        top[0] + ahead[0] * swing,
        PAW,
        top[2] + ahead[2] * swing,
      ];
      return bar(room, [foot, top], [0.008, 0.008], right, made);
    }),
  );
  const sway = 0.012 * Math.sin(walked * 40);
  const tip = between(
    added(
      rear,
      added(added(scaled(ahead, -0.02), scaled(UP, 0.05)), scaled(right, sway)),
    ),
    [
      rear[0] - ahead[0] * 0.05 + right[0] * 0.02,
      0.006,
      rear[2] - ahead[2] * 0.05 + right[2] * 0.02,
    ],
    sat,
  );
  return [
    ...bar(room, [rear, chest], [0.03, 0.03], right, made),
    ...block(room, skull, [0.026, 0.024, 0.028], turn, made),
    ...ears,
    ...legs,
    ...bar(room, [rear, tip], [0.007, 0.007], right, made),
  ];
}

/** Where a cat comes in or leaves by: an open side's middle where there is one. */
function catDoor(staging: Staging, draw: 'side' | 'way'): Vec3 {
  const { setting, chance } = staging;
  const open = openSides(setting);
  const sides = open.length > 0 ? open : SIDES;
  const side = sides[Math.floor(chance(draw) * sides.length)] ?? 0;
  return onSide(setting, side, inLane(chance(draw, 1)), 0, CAT_CLEAR);
}

/**
 * A cat coming in, sitting a while in the middle of the room looking at
 * something that is not the visitor, and going out.
 */
export const cat: Act = (staging) => {
  const { setting, age, lastsFor, chance } = staging;
  const enters = catDoor(staging, 'side');
  const leaves = catDoor(staging, 'way');
  const seat: Vec3 = [inLane(chance('u')), 0, inLane(chance('v'))];
  const comes = distance(enters, seat) / CAT_PACE;
  const goes = lastsFor - distance(seat, leaves) / CAT_PACE;
  const inward = yawTo(enters, seat);
  const outward = yawTo(seat, leaves);
  const sat =
    smooth(ramp(age, comes, comes + SETTLING)) *
    (1 - smooth(ramp(age, goes - 2 * SETTLING, goes - SETTLING)));
  const pose: CatPose =
    age < comes
      ? {
          at: between(enters, seat, age / comes),
          facingYaw: inward,
          sat: 0,
          trod: age * CAT_PACE,
        }
      : age < goes
        ? {
            at: seat,
            facingYaw: lerp(
              inward,
              outward,
              smooth(ramp(age, goes - SETTLING, goes)),
            ),
            sat,
            trod: 0,
          }
        : {
            at: between(seat, leaves, ramp(age, goes, lastsFor)),
            facingYaw: outward,
            sat: 0,
            trod: (age - goes) * CAT_PACE,
          };
  return shown(
    catAt(setting.room, pose, 2.4 * (chance('head') - 0.5), {
      stuff: 'fabric',
      tint: pick(CAT_PAINTS, chance('paint')),
    }),
    chance('hold') < 0.4
      ? sounding(staging, 'mew', seat, 0.3, [comes + 2, 0.7])
      : [],
  );
};
