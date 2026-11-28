import {
  at,
  clipped,
  ink,
  type Pen,
  type Place,
  type Point,
  polygon,
} from '@/clip/shared/ink';
import { bunny } from '@/clip/entities/bunny';
import { alphabetBlock, cardboardSun } from '@/clip/entities/meadow';
import { tallies } from '@/clip/entities/tally';

import { CLOSE_UP_PALETTE } from './palette-close-up';
import { pills } from './pills';

/** The clip's metaphors, as one lands in a corner of the close-up. */
const EMBLEMS = [
  'sun',
  'grin',
  'pills',
  'handful',
  'bunny',
  'nearBunny',
  'abc',
  'hor',
  'wall',
] as const;
export type Emblem = (typeof EMBLEMS)[number];

const CORNERS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
export type Corner = (typeof CORNERS)[number];

/** Each corner's middle on the stage, and which way it lies from the face. */
export const CORNER_AT: Record<Corner, Point> = {
  topLeft: [160, 150],
  topRight: [1120, 150],
  bottomLeft: [160, 585],
  bottomRight: [1120, 585],
};

// A torn scrap of the ward's wall, 300 by 210 about its middle.
const SCRAP = polygon([
  [-150, -96],
  [-92, -108],
  [-40, -94],
  [24, -110],
  [96, -98],
  [150, -104],
  [140, -30],
  [152, 40],
  [138, 104],
  [60, 96],
  [-6, 110],
  [-80, 98],
  [-148, 106],
  [-140, 30],
  [-154, -34],
]);

function wall(pen: Pen, seed: number): void {
  ink(pen, SCRAP, {
    fill: CLOSE_UP_PALETTE.plaster,
    stroke: CLOSE_UP_PALETTE.plasterEdge,
    width: 6,
    seed,
  });
  clipped(pen, SCRAP, () => {
    tallies(pen, {
      x: -170,
      y: -110,
      width: 340,
      height: 230,
      markHeight: 46,
      seed: seed + 1,
    });
  });
  ink(pen, SCRAP, { width: 6, seed });
}

/** A row of blocks spelling `letters`, each tipped a little its own way. */
function blocks(pen: Pen, row: readonly string[], seed: number): void {
  for (const [n, letter] of row.entries()) {
    alphabetBlock(pen, {
      letter,
      x: (n - (row.length - 1) / 2) * 118,
      y: 50,
      rot: (n - 1) * 5,
      colouring: n,
      seed: seed + n,
    });
  }
}

const DRAW: Record<Emblem, (pen: Pen, seed: number) => void> = {
  sun: (pen, seed) => {
    cardboardSun(pen, { smile: 0.55, bob: 0, seed });
  },
  grin: (pen, seed) => {
    cardboardSun(pen, { smile: 1, bob: 0, gaze: [0.6, 0.5], seed });
  },
  pills: (pen, seed) => {
    pills(pen, { count: 2, seed });
  },
  handful: (pen, seed) => {
    pills(pen, { count: 5, seed });
  },
  // A bunny is its head and ears risen over the bottom edge, its body below.
  bunny: (pen, seed) => {
    bunny(pen, { y: 90, nearness: 0.15, bunnyScale: 1, swaying: 0, seed });
  },
  nearBunny: (pen, seed) => {
    bunny(pen, { y: 70, nearness: 0.45, bunnyScale: 1, swaying: 0, seed });
  },
  abc: (pen, seed) => {
    blocks(pen, ['А', 'Б', 'В'], seed);
  },
  hor: (pen, seed) => {
    blocks(pen, ['Х', 'О', 'Р'], seed);
  },
  wall,
};

// How big each emblem stands in its corner, against its own drawing.
const SIZE: Record<Emblem, number> = {
  sun: 1.2,
  grin: 1.45,
  pills: 1,
  handful: 1.15,
  bunny: 0.5,
  nearBunny: 0.72,
  abc: 0.66,
  hor: 0.66,
  wall: 0.9,
};

/**
 * `emblem` in `corner`, `landing` 1 as it lands and settling to 0: it comes
 * in oversized and tipped toward the face, and sits still once down.
 */
export function emblemIn(
  pen: Pen,
  emblem: Emblem,
  corner: Corner,
  landing: number,
  seed: number,
): void {
  const [x, y] = CORNER_AT[corner];
  const inward = corner.endsWith('Left') ? 1 : -1;
  const place: Place = {
    x,
    y,
    scale: SIZE[emblem] * (1 + 0.4 * landing),
    rot: inward * 14 * landing,
  };
  at(pen, place, () => {
    DRAW[emblem](pen, seed);
  });
}
