import type { Pen } from './ink';
import type { Path } from './path';

/**
 * Runs `draw` with everything outside `shape` masked off. The mask is the
 * shape's still outline, so a boiled outline drawn over it afterwards hides
 * the seam.
 */
export function clipped(pen: Pen, shape: Path, draw: () => void): void {
  const { ctx } = pen;
  ctx.save();
  ctx.beginPath();
  for (const { kind, points } of shape) {
    const [[ax, ay] = [0, 0], [bx, by] = [0, 0], [cx, cy] = [0, 0]] = points;
    switch (kind) {
      case 'M': {
        ctx.moveTo(ax, ay);
        break;
      }
      case 'L': {
        ctx.lineTo(ax, ay);
        break;
      }
      case 'Q': {
        ctx.quadraticCurveTo(ax, ay, bx, by);
        break;
      }
      case 'C': {
        ctx.bezierCurveTo(ax, ay, bx, by, cx, cy);
        break;
      }
      case 'Z': {
        ctx.closePath();
        break;
      }
      default: {
        throw new Error('Unknown path step');
      }
    }
  }
  ctx.clip();
  draw();
  ctx.restore();
}
