/** The dice's drawing on a 24-unit square, for the page's icon and the card. */
export const DICE_VIEW_BOX = '0 0 24 24';

export const DICE_FACE = { size: 11, radius: 3, pipRadius: 1 };

/** Back die first, so the front one overlaps it. */
export const DICE_FACES = [
  {
    side: 'back',
    rotate: 'rotate(-14 8 13)',
    at: [2.5, 7.5],
    pips: [
      [5.7, 10.7],
      [8, 13],
      [10.3, 15.3],
    ],
  },
  {
    side: 'front',
    rotate: 'rotate(12 16 10)',
    at: [10.5, 4.5],
    pips: [
      [13.6, 7.6],
      [18.4, 7.6],
      [13.6, 12.4],
      [18.4, 12.4],
    ],
  },
] as const;

export type DiceSide = (typeof DICE_FACES)[number]['side'];
