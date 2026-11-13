import { ramp, smooth } from '@/cube/shared/lib/ease';
import { CEILING_HEIGHT } from '@/cube/shared/lib/room-shape';
import {
  box,
  cross,
  face,
  holeMiddle,
  minus,
  plus,
  times,
  unit,
  UP,
  type Vec3,
  WALL_HALF,
} from '@/cube/entities/world';

import { pick } from '../lib/pick';
import {
  next,
  onSide,
  shutCorners,
  shutSides,
  type Side,
  SIDE_FRAMES,
  sideAt,
  spot,
} from '../lib/side';
import { about, bar, block, forward, tilted } from '../lib/solid';
import { type Act, NOTHING, shown, sounding, type Staging } from './staging';

const DOOR_PAINTS = [0x5a_3a_22, 0x7a_7c_78, 0x2e_4a_3a, 0xc8_c2_b0] as const;
const DARK = 0x01_01_01;

/** A door's leaf, its frame's bar and how far the frame stands off the wall. */
const DOOR = { wide: 0.16, tall: 0.4, jamb: 0.012, proud: 0.01 } as const;
/** How far the leaf swings: a hand's width at the latch. */
const AJAR = 0.02 / DOOR.wide;

/**
 * Where along `side` a door goes: the half of the wall away from the room's
 * hole, whose shelf hangs level with it.
 */
function doorAlong({ setting, chance }: Staging, side: Side): number {
  const { base, along } = SIDE_FRAMES[side];
  const [x, , z] = along;
  const sides = [0.22, 0.78] as const;
  if (setting.hole === null) return pick(sides, chance('spot'));
  const { u, v } = holeMiddle(setting.hole);
  return (u - base[0]) * x + (v - base[2]) * z < 0.5 ? sides[1] : sides[0];
}

/**
 * A door in a wall that had none, opening a hand's width onto the dark,
 * staying so, and shutting.
 */
export const door: Act = (staging) => {
  const { setting, age, chance } = staging;
  const side = sideAt(shutSides(setting), chance('side'));
  if (side === null) return NOTHING;
  const { along, into } = SIDE_FRAMES[side];
  const { room } = setting;
  const left = doorAlong(staging, side) - DOOR.wide / 2;
  const at = (a: number, up: number, out: number): Vec3 =>
    onSide(setting, side, left + a, up, out);
  const swung =
    AJAR *
    (smooth(ramp(age, 4, 6)) - ramp(age, 12, 12.4)) *
    (1 + 0.04 * Math.sin(age * 9));
  const leaf = tilted(along, into, swung);
  const thick = cross(leaf, UP);
  const hinge = at(0, 0, 0.003);
  const paint = pick(DOOR_PAINTS, chance('paint'));
  const post = (a: number) =>
    box(
      at(a, 0, 0),
      [
        times(along, DOOR.jamb),
        [0, DOOR.tall + DOOR.jamb, 0],
        times(into, DOOR.proud),
      ],
      room,
      'trim',
    );
  return shown(
    [
      face(
        at(0, 0, 0.0008),
        times(along, DOOR.wide),
        [0, DOOR.tall, 0],
        room,
        'fabric',
        DARK,
      ),
      ...post(-DOOR.jamb),
      ...post(DOOR.wide),
      ...box(
        at(0, DOOR.tall, 0),
        [times(along, DOOR.wide), [0, DOOR.jamb, 0], times(into, DOOR.proud)],
        room,
        'trim',
      ),
      ...box(
        hinge,
        [
          times(leaf, DOOR.wide),
          [0, DOOR.tall - 0.004, 0],
          times(thick, 0.006),
        ],
        room,
        'wood',
        paint,
      ),
      ...box(
        plus(
          plus(hinge, times(leaf, 0.82 * DOOR.wide)),
          plus([0, 0.2, 0], times(thick, 0.006)),
        ),
        [times(leaf, 0.02), [0, 0.006, 0], times(thick, 0.008)],
        room,
        'metal',
      ),
    ],
    [
      ...sounding(staging, 'creak', hinge, 0.3, [4, 2]),
      ...sounding(staging, 'thud', hinge, 0.5, [12.3, 0.4]),
    ],
  );
};

const JOINTS = 5;
const SEGMENT = 0.068;
/** A folded segment's angle from hanging: nearly flat under the ceiling. */
const FOLDED = 1.48;
const LIMB = { stuff: 'skin', tint: 0x4a_42_46 } as const;

