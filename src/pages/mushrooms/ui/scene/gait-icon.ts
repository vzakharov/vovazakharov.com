import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import type { Walk } from '../../model/walk';
import { drawDisc } from './hud';
import { PALETTE } from './palette';
import { fillShape, strokeShape } from './shapes';

/**
 * The two bare footprints, one a step ahead of the other, each turned a
 * little out: where each sole's middle stands and its turn, in its button's
 * radius and radians.
 */
const PRINTS = [
  { x: -0.22, y: 0.2, turn: -0.18, side: -1 },
  { x: 0.22, y: -0.2, turn: 0.18, side: 1 },
] as const;
/** A sole's half width and half length, the heel's, and how far below the ball the heel stands. */
const BALL = { across: 0.15, along: 0.2 } as const;
const HEEL = { across: 0.11, along: 0.13 } as const;
const HEEL_DROP = 0.3;
/** The toes over a sole, big toe first, as offsets from its ball's middle, and their radii. */
const TOES = [
  { x: 0.08, y: -0.27, r: 0.065 },
  { x: -0.04, y: -0.29, r: 0.05 },
  { x: -0.12, y: -0.25, r: 0.042 },
  { x: -0.18, y: -0.18, r: 0.036 },
] as const;

/** The footprints of `steps`, in Syama's indigo, `r` the button's radius. */
function paintFootprints(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  graphics.fillStyle(PALETTE.inkCool);
  for (const { x, y, turn, side } of PRINTS) {
    graphics.save();
    graphics.translateCanvas(x * r, y * r);
    graphics.rotateCanvas(turn);
    graphics.fillEllipse(
      0,
      -HEEL_DROP * r * 0.35,
      BALL.across * 2 * r,
      BALL.along * 2 * r,
    );
    graphics.fillEllipse(
      0,
      HEEL_DROP * r * 0.65,
      HEEL.across * 2 * r,
      HEEL.along * 2 * r,
    );
    for (const toe of TOES) {
      graphics.fillCircle(
        // The big toe on the inside of each foot.
        toe.x * -side * r,
        (toe.y - HEEL_DROP * 0.35) * r,
        toe.r * r,
      );
    }
    graphics.restore();
  }
}

/**
 * A bird's wing raised to the upper right, in its button's radius: the
 * leading edge from the shoulder to the tip, then the feathers' tips back
 * along the trailing edge to the shoulder.
 */
const SHOULDER = { x: -0.5, y: 0.36 } as const;
const BOW = { x: -0.42, y: -0.5 } as const;
const FEATHER_TIPS = [
  { x: 0.5, y: -0.5 },
  { x: 0.58, y: -0.2 },
  { x: 0.46, y: 0.12 },
  { x: 0.22, y: 0.34 },
] as const;
/** How far each notch between two feathers reaches in toward the wing's middle. */
const NOTCH = 0.55;
const WING_MIDDLE = { x: 0, y: -0.08 } as const;
/** Points along the leading edge's curve. */
const EDGE_POINTS = 10;

/** The wing's outline (`FEATHER_TIPS`), in its button's radius. */
function wingOutline(): Point[] {
  const [tip] = FEATHER_TIPS;
  const edge = Array.from({ length: EDGE_POINTS + 1 }, (_, index) => {
    const t = index / EDGE_POINTS;
    const at = (a: number, b: number, c: number) =>
      (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c;
    return {
      x: at(SHOULDER.x, BOW.x, tip.x),
      y: at(SHOULDER.y, BOW.y, tip.y),
    };
  });
  const trailing = [...FEATHER_TIPS.slice(1), SHOULDER].flatMap(
    (point, index) => {
      const before = FEATHER_TIPS[index] ?? tip;
      const notch = {
        x: (before.x + point.x) / 2,
        y: (before.y + point.y) / 2,
      };
      return [
        {
          x: notch.x + (WING_MIDDLE.x - notch.x) * NOTCH,
          y: notch.y + (WING_MIDDLE.y - notch.y) * NOTCH,
        },
        point,
      ];
    },
  );
  return [...edge, ...trailing];
}

/** The wing of `flight`: pale, inked in Syama's indigo, `r` the button's radius. */
function paintWing(graphics: Phaser.GameObjects.Graphics, r: number): void {
  const outline = wingOutline().map(({ x, y }) => ({ x: x * r, y: y * r }));
  graphics.fillStyle(PALETTE.flightWing);
  fillShape(graphics, outline);
  graphics.lineStyle(Math.max(2, r * 0.09), PALETTE.inkCool);
  strokeShape(graphics, outline);
}

/**
 * The gait button: a disc showing the footprints of `steps` or the wing of
 * `flight`, `r` its radius.
 */
export function drawGaitButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  gait: Walk['gait'],
): void {
  drawDisc(graphics, r);
  if (gait === 'steps') paintFootprints(graphics, r);
  else paintWing(graphics, r);
}
