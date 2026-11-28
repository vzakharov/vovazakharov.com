import type { Pen } from '@/clip/shared/ink';

import {
  type Depth,
  type Fall,
  fallingFlecks,
  type Fleck,
  fleckAt,
} from '../model/fall';
import { SEROTONIN_PALETTE } from './palette-serotonin';

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

function drawFleck(
  ctx: CanvasRenderingContext2D,
  fleck: Fleck,
  angle: number,
  fleckSize: number,
): void {
  const { shape, colouring, layer } = fleck;
  const parts = shapesOnce();
  const lined = layer > 0;
  ctx.lineWidth = OUTLINE / fleckSize;
  switch (shape) {
    case 'capsule': {
      const [left, right] =
        SEROTONIN_PALETTE.capsule[colouring % 3] ??
        SEROTONIN_PALETTE.capsule[0];
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
      ctx.fillStyle =
        SEROTONIN_PALETTE.tablet[colouring % 3] ?? SEROTONIN_PALETTE.tablet[0];
      ctx.fill(parts.tablet);
      if (lined) {
        ctx.stroke(parts.tablet);
        ctx.stroke(parts.score);
      }
      break;
    }
    case 'flake': {
      ctx.fillStyle =
        SEROTONIN_PALETTE.flake[colouring % 3] ?? SEROTONIN_PALETTE.flake[0];
      ctx.fill(parts.flake);
      if (lined) ctx.stroke(parts.flake);
      break;
    }
    default: {
      throw new Error('Unknown fleck kind');
    }
  }
}

/**
 * Serotonin falling like snow: capsules, tablets and flakes at three depths,
 * the far ones small, slow and faint. A pure function of `pen.t` that loops
 * every `period` with no seam; `density` adds flecks without moving any.
 */
export function serotoninFall(pen: Pen, fall: Fall): void {
  const { ctx, t } = pen;
  ctx.save();
  ctx.strokeStyle = SEROTONIN_PALETTE.outline;
  ctx.lineJoin = 'round';
  const solid = ctx.globalAlpha;
  for (const fleck of fallingFlecks(fall)) {
    const { x, y, angle, fleckSize } = fleckAt(fleck, t, fall);
    ctx.save();
    ctx.globalAlpha = solid * SOLIDITY[fleck.layer];
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(fleckSize, fleckSize);
    drawFleck(ctx, fleck, angle, fleckSize);
    ctx.restore();
  }
  ctx.restore();
}
