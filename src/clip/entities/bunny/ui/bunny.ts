import type { Seeded } from '@/kernel/shared/typings';

import {
  at,
  ellipse,
  ink,
  INK_PALETTE,
  type InkStyle,
  inLayer,
  noise,
  type Path,
  path,
  type Pen,
  type Place,
  type Point,
} from '@/clip/shared/ink';

import {
  ARM_JOINTS,
  type Arms,
  type BunnyLook,
  FEET_Y,
  HELD_AT,
  lookAt,
  SHOULDER,
} from '../model/pose';
import { BUNNY_PALETTE } from './palette-bunny';

/** How the bunny is drawn; everything left out follows from `nearness`. */
export type BunnyDrawing = Place &
  Partial<BunnyLook> &
  Partial<Seeded> & {
    /**
     * How near it has come, in `[0, 1]`: size, grin, eyes and glow follow
     * unless set. 0.3 by default. `scale` multiplies the size it gives.
     */
    nearness?: number;
    arms?: Arms;
    /** See-through as one piece, 0 to 1. */
    opacity?: number;
    /** `shadow` is a flat dark silhouette, for casting on a wall. */
    rendering?: 'paper' | 'shadow';
    /** How much it sways and its ears droop and lift; 0 holds it still. */
    sway?: number;
    /** Drawn between its paws in the `hold` pose, origin at the held thing's centre. */
    held?: () => void;
  };

const HEAD = path(
  'M -84,1 C -90,-69 -50,-85 0,-85 C 50,-85 90,-69 84,1 C 82,70 44,112 0,112 C -44,112 -82,70 -84,1 Z',
);
const BODY = path(
  'M -46,90 C -88,200 -96,420 -70,560 C -62,602 -18,606 -6,580 L 0,566 L 6,580 C 18,606 62,602 70,560 C 96,420 88,200 46,90 Z',
);
// The crease down the paper it was cut from.
const CREASE = path('M -20,140 L 14,240 L -18,350 L 12,460 L -6,560');
const NOSE = path('M -8,17 L 8,17 L 0,27 Z');
const EYE_X = 36;
const EYE_Y = -5;
const BUTTON = ellipse([0, 0], 17);
const BUTTON_HOLES: readonly Point[] = [
  [-5, -5],
  [5, -5],
  [-5, 5],
  [5, 5],
];
const ARM_WIDTH = 17;
const STITCHES = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const OUTLINE = 6;

/** An ear, `side` -1 or 1, its tip pushed sideways by `bend`. */
function ear(side: number, bend: number): Path {
  const s = side;
  return path(
    `M ${s * 22},-59 C ${s * 6},-159 ${s * 20},-269 ${s * 44 + bend},-309 C ${s * 70 + bend},-269 ${s * 62},-149 ${s * 50},-59 Z`,
  );
}
const earLining = (side: number, bend: number): Path =>
  path(
    `M ${side * 34},-79 C ${side * 26},-159 ${side * 34},-239 ${side * 44 + bend * 0.8},-281`,
  );

/** An arm from the shoulder on `side` through its pose's elbow to the paw. */
function armPath(
  side: number,
  arms: Arms,
  lift: number,
): readonly [Path, Point] {
  const [[ex, ey], [px, py]] = ARM_JOINTS[arms];
  const paw: Point = [side * px, py + lift];
  return [
    [
      { kind: 'M', points: [[side * SHOULDER[0], SHOULDER[1]]] },
      { kind: 'Q', points: [[side * ex, ey + lift / 2], paw] },
    ],
    paw,
  ];
}

/** The grin: a stitched line at 0, a mouth sewn shut over a dark gap at 1. */
function mouth(grin: number): { lips: Path; gap: Path; stitches: Path } {
  const half = 26 + 32 * grin;
  const top = 44;
  const sag = 8 + 10 * grin;
  const drop = 34 * grin;
  const upper = (x: number) => top + sag * (1 - (x / half) ** 2);
  const lower = (x: number) => upper(x) + drop * (1 - (x / half) ** 2);
  const lips: Path = [
    { kind: 'M', points: [[-half, top]] },
    {
      kind: 'Q',
      points: [
        [0, top + sag * 2],
        [half, top],
      ],
    },
  ];
  const gap: Path = [
    ...lips,
    {
      kind: 'Q',
      points: [
        [0, top + (sag + drop) * 2],
        [-half, top],
      ],
    },
    { kind: 'Z', points: [] },
  ];
  const stitches: Path = STITCHES.flatMap((n) => {
    const x = (n / 6) * half;
    return [
      { kind: 'M', points: [[x, upper(x) - 7]] },
      { kind: 'L', points: [[x, lower(x) + 7]] },
    ] as const;
  });
  return { lips, gap, stitches };
}

// How far an eye's light spills round it.
const GLOW_REACH = 36;

/** A button gone hot: a dark socket with light pouring out of its middle. */
function glowingEye(pen: Pen, x: number, seed: number): void {
  const { ctx } = pen;
  ink(pen, ellipse([x, EYE_Y], 19), {
    fill: BUNNY_PALETTE.button,
    width: 4,
    seed,
  });
  const halo = ctx.createRadialGradient(x, EYE_Y, 3, x, EYE_Y, GLOW_REACH);
  halo.addColorStop(0, BUNNY_PALETTE.glowCore);
  halo.addColorStop(0.3, BUNNY_PALETTE.glow);
  halo.addColorStop(1, `${BUNNY_PALETTE.glow}00`);
  ctx.fillStyle = halo;
  ctx.fillRect(
    x - GLOW_REACH,
    EYE_Y - GLOW_REACH,
    GLOW_REACH * 2,
    GLOW_REACH * 2,
  );
}

