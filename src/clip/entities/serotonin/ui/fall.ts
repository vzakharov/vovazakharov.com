import type { Pen } from '@/clip/shared/ink';

import {
  type Depth,
  type Fall,
  fallingFlecks,
  fleckAt,
  type FleckLook,
  type FleckState,
} from '../model/fall';
import { SEROTONIN_PALETTE, type SerotoninPalette } from './palette-serotonin';

// The shapes at one unit long, built on first use: Path2D exists only in a
// browser, and a shape never changes once built.
type Shapes = {
  capsuleLeft: Path2D;
  capsuleRight: Path2D;
  capsule: Path2D;
  tablet: Path2D;
  score: Path2D;
  flake: Path2D;
};
let shapes: Shapes | undefined;

const CAPSULE_HALF_WIDTH = 0.21;

function shapesOnce(): Shapes {
  if (shapes) return shapes;
  const r = CAPSULE_HALF_WIDTH;
  const half = (side: number): Path2D => {
    const part = new Path2D();
    part.moveTo(0, -r);
    part.lineTo(side * (0.5 - r), -r);
    part.arc(side * (0.5 - r), 0, r, -Math.PI / 2, Math.PI / 2, side < 0);
    part.lineTo(0, r);
    part.closePath();
    return part;
  };
  const capsule = new Path2D();
  capsule.addPath(half(-1));
  capsule.addPath(half(1));
  const tablet = new Path2D();
  tablet.arc(0, 0, 0.5, 0, Math.PI * 2);
  const score = new Path2D();
  score.moveTo(-0.32, 0);
  score.lineTo(0.32, 0);
  const flake = new Path2D();
  flake.moveTo(-0.5, -0.1);
  flake.lineTo(-0.1, -0.42);
  flake.lineTo(0.36, -0.2);
  flake.lineTo(0.5, 0.18);
  flake.lineTo(0.02, 0.36);
  flake.lineTo(-0.3, 0.24);
  flake.closePath();
  shapes = {
    capsuleLeft: half(-1),
    capsuleRight: half(1),
    capsule,
    tablet,
    score,
    flake,
  };
  return shapes;
}

// Per depth: how solid it is, and whether it gets an ink outline.
const SOLIDITY: Readonly<Record<Depth, number>> = { 0: 0.5, 1: 0.8, 2: 1 };
const OUTLINE = 1.6;

/** A fleck where it is now: what it is, where, how turned, how solid. */
export type PlacedFleck = FleckLook &
  FleckState & {
    /** Against its depth's own solidity; 1 by default. */
    solidity?: number;
  };

function drawFleck(
  ctx: CanvasRenderingContext2D,
  fleck: PlacedFleck,
  palette: SerotoninPalette,
): void {
  const { shape, colouring, layer, angle, fleckSize } = fleck;
  const parts = shapesOnce();
  const lined = layer > 0;
  ctx.lineWidth = OUTLINE / fleckSize;
  switch (shape) {
    case 'capsule': {
      const [left, right] =
        palette.capsule[colouring % 3] ?? palette.capsule[0];
      ctx.fillStyle = left;
      ctx.fill(parts.capsuleLeft);
      ctx.fillStyle = right;
      ctx.fill(parts.capsuleRight);
      if (lined) ctx.stroke(parts.capsule);
      break;
    }
    case 'tablet': {
      // A disc tumbling: seen edge-on twice a turn.
      ctx.scale(1, 0.2 + 0.8 * Math.abs(Math.cos(angle * 1.5)));
      ctx.fillStyle = palette.tablet[colouring % 3] ?? palette.tablet[0];
      ctx.fill(parts.tablet);
      if (lined) {
        ctx.stroke(parts.tablet);
        ctx.stroke(parts.score);
      }
      break;
    }
    case 'flake': {
      ctx.fillStyle = palette.flake[colouring % 3] ?? palette.flake[0];
      ctx.fill(parts.flake);
      if (lined) ctx.stroke(parts.flake);
      break;
    }
    default: {
      throw new Error('Unknown fleck kind');
    }
  }
}

/** Draws each of `placed` in `palette`, in the order given. */
export function flecks(
  pen: Pen,
  placed: Iterable<PlacedFleck>,
  palette: SerotoninPalette = SEROTONIN_PALETTE,
): void {
  const { ctx } = pen;
  ctx.save();
  ctx.strokeStyle = palette.outline;
  ctx.lineJoin = 'round';
  const solid = ctx.globalAlpha;
  for (const fleck of placed) {
    const { x, y, angle, fleckSize, layer, solidity = 1 } = fleck;
    ctx.save();
    ctx.globalAlpha = solid * SOLIDITY[layer] * solidity;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(fleckSize, fleckSize);
    drawFleck(ctx, fleck, palette);
    ctx.restore();
  }
  ctx.restore();
}

/** A fall and the colours it falls in, pharmacy pastels by default. */
export type ColouredFall = Fall & { palette?: SerotoninPalette };

/**
 * Serotonin falling like snow: capsules, tablets and flakes at three depths,
 * the far ones small, slow and faint. A pure function of `pen.playhead` that
 * loops every `period` with no seam; `density` adds flecks without moving any.
 */
export function serotoninFall(pen: Pen, fall: ColouredFall): void {
  const { playhead } = pen;
  const placed = fallingFlecks(fall).map(
    (fleck): PlacedFleck => ({ ...fleck, ...fleckAt(fleck, playhead, fall) }),
  );
  flecks(pen, placed, fall.palette);
}
