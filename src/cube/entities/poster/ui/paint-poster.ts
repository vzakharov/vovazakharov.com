import { paintStrokes, type Pen } from '@/cube/shared/lettering';
import { cssRgb } from '@/cube/shared/lib/colour';

import type { PosterPart } from '../model/poster';

/** What painting a poster asks of a 2D canvas context: a pen, and a fill. */
export type Brush = Pen &
  Pick<CanvasRenderingContext2D, 'fillStyle' | 'fillRect'>;

/**
 * Paints `parts`, in order, on `brush` at `scale` pixels to a room side, the
 * sheet's upper left corner at the canvas's: a canvas `wide · scale` by
 * `tall · scale` pixels holds the poster exactly.
 */
export function paintPoster(
  brush: Brush,
  parts: readonly PosterPart[],
  scale: number,
): void {
  let tall = 0;
  for (const each of parts) {
    if (each.part === 'paper') {
      tall = each.tall;
      brush.fillStyle = cssRgb(each.tint);
      brush.fillRect(0, 0, each.wide * scale, each.tall * scale);
    } else {
      paintStrokes(brush, each.strokes, {
        left: 0,
        baseline: tall * scale,
        unit: scale,
        nib: each.nibWide * scale,
        ink: cssRgb(each.tint),
      });
    }
  }
}
