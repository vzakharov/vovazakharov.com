import type { Seeded } from '@/kernel/shared/typings';

import {
  add,
  at,
  ellipse,
  ink,
  INK_PALETTE,
  limb,
  mix,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
  sub,
  times,
} from '@/clip/shared/ink';

import { SPOON_PALETTE } from './palette-spoon';

/** Where the seated bunny is on the stage, its units the ghost bunny's own. */
const SEATED_AT = { x: 560, y: 260, scale: 0.6 } as const;

/** How the seated bunny is caught: everything a frame of its supper varies. */
export type Seated = Seeded & {
  /** The spoon, 0 down at whatever it eats and 1 at its mouth. */
  scoop: number;
  /** How far its shoulders are drawn up, 0 to 1. */
  hunch: number;
  /** Where its head's centre sits, hunched low or sat up. */
  headAt: number;
  /** Its ears' sway, -1 to 1. */
  droop: number;
  /** 0 at its supper; 1 holds the spoon up beside its head, in sight. */
  brandished: number;
};

export const PAPER_EDGE = 6;
// What it eats is in front of it, hidden by its own back: the paw goes down
// to it and up to its mouth out of sight, and only the elbow working at its
// side and the spoon's handle past its head show that it eats.
const PAW_DOWN: Point = [70, 360];
const PAW_UP: Point = [90, 104];
const ELBOW_DOWN: Point = [196, 300];
const ELBOW_UP: Point = [250, 118];
const SHOULDER_RIGHT: Point = [96, 100];
// Raised, the paw holds the spoon up past its cheek.
const RAISED_PAW: Point = [156, 150];
const RAISED_ELBOW: Point = [214, 300];
const RAISED_TIP: Point = [174, 66];
const ARM_WIDTH = 30;
/** How far the handle runs on past the paw, as a multiple of the paw-to-bowl span. */
const HANDLE = 2.6;
// The chair it sits on: its back's top rail, and its posts' half-spread.
const RAIL_TOP = 330;
const RAIL_DEPTH = 56;
const POSTS = 150;

export const SPOON_HEAD_D =
  'M -84,1 C -90,-69 -50,-85 0,-85 C 50,-85 90,-69 84,1 C 82,70 44,112 0,112 C -44,112 -82,70 -84,1 Z';
const HEAD = path(SPOON_HEAD_D);

/** An ear, `side` -1 or 1, its tip pushed sideways by `bend`. */
export const ear = (side: number, bend: number): Path =>
  path(
    `M ${side * 22},-59 C ${side * 6},-159 ${side * 20},-269 ${side * 44 + bend},-309 C ${side * 70 + bend},-269 ${side * 62},-149 ${side * 50},-59 Z`,
  );

/** The sitting body from behind, broad and round-shouldered, drawn up by `hunch`. */
function body(hunch: number): Path {
  const s = 66 - 34 * hunch;
  return path(
    `M -40,${s - 18} C -120,${s - 14} -160,${s + 50} -158,${s + 170} C -156,420 -150,640 -150,900 L 150,900 C 150,640 156,420 158,${s + 170} C 160,${s + 50} 120,${s - 14} 40,${s - 18} Z`,
  );
}

const HEART = path(
  `M 0,${RAIL_TOP + 46} C -30,${RAIL_TOP + 24} -22,${RAIL_TOP + 4} 0,${RAIL_TOP + 16} C 22,${RAIL_TOP + 4} 30,${RAIL_TOP + 24} 0,${RAIL_TOP + 46} Z`,
);

const bar = (left: number, top: number, right: number, bottom: number): Path =>
  polygon([
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ]);

/** The chair's back across its own: two posts and a rail with a heart cut through it. */
function chairBack(pen: Pen, seed: number): void {
  const wood = { fill: SPOON_PALETTE.chair, width: PAPER_EDGE, seed };
  for (const side of [-1, 1]) {
    const x = side * POSTS;
    ink(pen, bar(x - 17, RAIL_TOP - 24, x + 17, 900), wood);
  }
  ink(pen, bar(-POSTS - 4, RAIL_TOP, POSTS + 4, RAIL_TOP + RAIL_DEPTH), wood);
  ink(pen, HEART, { fill: SPOON_PALETTE.paperBack, width: 4, seed: seed + 1 });
  ink(pen, bar(-POSTS, RAIL_TOP + 150, POSTS, RAIL_TOP + 180), {
    fill: SPOON_PALETTE.chairDark,
    width: PAPER_EDGE,
    seed: seed + 2,
  });
}

// The crease down the paper it was cut from, and the two strips of tape that
// held it to the wall.
const CREASE = path('M 12,150 L -16,260 L 14,370 L -12,480 L 8,600');
const TAPE: readonly Path[] = [
  polygon([
    [-70, 190],
    [-18, 172],
    [-12, 196],
    [-64, 214],
  ]),
  polygon([
    [24, 330],
    [78, 344],
    [72, 368],
    [18, 354],
  ]),
];