function buttonEye(pen: Pen, x: number, seed: number): void {
  at(pen, { x, y: EYE_Y }, () => {
    ink(pen, BUTTON, { fill: BUNNY_PALETTE.button, width: 4, seed });
    const { ctx } = pen;
    ctx.fillStyle = BUNNY_PALETTE.thread;
    for (const [hx, hy] of BUTTON_HOLES) {
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function aura(pen: Pen, strength: number): void {
  const { ctx } = pen;
  ctx.save();
  ctx.translate(0, 240);
  ctx.scale(1, 2.2);
  const glow = ctx.createRadialGradient(0, 0, 40, 0, 0, 220);
  glow.addColorStop(0, BUNNY_PALETTE.aura);
  glow.addColorStop(1, `${BUNNY_PALETTE.aura}00`);
  ctx.globalAlpha *= 0.5 * strength;
  ctx.fillStyle = glow;
  ctx.fillRect(-240, -240, 480, 480);
  ctx.restore();
}

/**
 * The ghost bunny off the wallpaper: paper-flat, button-eyed, stitched grin,
 * too long everywhere. Its place is its head's centre; it stands on feet
 * 600 of its units below that, and sways about them.
 */
export function bunny(pen: Pen, drawing: BunnyDrawing = {}): void {
  const {
    nearness = 0.3,
    scale = 1,
    sway = 1,
    seed = 0,
    bunnyScale,
    grin,
    eyes,
    aura: glow,
    arms = 'down',
    opacity = 1,
    rendering = 'paper',
    held,
    x = 0,
    y = 0,
    rot = 0,
    flip = false,
  } = drawing;
  const near = lookAt(nearness);
  const look: BunnyLook = {
    bunnyScale: bunnyScale ?? near.bunnyScale,
    grin: grin ?? near.grin,
    eyes: eyes ?? near.eyes,
    aura: glow ?? near.aura,
  };
  const shadow = rendering === 'shadow';
  const fill = shadow ? BUNNY_PALETTE.shadow : BUNNY_PALETTE.paper;
  const stroke = shadow ? null : INK_PALETTE.ink;
  const phase = noise(seed, 0) * Math.PI;
  const swing = Math.sin((pen.t / 4.7) * Math.PI * 2 + phase) * sway;
  const droop = Math.sin((pen.t / 3.1) * Math.PI * 2 + phase * 2) * sway;
  const place = { x, y, rot, flip, scale: look.bunnyScale * scale };
  inLayer(pen, opacity, (layer) => {
    at(layer, place, () => {
      const { ctx } = layer;
      // Swayed about its feet, so the head travels and the feet stay put.
      ctx.translate(0, FEET_Y);
      ctx.rotate((swing * 1.8 * Math.PI) / 180);
      ctx.translate(0, -FEET_Y);
      if (!shadow && look.aura > 0) aura(layer, look.aura);
      const style = { fill, stroke, width: OUTLINE, seed };
      for (const side of [-1, 1]) {
        const bend = side * 34 + side * droop * 14;
        ink(layer, ear(side, bend), style);
        if (!shadow) {
          ink(layer, earLining(side, bend), {
            stroke: BUNNY_PALETTE.pink,
            width: 9,
            seed,
          });
        }
      }
      const lift = arms === 'down' ? 0 : swing * 6;
      const paws = [-1, 1].map((side) =>
        drawArm(layer, side, arms, lift, style),
      );
      ink(layer, BODY, style);
      if (!shadow) {
        ink(layer, CREASE, {
          stroke: INK_PALETTE.ink,
          width: 2.5,
          alpha: 0.3,
          seed,
        });
      }
      ink(layer, HEAD, style);
      if (held && arms === 'hold') {
        at(layer, { x: HELD_AT[0], y: HELD_AT[1] }, held);
        for (const paw of paws) ink(layer, ellipse(paw, 24, 20), style);
      }
      if (!shadow) face(layer, look, seed);
    });
  });
}

function drawArm(
  pen: Pen,
  side: number,
  arms: Arms,
  lift: number,
  style: InkStyle,
): Point {
  const [shape, paw] = armPath(side, arms, lift);
  const { stroke, fill, seed } = style;
  if (stroke !== null && stroke !== undefined) {
    ink(pen, shape, { stroke, width: ARM_WIDTH + OUTLINE * 2, seed });
  }
  ink(pen, shape, { stroke: fill, width: ARM_WIDTH, seed });
  ink(pen, ellipse(paw, 22, 18), { ...style, width: OUTLINE });
  return paw;
}

function face(pen: Pen, look: BunnyLook, seed: number): void {
  for (const side of [-1, 1]) {
    if (look.eyes === 'glow') glowingEye(pen, side * EYE_X, seed);
    else buttonEye(pen, side * EYE_X, seed);
  }
  ink(pen, NOSE, { fill: BUNNY_PALETTE.pink, width: 3, seed });
  const { lips, gap, stitches } = mouth(look.grin);
  if (look.grin > 0.05) {
    ink(pen, gap, { fill: BUNNY_PALETTE.mouth, width: 4, seed });
  } else {
    ink(pen, lips, { width: 4, seed });
  }
  ink(pen, stitches, { width: 3.5, seed });
}
