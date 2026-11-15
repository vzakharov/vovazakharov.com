import type { Angled } from '@/kernel/shared/typings';

import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import { ROOM_METRES, WALL_HALF } from '@/cube/shared/lib/room-shape';
import type { Surface } from '@/cube/shared/lib/surface';
import { scaled as times, type Vec3 } from '@/cube/shared/lib/vec';

import { maze } from './maze';
import { planted } from './planted';
import { portalAt } from './portals';
import { plus, type Quad } from './quad';
import { type DoorWall, leaning, solid, wallFrame } from './wall-frame';

/** Into the east or south room of a wall (1), or the west or north one (-1). */
type Toward = { toward: 1 | -1 };

/**
 * A door's leaf, turned `angle` radians off its wall about its hinge,
 * `toward` the room it swings into.
 */
export type Leaf = Toward & Angled;

/** A door standing open: its wall and its leaf as it stands. */
export type Ajar = DoorWall & Leaf;

/** A wall seen from one of its rooms, `toward` the other. */
export type Facing = DoorWall & Toward;

/** One metre, in room sides. */
const METRE = 1 / ROOM_METRES;

const WHITE = 0xe6_e4_da;
const CHROME = 0xb8_bc_c0;
const STEEL = 0x8a_8a_84;
const PAPER = 0xe8_e6_dc;
const LEAF_PAINTS = [
  0x6a_7a_6a, 0x7a_5a_3a, 0xc8_c0_a8, 0x4a_5a_7a, 0x7a_2a_2a,
] as const;

/** A door's sizes in metres: its frame's lining of the cut, and its leaf. */
const DOOR = {
  /** The frame's width on each jamb and the head. */
  frame: 0.07,
  /** How far the frame stands proud of each face of its wall. */
  proud: 0.025,
  /** The leaf's thickness. */
  thick: 0.035,
  /** The leaf's clearance from the floor and the head. */
  clear: 0.005,
} as const;

const Looks = roll.struct({
  door: roll.over(
    roll.key({ n: roll.int, x: roll.big, y: roll.big }),
    roll.over(
      roll.key(['east', 'south']),
      roll.struct({ paint: roll.pick(LEAF_PAINTS.length), hand: roll.pick(2) }),
    ),
  ),
  portal: roll.struct({ paint: roll.pick(LEAF_PAINTS.length) }),
});

const looks = rollWith(Looks, pathHash(planted.seed));

const rolled = maze(planted.seed);

const paintAt = (index: number): number => LEAF_PAINTS[index] ?? LEAF_PAINTS[0];

/**
 * How the door in `wall` looks, the same to every eye: its leaf's paint, and
 * the jamb it hangs on, the doorway's north or west (`from`) or its south or
 * east (`to`), its handle by the other. A portal's two doors are one leaf
 * seen from its two sides, whichever pair the minute makes of them: each
 * hangs at the left of one walking east or south through it, in the one
 * paint every portal shares.
 */
export function doorLook(wall: DoorWall): {
  paint: number;
  hinge: 'from' | 'to';
} {
  const { n, x, y, isEast } = wall;
  if (portalAt(rolled, wall) !== null) {
    return {
      paint: paintAt(looks.portal.paint),
      hinge: isEast ? 'from' : 'to',
    };
  }
  const { paint, hand } = looks.door
    .at({ n, x, y })
    .at(isEast ? 'east' : 'south');
  return { paint: paintAt(paint), hinge: hand === 0 ? 'from' : 'to' };
}

/** `DOOR.frame` in room sides. */
const JAMB_WIDE = DOOR.frame * METRE;

/** The leaf's width, in room sides: the cut less its frame on both jambs. */
const LEAF_WIDE = DOORWAY_CUT.to - DOORWAY_CUT.from - 2 * JAMB_WIDE;

/**
 * Where the leaf of `ajar` stands, in its wall's frame: its hinge `along`
 * the wall, and its free edge `along` and `across` it.
 */
export function leafLine(ajar: Ajar): {
  hinge: number;
  edge: readonly [number, number];
} {
  const { hinge, run } = swing(ajar);
  return {
    hinge,
    edge: [hinge + run[0] * LEAF_WIDE, run[1] * LEAF_WIDE],
  };
}