/**
 * A spoon held at `paw`, its `bowl` full of what it scooped; the
 * handle runs on past the paw.
 */
function spoon(pen: Pen, paw: Point, bowl: Point, seed: number): void {
  const end = add(paw, times(sub(paw, bowl), HANDLE - 1));
  const shaft = polygon([end, bowl], 'open');
  ink(pen, shaft, { stroke: INK_PALETTE.ink, width: 14, seed });
  ink(pen, shaft, { stroke: SPOON_PALETTE.spoon, width: 6, seed });
  ink(pen, ellipse(bowl, 15, 11), {
    fill: SPOON_PALETTE.spoon,
    width: 4,
    seed: seed + 1,
  });
  ink(pen, ellipse([bowl[0], bowl[1] - 2], 9, 6), {
    fill: SPOON_PALETTE.broth,
    stroke: null,
    seed: seed + 2,
  });
}

type Reach = { elbow: Point; paw: Point; bowl: Point };

/** Where the elbow, the paw and the spoon's bowl are, `scoop` of the way to its mouth. */
function spoonAt(scoop: number): Reach {
  const paw = mix(PAW_DOWN, PAW_UP, scoop);
  // The elbow is thrown out and up in an arc rather than straight.
  const elbow = add(mix(ELBOW_DOWN, ELBOW_UP, scoop), [
    Math.sin(scoop * Math.PI) * 30,
    0,
  ]);
  const reach = mix([-10, 60], [-50, 40], scoop);
  return { elbow, paw, bowl: add(paw, reach) };
}

/** The spoon arm, from its shoulder through `elbow` to the spoon in its `paw`. */
function spoonArm(pen: Pen, { elbow, paw, bowl }: Reach, seed: number): void {
  spoon(pen, paw, bowl, seed);
  limb(
    pen,
    [SHOULDER_RIGHT, elbow, paw],
    SPOON_PALETTE.paperBack,
    ARM_WIDTH,
    seed + 10,
  );
  ink(pen, ellipse(paw, 24, 20), {
    fill: SPOON_PALETTE.paperBack,
    width: PAPER_EDGE,
    seed: seed + 11,
  });
}

/** The back of its head: the paper's blank side, and its ears from behind. */
export function headBack(pen: Pen, droop: number, seed: number): void {
  const style = { fill: SPOON_PALETTE.paperBack, width: PAPER_EDGE, seed };
  for (const side of [-1, 1]) {
    ink(pen, ear(side, side * 34 + side * droop * 16), style);
  }
  ink(pen, HEAD, style);
  ink(pen, path('M -30,-60 C -10,-20 -24,30 -4,96'), {
    stroke: SPOON_PALETTE.paperShade,
    width: 3,
    seed: seed + 1,
  });
}

/**
 * The bunny at its supper from behind, the spoon at `scoop`, and `head` drawn
 * in its place with the origin at the head's centre. At its supper the arm
 * works behind its back and head; brandished, it comes round in front of them.
 */
export function seated(pen: Pen, pose: Seated, head: () => void): void {
  const { scoop, hunch, headAt, seed, brandished } = pose;
  const reach = spoonAt(scoop);
  const arm: Reach = {
    elbow: mix(reach.elbow, RAISED_ELBOW, brandished),
    paw: mix(reach.paw, RAISED_PAW, brandished),
    bowl: mix(reach.bowl, RAISED_TIP, brandished),
  };
  const shown = brandished > 0;
  at(pen, SEATED_AT, () => {
    if (!shown) spoonArm(pen, arm, seed + 20);
    // The other arm rests on the table, only its elbow showing.
    limb(
      pen,
      [
        [-70, 108],
        [-204, 300],
        [-110, 380],
      ],
      SPOON_PALETTE.paperBack,
      ARM_WIDTH,
      seed + 60,
    );
    ink(pen, body(hunch), {
      fill: SPOON_PALETTE.paperBack,
      width: PAPER_EDGE,
      seed: seed + 70,
    });
    ink(pen, CREASE, {
      stroke: INK_PALETTE.ink,
      width: 2.5,
      alpha: 0.3,
      seed: seed + 71,
    });
    for (const [n, strip] of TAPE.entries()) {
      ink(pen, strip, {
        fill: SPOON_PALETTE.lamp,
        width: 2,
        alpha: 0.55,
        seed: seed + 72 + n,
      });
    }
    chairBack(pen, seed + 80);
    if (shown) spoonArm(pen, arm, seed + 20);
    at(pen, { y: headAt }, head);
  });
}
