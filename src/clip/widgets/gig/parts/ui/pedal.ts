import {
  at,
  ellipse,
  ink,
  INK_PALETTE,
  limb,
  path,
  type Pen,
} from '@/clip/shared/ink';
import { KICKS, punch } from '@/clip/shared/score';

import { GIG_PALETTE } from '../../studio';

// The pedal seen from the side, the heel hinge at the origin, toe to the right.
const FOOTBOARD = path('M 0,0 L 330,-70 L 336,-52 L 6,18 Z');
const BASE = path('M -40,22 L 440,22 L 440,44 L -40,44 Z');
const BOOT = path(
  'M -10,-8 C -20,-80 0,-150 30,-170 L 120,-176 C 130,-120 150,-96 220,-90 C 300,-84 340,-74 344,-50 C 346,-30 330,-20 300,-20 L 0,-2 Z',
);
const TREAD = path(
  'M -14,-4 L 300,-22 C 330,-22 348,-34 346,-50 L 352,-40 C 356,-20 336,-6 300,-6 L -12,14 Z',
);
const LACES = [0, 1, 2, 3].map((n) =>
  path(`M ${130 + n * 24},${-150 + n * 16} L ${164 + n * 24},${-140 + n * 16}`),
);
const FELT = ellipse([0, 0], 34, 40);
// The kick drum from the side, its batter head facing the pedal at the left.
const SHELL = path('M 0,-700 L 700,-700 L 700,60 L 0,60 Z');
const HEAD = ellipse([0, -320], 46, 400);
const CROSS = path(
  'M 300,-420 L 380,-420 L 380,-340 L 460,-340 L 460,-260 L 380,-260 L 380,-180 L 300,-180 L 300,-260 L 220,-260 L 220,-340 L 300,-340 Z',
);

/**
 * The drummer's boot on the kick pedal, in close-up from the side: the boot
 * stamps the footboard down on every kick, the beater swings into the kick
 * drum's head at the right, and the drum shudders with it. Drawn at size for
 * a 960 × 720 picture, the pedal's hinge at `x`, `y`.
 */
export function bootOnPedal(pen: Pen, x: number, y: number): void {
  const stamp = punch(KICKS, pen.playhead, 0.09);
  // The footboard sits raised and slams flat on the kick.
  const press = -14 + 14 * stamp;
  const swing = 50 - 52 * stamp;
  at(pen, { x, y }, () => {
    at(pen, { x: 560 + stamp * 12, y: stamp * 4 }, () => {
      ink(pen, SHELL, { fill: GIG_PALETTE.skin, width: 8, seed: 5 });
      ink(pen, CROSS, { fill: GIG_PALETTE.cross, seed: 11 });
      ink(pen, HEAD, { fill: GIG_PALETTE.hoop, width: 9, seed: 6 });
    });
    ink(pen, BASE, { fill: INK_PALETTE.metalDark, seed: 1 });
    // The beater on its shaft, swung from the pedal's post into the head.
    at(pen, { x: 440, y: -40, rot: swing }, () => {
      limb(
        pen,
        [
          [0, 0],
          [60, -190],
        ],
        INK_PALETTE.metal,
        10,
        7,
      );
      at(pen, { x: 64, y: -210 }, () => {
        ink(pen, FELT, { fill: GIG_PALETTE.felt, seed: 8 });
      });
    });
    limb(
      pen,
      [
        [440, 30],
        [440, -40],
      ],
      INK_PALETTE.metal,
      16,
      9,
    );
    at(pen, { rot: press }, () => {
      ink(pen, FOOTBOARD, { fill: INK_PALETTE.metalLight, seed: 2 });
      // The boot rides the footboard, the leg rising out of the top of frame.
      at(pen, { x: 10, y: -30 }, () => {
        limb(
          pen,
          [
            [70, -150],
            [40, -500],
            [-60, -900],
          ],
          GIG_PALETTE.trouser,
          150,
          10,
        );
        ink(pen, BOOT, { fill: GIG_PALETTE.boot, width: 7, seed: 3 });
        ink(pen, TREAD, { fill: GIG_PALETTE.sole, seed: 4 });
        for (const [n, lace] of LACES.entries()) {
          ink(pen, lace, { stroke: GIG_PALETTE.lace, width: 6, seed: 20 + n });
        }
      });
    });
  });
}
