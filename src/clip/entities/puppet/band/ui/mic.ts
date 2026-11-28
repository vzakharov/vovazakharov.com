import {
  add,
  at,
  ellipse,
  heading,
  ink,
  INK_PALETTE,
  limb,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { INSTRUMENT_PALETTE } from './palette-instruments';

// The mic in its own units: the top of the stand at the origin, the head up the y axis.
const MIC_BODY = polygon([
  [-8, 6],
  [8, 6],
  [10, -30],
  [-10, -30],
]);
const MIC_HEAD = ellipse([0, -42], 17, 20);
const MIC_GRILLE = path(
  'M -14,-48 L 14,-48 M -16,-40 L 16,-40 M -13,-32 L 13,-32 M -7,-60 L -7,-24 M 7,-60 L 7,-24',
);
const TRIPOD = path('M -48,0 L 0,-20 L 48,0 M 0,-20 L 0,-2');

/**
 * A mic on a stand, from its `foot` on the floor to the `mic` at its top, the
 * head leaning on past the stand's own line towards whoever sings into it.
 */
export function micStand(pen: Pen, foot: Point, mic: Point, seed = 0): void {
  const hub = add(foot, [0, -20]);
  at(pen, { x: foot[0], y: foot[1] }, () => {
    ink(pen, TRIPOD, { width: 9, seed: seed + 1 });
  });
  limb(pen, [hub, mic], INK_PALETTE.metal, 5, seed + 2);
  at(pen, { x: mic[0], y: mic[1], rot: heading(mic, hub) + 30 }, () => {
    ink(pen, MIC_BODY, {
      fill: INSTRUMENT_PALETTE.black,
      width: 4,
      seed: seed + 3,
    });
    ink(pen, MIC_HEAD, {
      fill: INK_PALETTE.metalLight,
      width: 4.5,
      seed: seed + 4,
    });
    ink(pen, MIC_GRILLE, { width: 1.8, alpha: 0.6, wobble: 0.4 });
  });
}
