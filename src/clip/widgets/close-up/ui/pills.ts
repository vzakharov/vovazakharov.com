import {
  at,
  ellipse,
  type Figure,
  ink,
  path,
  type Pen,
  type Point,
} from '@/clip/shared/ink';

import { CLOSE_UP_PALETTE } from './palette-close-up';

// A capsule is drawn in its own units: 100 long, 38 thick, centred, as two
// halves meeting at the middle.
const CAPSULE_HALF = path('M 0,-19 L -31,-19 C -56,-19 -56,19 -31,19 L 0,19 Z');
const CAPSULE_SHINE = path('M -36,-9 L -12,-9');
const TABLET = ellipse([0, 0], 24, 22);
const SCORE = path('M -15,1 C -6,3 6,3 15,1');

function capsule(pen: Pen, seed: number): void {
  ink(pen, CAPSULE_HALF, {
    fill: CLOSE_UP_PALETTE.capsuleCap,
    width: 5,
    seed,
  });
  at(pen, { flip: true }, () => {
    ink(pen, CAPSULE_HALF, {
      fill: CLOSE_UP_PALETTE.capsule,
      width: 5,
      seed: seed + 1,
    });
  });
  ink(pen, CAPSULE_SHINE, {
    stroke: CLOSE_UP_PALETTE.capsule,
    width: 5,
    alpha: 0.7,
    seed: seed + 2,
  });
}

function tablet(pen: Pen, seed: number): void {
  ink(pen, TABLET, { fill: CLOSE_UP_PALETTE.tablet, width: 5, seed });
  ink(pen, SCORE, { width: 3, seed: seed + 1 });
}

// Where each pill of a handful lies, in the handful's units, and how it is turned.
const HANDFUL: ReadonlyArray<{
  lies: Point;
  rot: number;
  kind: 'cap' | 'tab';
}> = [
  { lies: [-20, -10], rot: -28, kind: 'cap' },
  { lies: [48, 30], rot: 0, kind: 'tab' },
  { lies: [-48, 42], rot: 0, kind: 'tab' },
  { lies: [20, -58], rot: 64, kind: 'cap' },
  { lies: [70, -34], rot: 0, kind: 'tab' },
];

/**
 * A handful of pills, the first `count` of five: capsules red and white,
 * scored chalk tablets. Its place is the handful's middle; at scale 1 it is
 * about 200 across.
 */
export function pills(pen: Pen, handful: Figure & { count: number }): void {
  const { count, seed = 0, ...place } = handful;
  at(pen, place, () => {
    for (const [n, { lies, rot, kind }] of HANDFUL.slice(0, count).entries()) {
      const [x, y] = lies;
      at(pen, { x, y, rot }, () => {
        if (kind === 'cap') capsule(pen, seed + n * 3);
        else tablet(pen, seed + n * 3);
      });
    }
  });
}
