import {
  at,
  ellipse,
  type Figure,
  ink,
  type Pen,
  polygon,
} from '@/clip/shared/ink';
import { writeBubble } from '@/clip/shared/lettering';

import { bounceAt } from '../model/bounce';
import { BLOCK_PALETTE } from './palette-meadow';

/** An alphabet block: its letter, its colour, and where in a bounce it is. */
export type AlphabetBlock = Figure & {
  /** One character the lettering can draw. */
  letter: string;
  /** Which of the palette's block colours; by default, picked by `seed`. */
  colouring?: number;
  /** Where in a bounce it is, in `[0, 1)`, landing at 0; unset, it sits. */
  bounce?: number;
};

// A block is drawn in its own units: its front face 100 square, the middle of
// its bottom edge at the origin, its top and side receding up and right.
const SIZE = 100;
const DEPTH: readonly [number, number] = [26, -20];
const [DX, DY] = DEPTH;
const FRONT = polygon(
  [
    [-50, -SIZE],
    [50, -SIZE],
    [50, 0],
    [-50, 0],
  ],
  'closed',
);
const TOP = polygon(
  [
    [-50, -SIZE],
    [-50 + DX, -SIZE + DY],
    [50 + DX, -SIZE + DY],
    [50, -SIZE],
  ],
  'closed',
);
const SIDE = polygon(
  [
    [50, -SIZE],
    [50 + DX, -SIZE + DY],
    [50 + DX, DY],
    [50, 0],
  ],
  'closed',
);
// Its painted border, inset on the front face.
const BORDER = polygon(
  [
    [-40, -SIZE + 10],
    [40, -SIZE + 10],
    [40, -10],
    [-40, -10],
  ],
  'closed',
);
const GROUND_SHADOW = ellipse([DX / 2, 4], 64, 10);
const LETTER_HEIGHT = 58;

/**
 * A wooden alphabet block with a bubble letter on its face, sitting on the
 * ground at its place or bouncing: squashed on landing, tipping in the air,
 * its shadow left on the ground. 126 wide at scale 1.
 */
export function alphabetBlock(pen: Pen, block: AlphabetBlock): void {
  const {
    letter,
    seed = 0,
    bounce,
    colouring = seed,
    x = 0,
    y = 0,
    scale = 1,
  } = block;
  const faces = BLOCK_PALETTE.faces;
  const [front, top, side] =
    faces[Math.abs(Math.round(colouring)) % faces.length] ?? faces[0];
  const lean = seed % 2 === 0 ? 1 : -1;
  const { airGap, squash, tipDegrees } =
    bounce === undefined
      ? { airGap: 0, squash: 1, tipDegrees: 0 }
      : bounceAt(bounce, SIZE, lean);
  at(pen, { x, y, scale }, () => {
    const away = Math.min(1, airGap / (SIZE * 1.5));
    at(pen, { x: (DX / 2) * away, scale: 1 - away * 0.4 }, () => {
      ink(pen, GROUND_SHADOW, {
        fill: BLOCK_PALETTE.letterShadow,
        stroke: null,
        seed,
      });
    });
    at(pen, { y: -airGap, rot: tipDegrees }, () => {
      const { ctx } = pen;
      ctx.scale(1 / Math.sqrt(squash), squash);
      const style = { width: 4, seed };
      ink(pen, SIDE, { ...style, fill: side });
      ink(pen, TOP, { ...style, fill: top });
      ink(pen, FRONT, { ...style, fill: front });
      ink(pen, BORDER, { stroke: top, width: 4, seed });
      writeBubble(pen, letter, {
        letterHeight: LETTER_HEIGHT,
        alignment: 'center',
        y: -SIZE / 2 - LETTER_HEIGHT / 2,
        seed,
        colors: BLOCK_PALETTE.letter,
        shadow: BLOCK_PALETTE.letterShadow,
      });
    });
  });
}
