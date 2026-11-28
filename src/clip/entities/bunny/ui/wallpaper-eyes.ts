import {
  clamp,
  ellipse,
  ink,
  noise,
  type Pen,
  type Point,
  sub,
} from '@/clip/shared/ink';

import { BUNNY_PALETTE } from './palette-bunny';
import { motifAt, motifScale, type Wallpaper } from './wallpaper';

/** The wallpaper as `bunnyWallpaper` was given it, and what its bunnies do. */
export type WallpaperEyes = Wallpaper & {
  /** Where every printed bunny looks, in the same units. */
  target: Point;
  /** 0 the print as it was, 1 every pair of eyes open; each pair opens on its own cue within that. */
  awake: number;
};

// The print's own eye line, in the bunny's units.
const EYE_Y = -5;
// An eye's radius against the cell: well past the print's buttons, so the
// eyes bulge off the motif's head and read at a wall's distance.
const EYE_RADIUS = 0.05;
// How far a pupil travels inside its eye, against the eye's radius.
const PUPIL_TRAVEL = 0.45;

/**
 * Eyes on every bunny printed on the wallpaper, opened one pair after another
 * as `awake` goes 0 → 1, every pupil turned on `target`: the pattern waking.
 * Drawn over `bunnyWallpaper` with the same cell and offset.
 */
export function wallpaperEyes(pen: Pen, eyes: WallpaperEyes): void {
  const { area, cell = 110, offset = [0, 0], target, awake, hole } = eyes;
  const { x = 0, y = 0, width, height } = area;
  const [dx, dy] = offset;
  const scale = motifScale(cell);
  const radius = cell * EYE_RADIUS;
  const firstColumn = Math.floor((x - dx) / cell) - 1;
  const lastColumn = Math.ceil((x + width - dx) / cell) + 1;
  const firstRow = Math.floor((y - dy) / cell) - 1;
  const lastRow = Math.ceil((y + height - dy) / cell) + 1;
  for (let column = firstColumn; column <= lastColumn; column += 1) {
    for (let row = firstRow; row <= lastRow; row += 1) {
      if (hole?.column === column && hole.row === row) continue;
      const cue = 0.5 + 0.5 * noise(cell + column * 31, row);
      const opened = clamp((awake - cue * 0.7) / 0.3, 0, 1);
      if (opened <= 0) continue;
      const [mx, my] = motifAt(cell, { column, row });
      const head: Point = [mx + dx, my + dy];
      if (
        head[0] < x + radius * 2 ||
        head[0] > x + width - radius * 2 ||
        head[1] < y + radius ||
        head[1] > y + height - radius
      ) {
        continue;
      }
      const [lx, ly] = sub(target, head);
      const reach = Math.hypot(lx, ly) || 1;
      const travel = (radius * PUPIL_TRAVEL) / reach;
      const pupil: Point = [lx * travel, ly * travel];
      for (const side of [-1, 1]) {
        const centre: Point = [
          head[0] + side * radius * 1.05,
          head[1] + EYE_Y * scale,
        ];
        ink(pen, ellipse(centre, radius, radius * opened), {
          fill: BUNNY_PALETTE.paper,
          width: 1.5,
          seed: column * 7 + row * 13 + side,
        });
        ink(
          pen,
          ellipse(
            [centre[0] + pupil[0], centre[1] + pupil[1] * opened],
            radius * 0.45,
            radius * 0.45 * opened,
          ),
          { fill: BUNNY_PALETTE.button, stroke: null },
        );
      }
    }
  }
}