/** The leaf's hinge along its wall, and the unit run from it to its free edge, along and across. */
function swing(ajar: Ajar): {
  hinge: number;
  run: readonly [number, number];
} {
  const atFrom = doorLook(ajar).hinge === 'from';
  const { from, to } = DOORWAY_CUT;
  const hinge = atFrom ? from + JAMB_WIDE : to - JAMB_WIDE;
  return {
    hinge,
    run: [
      (atFrom ? 1 : -1) * Math.cos(ajar.angle),
      ajar.toward * Math.sin(ajar.angle),
    ],
  };
}

/** How far a door's frame reaches either side of its wall's line, in room sides. */
export const DOORWAY_DEEP = WALL_HALF + DOOR.proud * METRE;

/**
 * The frame lining `wall`'s doorway, each quad in the frame of the room it
 * faces into: a white jamb either side and a head, standing proud of both
 * faces of the wall.
 */
export function doorFrame(wall: DoorWall): Quad[] {
  const { run, at, own } = wallFrame(wall);
  const { from, to, height } = DOORWAY_CUT;
  const deep = DOORWAY_DEEP;
  const block = (a0: number, a1: number, u0: number, u1: number) =>
    solid(
      at(a0, -deep, u0),
      [run(a1 - a0, 0, 0), run(0, 2 * deep, 0), run(0, 0, u1 - u0)],
      'wood',
      WHITE,
    );
  const head = height - JAMB_WIDE;
  return own([
    ...block(from, from + JAMB_WIDE, 0, head),
    ...block(to - JAMB_WIDE, to, 0, head),
    ...block(from, to, head, height),
  ]);
}

/**
 * The leaf hung in `wall`'s doorway as `doorLook` has it, turned as `leaf` has
 * it, each quad in the frame of the room it stands in: painted wood with, on
 * each face, a chrome lever on its backplate by the free edge, a kick plate
 * and a number plate.
 */
export function doorLeaf(wall: DoorWall, leaf: Leaf): Quad[] {
  const { run, at, own } = wallFrame(wall);
  const { hinge, run: out } = swing({ ...wall, ...leaf });
  const { paint } = doorLook(wall);
  // Along the leaf from its hinge, through it, and up it, a metre each.
  const p = run(out[0] * METRE, out[1] * METRE, 0);
  const q = run(-out[1] * METRE, out[0] * METRE, 0);
  const r = run(0, 0, METRE);
  const base = at(hinge, 0, 0);
  const point = (along: number, through: number, up: number): Vec3 =>
    plus(plus(plus(base, times(p, along)), times(q, through)), times(r, up));
  const wide = LEAF_WIDE / METRE;
  const tall = DOORWAY_CUT.height / METRE - DOOR.frame - 2 * DOOR.clear;
  const half = DOOR.thick / 2;
  /** A box of the leaf's, from and to along, through and up it, in metres. */
  const block = (
    [a0, a1]: readonly [number, number],
    [t0, t1]: readonly [number, number],
    [u0, u1]: readonly [number, number],
    surface: Surface,
    tint: number,
  ) =>
    solid(
      point(a0, t0, u0),
      [times(p, a1 - a0), times(q, t1 - t0), times(r, u1 - u0)],
      surface,
      tint,
    );
  const faced = (sign: -1 | 1): Quad[] => {
    const skin = sign * (half + 0.001);
    const plate = (
      [a0, a1]: readonly [number, number],
      [u0, u1]: readonly [number, number],
      surface: Surface,
      tint: number,
    ) =>
      leaning(
        point(a0, skin, u0),
        [times(p, a1 - a0), times(r, u1 - u0)],
        times(q, sign),
        surface,
        tint,
      );
    const latch = wide - 0.115;
    return [
      ...block(
        [latch - 0.065, latch + 0.065],
        sign < 0 ? [-half - 0.05, -half] : [half, half + 0.05],
        [1, 1.025],
        'metal',
        CHROME,
      ),
      plate([latch - 0.03, latch + 0.03], [0.93, 1.11], 'metal', CHROME),
      plate([0.005, wide - 0.005], [DOOR.clear, 0.2], 'metal', STEEL),
      plate([wide / 2 - 0.1, wide / 2 + 0.1], [1.55, 1.62], 'paper', PAPER),
    ];
  };
  return own([
    ...block(
      [0, wide],
      [-half, half],
      [DOOR.clear, DOOR.clear + tall],
      'wood',
      paint,
    ),
    ...faced(-1),
    ...faced(1),
  ]);
}
