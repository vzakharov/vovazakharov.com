import {
  at,
  ellipse,
  type Figure,
  ink,
  INK_PALETTE,
  type InkStyle,
  inLayer,
  noise,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import {
  armJoints,
  type Arms,
  type BunnyLook,
  FEET_Y,
  HELD_AT,
  hopAt,
  lookAt,
  SHOULDER,
} from '../model/pose';
import { BUNNY_PALETTE } from './palette-bunny';

/** How the bunny is drawn; everything left out follows from `nearness`. */
export type BunnyDrawing = Figure &
  Partial<BunnyLook> & {
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
    swaying?: number;
    /** Drawn between its paws in the `hold` pose, origin at the held thing's centre. */
    held?: () => void;
    /**
     * Where in its bar a conducting bunny is, in `[0, 1)`: the baton lands on
     * the downbeat at 0. The scene drives it from the song's beat.
     */
    beat?: number;
    /**
     * Where in a hop it is, in `[0, 1)`, landing at 0; unset, it stands. The
     * scene drives it from the beat, offsetting each hopper's for a canon.
     * Arms default to `hop`.
     */
    hop?: number;
  };

const HEAD_D =
  'M -84,1 C -90,-69 -50,-85 0,-85 C 50,-85 90,-69 84,1 C 82,70 44,112 0,112 C -44,112 -82,70 -84,1 Z';
const HEAD = path(HEAD_D);
const BODY = path(
  'M -46,90 C -88,200 -96,420 -70,560 C -62,602 -18,606 -6,580 L 0,566 L 6,580 C 18,606 62,602 70,560 C 96,420 88,200 46,90 Z',
);
// The crease down the paper it was cut from.
const CREASE = path('M -20,140 L 14,240 L -18,350 L 12,460 L -6,560');
const BUNNY_NOSE = path('M -8,17 L 8,17 L 0,27 Z');
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
  beat: number,
): readonly [Path, Point] {
  const [[ex, ey], [px, py]] = armJoints(side, arms, beat);
  const paw: Point = [px, py + lift];
  const elbow: Point = [ex, ey + lift / 2];
  return [
    [
      { kind: 'M', points: [[side * SHOULDER[0], SHOULDER[1]]] },
      { kind: 'Q', points: [elbow, paw] },
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

// How far the light inside the head reaches from between the eyes.
const GLOW_REACH = 100;
const LIT_EYE = ellipse([0, 0], 16);

/**
 * The buttons gone: the head lit from inside, its light filling the face up
 * to the outline, and two blank rings where the eyes were.
 */
function glowingEyes(pen: Pen, seed: number): void {
  const { ctx } = pen;
  ctx.save();
  ctx.clip(new Path2D(HEAD_D));
  const light = ctx.createRadialGradient(0, EYE_Y, 10, 0, EYE_Y, GLOW_REACH);
  light.addColorStop(0, BUNNY_PALETTE.glowCore);
  light.addColorStop(0.45, BUNNY_PALETTE.glow);
  light.addColorStop(1, `${BUNNY_PALETTE.glow}00`);
  ctx.fillStyle = light;
  ctx.fillRect(-GLOW_REACH, EYE_Y - GLOW_REACH, GLOW_REACH * 2, GLOW_REACH * 2);
  ctx.restore();
  for (const side of [-1, 1]) {
    at(pen, { x: side * EYE_X, y: EYE_Y }, () => {
      ink(pen, LIT_EYE, { fill: BUNNY_PALETTE.glowCore, width: 5, seed });
    });
  }
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
    swaying = 1,
    seed = 0,
    bunnyScale,
    grin,
    eyes,
    aura: glow,
    hop,
    arms = hop === undefined ? 'down' : 'hop',
    opacity = 1,
    rendering = 'paper',
    held,
    x = 0,
    y = 0,
    rot = 0,
    flip = false,
    beat = 0,
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
  const swing = Math.sin((pen.playhead / 4.7) * Math.PI * 2 + phase) * swaying;
  const droop =
    Math.sin((pen.playhead / 3.1) * Math.PI * 2 + phase * 2) * swaying;
  const hopping = hop === undefined ? undefined : hopAt(hop, seed);
  const place = { x, y, rot, flip, scale: look.bunnyScale * scale };
  inLayer(pen, opacity, (layer) => {
    at(layer, place, () => {
      const { ctx } = layer;
      if (hopping) {
        if (!shadow) groundShadow(layer, hopping.hopHeight, seed);
        // Squashed and stretched about its feet, which leave the ground.
        ctx.translate(0, FEET_Y - hopping.hopHeight);
        ctx.scale(1 / Math.sqrt(hopping.stretch), hopping.stretch);
        ctx.translate(0, -FEET_Y);
      }
      // Swayed about its feet, so the head travels and the feet stay put.
      ctx.translate(0, FEET_Y);
      ctx.rotate((swing * 1.8 * Math.PI) / 180);
      ctx.translate(0, -FEET_Y);
      if (!shadow && look.aura > 0) aura(layer, look.aura);
      const style = { fill, stroke, width: OUTLINE, seed };
      for (const side of [-1, 1]) {
        const sweep = droop + (hopping?.earSweep ?? 0);
        const bend = side * 34 + side * sweep * 14;
        ink(layer, ear(side, bend), style);
        if (!shadow) {
          ink(layer, earLining(side, bend), {
            stroke: BUNNY_PALETTE.pink,
            width: 9,
            seed,
          });
        }
      }
      const swung = arms === 'up' || arms === 'reach' || arms === 'hold';
      const lift = swung ? swing * 6 : 0;
      const cue = arms === 'hop' ? (hopping?.armsUp ?? 0) : beat;
      const drawArms = (): Point[] =>
        [-1, 1].map((side) =>
          drawArm(layer, side, { arms, armLift: lift, armCue: cue }, style),
        );
      // A conductor's arms work in front of the body; every other pose's hang behind it.
      const inFront = arms === 'conduct';
      const paws = inFront ? [] : drawArms();
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
      if (inFront) drawArms();
      if (held && arms === 'hold') {
        at(layer, { x: HELD_AT[0], y: HELD_AT[1] }, held);
        for (const paw of paws) ink(layer, ellipse(paw, 24, 20), style);
      }
      if (!shadow) face(layer, look, seed);
    });
  });
}

/** How an arm is posed: its pose, how far the sway lifts it, and its `armJoints` cue. */
type ArmPose = { arms: Arms; armLift: number; armCue: number };

// A hopper's shadow on the ground, at rest; it shrinks and fades as it rises.
const GROUND_SHADOW = ellipse([0, FEET_Y], 90, 16);

function groundShadow(pen: Pen, rise: number, seed: number): void {
  const away = Math.min(1, rise / 300);
  at(pen, { y: FEET_Y * away * 0.3, scale: 1 - away * 0.3 }, () => {
    ink(pen, GROUND_SHADOW, {
      fill: BUNNY_PALETTE.shadow,
      stroke: null,
      alpha: 0.3 * (1 - away * 0.6),
      seed,
    });
  });
}

// The baton's length and width, in the bunny's units.
const BATON = 130;
const BATON_WIDTH = 6;

function drawArm(
  pen: Pen,
  side: number,
  { arms, armLift, armCue }: ArmPose,
  style: InkStyle,
): Point {
  const [shape, paw] = armPath(side, arms, armLift, armCue);
  const { stroke, fill, seed } = style;
  if (arms === 'conduct' && side > 0) {
    // The baton carries on the line from shoulder to paw, so it always points
    // away from the body: down on the downbeat, up on the upbeat.
    const [ex, ey] = SHOULDER;
    const [px, py] = paw;
    const reach = Math.hypot(px - ex, py - ey) || 1;
    const tip: Point = [
      px + ((px - ex) / reach) * BATON,
      py + ((py - ey) / reach) * BATON,
    ];
    ink(pen, polygon([paw, tip], 'open'), {
      stroke: stroke ?? fill,
      width: BATON_WIDTH,
      seed,
    });
  }
  if (stroke !== null && stroke !== undefined) {
    ink(pen, shape, { stroke, width: ARM_WIDTH + OUTLINE * 2, seed });
  }
  ink(pen, shape, { stroke: fill, width: ARM_WIDTH, seed });
  ink(pen, ellipse(paw, 22, 18), { ...style, width: OUTLINE });
  return paw;
}

function face(pen: Pen, look: BunnyLook, seed: number): void {
  if (look.eyes === 'glow') glowingEyes(pen, seed);
  else for (const side of [-1, 1]) buttonEye(pen, side * EYE_X, seed);
  ink(pen, BUNNY_NOSE, { fill: BUNNY_PALETTE.pink, width: 3, seed });
  const { lips, gap, stitches } = mouth(look.grin);
  if (look.grin > 0.05) {
    ink(pen, gap, { fill: BUNNY_PALETTE.mouth, width: 4, seed });
  } else {
    ink(pen, lips, { width: 4, seed });
  }
  ink(pen, stitches, { width: 3.5, seed });
}