/**
 * Something tall and jointed letting itself down from the ceiling a segment
 * at a time, hanging there, and folding back up at once.
 */
export const unfolding: Act = (staging) => {
  const { setting, age, chance } = staging;
  const plane = forward(2 * Math.PI * chance('yaw'));
  const down = times(UP, -1);
  const out = smooth(ramp(age, 0, 6)) - ramp(age, 12, 13);
  const sway = 0.06 * Math.sin(age * 0.8);
  const anchor: Vec3 = [
    0.3 + 0.4 * chance('u'),
    CEILING_HEIGHT - 0.007,
    0.3 + 0.4 * chance('v'),
  ];
  const reach = (angle: number, long: number) =>
    times(tilted(down, plane, angle), long);
  const joints = [anchor];
  for (let index = 0; index < JOINTS; index += 1) {
    const open = smooth(ramp(out * JOINTS, index, index + 1));
    const fold = (index % 2 === 0 ? 1 : -1) * FOLDED;
    const from = joints.at(-1) ?? anchor;
    joints.push(plus(from, reach(fold * (1 - open) + sway * open, SEGMENT)));
  }
  const across = cross(plane, UP);
  const tip = joints.at(-1) ?? anchor;
  const grasp = smooth(ramp(out, 0.9, 1)) * (0.5 + 0.2 * Math.sin(age * 1.3));
  return shown(
    [
      ...joints
        .slice(1)
        .flatMap((to, index) =>
          bar(
            setting.room,
            [joints[index] ?? anchor, to],
            [0.012, 0.008],
            across,
            LIMB,
          ),
        ),
      ...(grasp > 0
        ? [-1, 0, 1].flatMap((finger) =>
            bar(
              setting.room,
              [tip, plus(tip, reach(sway + finger * grasp, 0.03))],
              [0.004, 0.004],
              across,
              LIMB,
            ),
          )
        : []),
    ],
    [
      ...sounding(staging, 'creak', anchor, 0.4, [0, 6]),
      ...sounding(staging, 'scrape', anchor, 0.5, [12, 1]),
    ],
  );
};

/** The side of the piece of corner that comes loose, and its gap to the walls. */
const CHUNK = 0.12;
const SEAM = 0.0008;

/**
 * The room's own corner under the ceiling coming loose: a piece of it drifts
 * out into the room, showing nothing behind, hangs, and snaps back.
 */
export const corner: Act = (staging) => {
  const { setting, age, chance } = staging;
  const side = sideAt(shutCorners(setting), chance('side'));
  if (side === null) return NOTHING;
  const beside = next(side);
  const loose = smooth(ramp(age, 2, 10)) - ramp(age, 17, 17.5);
  if (loose <= 0) return NOTHING;
  const { room } = setting;
  const inward = SIDE_FRAMES[side].into;
  const sideways = SIDE_FRAMES[beside].into;
  const top = CEILING_HEIGHT - SEAM;
  const nook = plus(
    spot(side, 1, top, WALL_HALF + SEAM),
    times(sideways, WALL_HALF + SEAM),
  );
  const drift = plus(plus(inward, sideways), [0, -1, 0]);
  const home = plus(nook, times(drift, CHUNK / 2));
  const tremble = 1 + 0.03 * Math.sin(age * 11);
  const dark = (from: Vec3, a: Vec3, b: Vec3) =>
    face(from, a, b, room, 'fabric', DARK);
  const rise: Vec3 = [0, CHUNK, 0];
  return shown(
    [
      dark(
        onSide(setting, side, 1 - WALL_HALF - CHUNK, top - CHUNK, SEAM / 2),
        times(SIDE_FRAMES[side].along, CHUNK),
        rise,
      ),
      dark(
        onSide(setting, beside, WALL_HALF, top - CHUNK, SEAM / 2),
        times(SIDE_FRAMES[beside].along, CHUNK),
        rise,
      ),
      dark(
        minus(nook, times(plus(inward, sideways), SEAM / 2)),
        times(inward, CHUNK),
        times(sideways, CHUNK),
      ),
      ...block(
        room,
        plus(home, times(drift, 0.05 * loose * tremble)),
        [CHUNK, CHUNK, CHUNK],
        about(unit(minus(inward, sideways)), 0.2 * loose),
        { stuff: 'wall' },
      ),
    ],
    [
      ...sounding(staging, 'creak', home, 0.5, [2, 8]),
      ...sounding(staging, 'thud', home, 0.7, [17.4, 0.5]),
    ],
  );
};
