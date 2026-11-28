/** Alphabet blocks: a face colour each, with its lit top and shaded side. */
export const BLOCK_PALETTE = {
  faces: [
    ['#ff595e', '#ff8a8d', '#c9393e'],
    ['#1982c4', '#4fa6dc', '#0f5f91'],
    ['#8ac926', '#acdc5c', '#649419'],
    ['#ffca3a', '#ffdb74', '#d9a10f'],
    ['#6a4c93', '#8f75b3', '#4b336c'],
  ],
  /** The letter's colour on every face, over its own ink outline. */
  letter: ['#fffdf5'],
  letterShadow: '#00000040',
} as const;
