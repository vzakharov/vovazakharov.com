import type { Point } from '../../model/geometry';
import { EYE_HEIGHT, OPENING_EYE, pinholeOf } from '../../model/ground';
import type { View } from './view';

/**
 * `ofLayout` run backwards: the point, in the layout's world px, that `view`
 * shows at `screen`, in CSS px, standing over the ground row `footRow`. A
 * row's points stand on one upright plane across the plane's y, so this is
 * where the screen's ray meets it; none where it never does in front of the
 * eye, nor for a row at or above the horizon.
 */
export function layoutAtRow(
  view: View,
  screen: Point,
  footRow: number,
): Point | undefined {
  const pinhole = pinholeOf(view);
  if (footRow <= pinhole.y) return undefined;
  const opening = (pinhole.focal * EYE_HEIGHT) / (footRow - pinhole.y);
  const perPx = opening / pinhole.focal;
  const across = (screen.x - pinhole.x) / pinhole.focal;
  const { x, y, heading } = view.eye;
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  // The ray one unit ahead of the eye, on the plane.
  const toward = { x: across * cos + sin, y: cos - across * sin };
  const ahead = (OPENING_EYE.y + opening - y) / toward.y;
  if (!(ahead > 0) || !Number.isFinite(ahead)) return undefined;
  const plane = x + ahead * toward.x;
  const height = EYE_HEIGHT - ((screen.y - pinhole.y) * ahead) / pinhole.focal;
  return {
    x:
      (plane - OPENING_EYE.x) / perPx +
      (view.world - view.width) / 2 +
      pinhole.x,
    y: footRow - height / perPx,
  };
}

/**
 * The stretch of the world, in the layout's px across, that `view`'s screen
 * shows over the ground from its top row to its foot: the least span holding
 * where either edge of the screen meets either row. A screen's upright edge
 * meets a row at one x, which moves one way as the row does, so the two rows
 * bound every row between. `undefined` where an edge meets a row nowhere
 * ahead of the eye, as when turned past the wedge's side.
 */
export function layoutShown(
  view: View,
): Record<'left' | 'right', number> | undefined {
  const xs: number[] = [];
  for (const row of [view.groundTop, view.height]) {
    for (const x of [0, view.width]) {
      const met = layoutAtRow(view, { x, y: row }, row);
      if (!met) return undefined;
      xs.push(met.x);
    }
  }
  return { left: Math.min(...xs), right: Math.max(...xs) };
}
