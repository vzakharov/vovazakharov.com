import {
  ellipse,
  ink,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import type { Grip } from './hands';
import { OUTFIT_PALETTE, SHADE } from './palette-outfit';

const OUTFITS = ['jacket', 'strait', 'suit', 'pajama', 'toy'] as const;

/**
 * What the puppet wears: the grey striped `jacket`, a `strait`jacket with
 * buckles, the children's-show host's `suit`, bedroom `pajama`s, a `toy`
 * soldier's paint.
 */
export type Outfit = (typeof OUTFITS)[number];

/** The hand an outfit leaves its wearer when a scene asks for none. */
export const OUTFIT_GRIP: Record<Outfit, Grip> = {
  jacket: 'fist',
  strait: 'sleeve',
  suit: 'open',
  pajama: 'open',
  toy: 'fist',
};

/** A torso in its own frame: the origin between the shoulders, the spine down the y axis. */
export type Span = {
  /** Half the width at the shoulders. */
  shoulders: number;
  /** Half the width at the hips. */
  hips: number;
  hem: number;
};

/** `count` straight lines `gap` apart, each from `[x, 0]`-ish to the hem, slanted by `slant`. */
const stripes = (span: Span, gap: number, slant: number): Path => {
  const reach = Math.ceil((span.shoulders + Math.abs(slant)) / gap) + 1;
  return Array.from({ length: reach * 2 + 1 }, (_, n) => {
    const x = (n - reach) * gap;
    return polygon(
      [
        [x, -30],
        [x + slant, span.hem + 30],
      ],
      'open',
    );
  }).flat();
};

const bands = (span: Span, heights: readonly number[]): Path =>
  heights.flatMap((height) =>
    polygon(
      [
        [-span.shoulders - 20, span.hem * height],
        [span.shoulders + 20, span.hem * height],
      ],
      'open',
    ),
  );

const buttons = (
  pen: Pen,
  span: Span,
  heights: readonly number[],
  fill: string,
  seed: number,
): void => {
  for (const height of heights) {
    ink(pen, ellipse([0, span.hem * height], 6), { fill, width: 3, seed });
  }
};

// How far down the torso the lapels meet.
const LAPEL_DEPTH = 0.46;

const lapels = (span: Span): Path =>
  polygon(
    [
      [-18, -4],
      [0, span.hem * LAPEL_DEPTH],
      [18, -4],
    ],
    'open',
  );

/** The line down the front to past the hem, from `from` of the way down. */
const fly = (span: Span, from = LAPEL_DEPTH): Path =>
  polygon(
    [
      [0, span.hem * from],
      [0, span.hem + 30],
    ],
    'open',
  );

const BOW_TIE = path(
  'M 0,0 L -26,-14 L -26,14 Z M 0,0 L 26,-14 L 26,14 Z M -6,-6 L 6,-6 L 6,6 L -6,6 Z',
);

/**
 * What an outfit paints on its torso, in the torso's frame; the caller has
 * clipped to the torso, so nothing here minds the edges.
 */
export function trim(pen: Pen, outfit: Outfit, span: Span, seed: number): void {
  const colors = OUTFIT_PALETTE[outfit];
  // The far side of every torso sits in shadow.
  const shade = () => {
    ink(
      pen,
      polygon([
        [span.shoulders * 0.3, -30],
        [span.shoulders + 30, -30],
        [span.shoulders + 30, span.hem + 30],
        [span.hips * 0.5, span.hem + 30],
      ]),
      { fill: SHADE, stroke: null, alpha: 0.16 },
    );
  };
  switch (outfit) {
    case 'jacket': {
      ink(pen, stripes(span, 26, -56), {
        stroke: colors.stripe,
        width: 7,
        seed: seed + 1,
        wobble: 3,
      });
      shade();
      ink(pen, lapels(span), { width: 4, seed: seed + 2 });
      ink(pen, fly(span), { width: 4, seed: seed + 3 });
      break;
    }
    case 'strait': {
      shade();
      ink(pen, fly(span, 0), { width: 3, alpha: 0.5, seed });
      const heights = [0.3, 0.56, 0.82];
      ink(pen, bands(span, heights), {
        stroke: colors.stripe,
        width: 11,
        seed: seed + 1,
      });
      for (const height of heights) {
        const y = span.hem * height;
        const buckle: Point[] = [
          [-11, y - 11],
          [11, y - 11],
          [11, y + 11],
          [-11, y + 11],
        ];
        ink(pen, polygon(buckle), { fill: colors.trim, width: 3.5, seed });
        ink(pen, polygon([buckle[0] ?? [0, 0], [4, y]], 'open'), { width: 3 });
      }
      break;
    }
    case 'suit': {
      ink(pen, stripes(span, 22, 0), {
        stroke: colors.stripe,
        width: 3,
        seed: seed + 1,
      });
      shade();
      ink(
        pen,
        polygon([
          [-18, -30],
          [18, -30],
          [0, span.hem * LAPEL_DEPTH],
        ]),
        { fill: colors.shoe, width: 4, seed: seed + 2 },
      );
      ink(pen, fly(span), { width: 4, seed: seed + 3 });
      buttons(pen, span, [0.6, 0.78], colors.trim, seed + 4);
      break;
    }
    case 'pajama': {
      ink(pen, stripes(span, 24, 0), {
        stroke: colors.stripe,
        width: 8,
        seed: seed + 1,
        wobble: 2.5,
      });
      shade();
      ink(pen, lapels({ ...span, hem: span.hem * 0.5 }), {
        width: 4,
        seed: seed + 2,
      });
      buttons(pen, span, [0.36, 0.58, 0.8], colors.trim, seed + 4);
      break;
    }
    case 'toy': {
      ink(pen, bands(span, [0.22, 0.74]), {
        stroke: colors.stripe,
        width: 14,
        seed: seed + 1,
      });
      shade();
      buttons(pen, span, [0.38, 0.52], colors.trim, seed + 4);
      break;
    }
    default: {
      throw new Error('Unknown outfit');
    }
  }
}

const COLLAR = path('M -50,-6 C -30,-30 30,-30 50,-6 C 44,22 -44,22 -50,-6 Z');

/** What sits round the neck, drawn at the base of the neck over the torso. */
export function collar(pen: Pen, outfit: Outfit, seed: number): void {
  const colors = OUTFIT_PALETTE[outfit];
  switch (outfit) {
    case 'jacket': {
      ink(pen, COLLAR, { fill: colors.trim, seed });
      break;
    }
    case 'suit': {
      ink(pen, BOW_TIE, { fill: colors.trim, width: 4, seed });
      break;
    }
    case 'strait':
    case 'pajama':
    case 'toy': {
      ink(pen, COLLAR, {
        fill: outfit === 'toy' ? colors.trim : colors.body,
        width: 4,
        seed,
      });
      break;
    }
    default: {
      throw new Error('Unknown outfit');
    }
  }
}
