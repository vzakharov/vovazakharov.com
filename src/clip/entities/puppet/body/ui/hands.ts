import { ink, INK_PALETTE, path, type Pen } from '@/clip/shared/ink';

export const GRIPS = ['fist', 'open', 'point', 'sleeve', 'wrap'] as const;

/**
 * What a hand is doing; `sleeve` is a straitjacket's, the hand lost inside it.
 * `wrap` closes round what `front` draws, as a fretting hand on a neck: the
 * palm under it, the fingers (`fingertips`) over it.
 */
export type Grip = (typeof GRIPS)[number];

// A right hand in its own units: the wrist at the origin, the fingers down the
// y axis, the thumb towards the body. The left is its mirror.
const FIST = path(
  'M -15,0 C -23,12 -20,34 -5,39 C 11,43 23,31 21,15 C 20,5 14,-3 2,-4 C -6,-4 -12,-3 -15,0 Z',
);
const KNUCKLES = path('M -5,31 L -4,21 M 5,33 L 5,22 M 14,28 L 13,19');
const THUMB = path('M -15,8 C -27,12 -27,27 -13,26');
const PALM_SHAPE = path(
  'M -14,-2 C -20,10 -20,22 -17,30 L -31,25 C -38,23 -40,32 -33,35 L -16,43 L -14,61 C -14,70 -5,70 -5,61 L -4,47 L -2,67 C -2,76 8,76 8,67 L 8,47 L 11,63 C 12,71 20,70 19,62 L 16,42 C 20,30 20,12 14,-2 Z',
);
const PALM_LINES = path('M -9,26 C -2,32 8,32 13,26');
const FINGER = path('M -6,30 L -6,68 C -6,77 5,77 5,68 L 6,30 Z');
const CUFF = path('M -17,-6 L -22,58 C -10,72 12,72 22,58 L 17,-6 Z');
const STRAP = path('M 0,66 C 10,84 -8,98 2,122');
// A wrapping hand's fingers, held across the forearm as on a neck it runs
// along: up from the palm's edge onto the front of what it holds.
const FINGERTIPS = path(
  [8, 17, 26, 35]
    .map(
      (y) =>
        `M -6,${y - 4} L 7,${y - 4} C 15,${y - 4} 15,${y + 4} 7,${y + 4} L -6,${y + 4} Z`,
    )
    .join(' '),
);

/** The fingers of a `wrap` hand, in the hand's own units: drawn after what they close over. */
export function fingertips(pen: Pen, seed: number): void {
  ink(pen, FINGERTIPS, { fill: INK_PALETTE.skin, width: 3.5, seed });
}

/** A hand at the origin, fingers down the y axis; place and turn it with `at`. */
export function hand(
  pen: Pen,
  grip: Grip,
  sleeve: string,
  seed: number,
  strap: string,
): void {
  const skin = { fill: INK_PALETTE.skin, width: 4.5, seed };
  switch (grip) {
    case 'open': {
      ink(pen, PALM_SHAPE, skin);
      ink(pen, PALM_LINES, { width: 2.5, alpha: 0.6, seed: seed + 1 });
      break;
    }
    case 'sleeve': {
      ink(pen, STRAP, { width: 12, seed: seed + 1 });
      ink(pen, STRAP, { stroke: strap, width: 6, seed: seed + 1 });
      ink(pen, CUFF, { fill: sleeve, width: 4.5, seed });
      break;
    }
    case 'point': {
      ink(pen, FINGER, skin);
      ink(pen, FIST, skin);
      ink(pen, THUMB, { width: 3.5, seed: seed + 2 });
      break;
    }
    case 'wrap': {
      ink(pen, FIST, skin);
      ink(pen, THUMB, { width: 3.5, seed: seed + 2 });
      break;
    }
    case 'fist': {
      ink(pen, FIST, skin);
      ink(pen, KNUCKLES, { width: 3, seed: seed + 1 });
      ink(pen, THUMB, { width: 3.5, seed: seed + 2 });
      break;
    }
    default: {
      throw new Error('Unknown grip');
    }
  }
}
