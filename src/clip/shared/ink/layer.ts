import type { Pen } from './ink';

// One scratch canvas for every layer: it is cleared before each use and holds
// nothing between calls, so no frame depends on what an earlier one left.
let scratch: HTMLCanvasElement | undefined;

function scratchFor(width: number, height: number): CanvasRenderingContext2D {
  scratch ??= document.createElement('canvas');
  if (scratch.width !== width) scratch.width = width;
  if (scratch.height !== height) scratch.height = height;
  const ctx = scratch.getContext('2d');
  if (!ctx) throw new Error('No 2D context for a layer');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

/**
 * Runs `draw` on a layer of its own and lays the result down at `alpha`, so a
 * see-through figure is see-through as one piece: its overlapping parts do not
 * show through one another, as they would with each drawn at `alpha`. At
 * `alpha` 1 it draws straight onto the pen's canvas. Layers do not nest.
 */
export function inLayer(
  pen: Pen,
  alpha: number,
  draw: (layer: Pen) => void,
): void {
  const { ctx } = pen;
  if (alpha >= 1) {
    draw(pen);
    return;
  }
  if (alpha <= 0) return;
  const { width, height } = ctx.canvas;
  const layer = scratchFor(width, height);
  layer.setTransform(ctx.getTransform());
  draw({ ...pen, ctx: layer });
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(layer.canvas, 0, 0);
  ctx.restore();
}
