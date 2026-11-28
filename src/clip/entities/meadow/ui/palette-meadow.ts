/** The kids'-show meadow: a cardboard sun, felt hills, cotton clouds. */
export const MEADOW_PALETTE = {
  sun: '#ffc93c',
  sunRays: '#ff9f1c',
  /** The sun's face, a paler disc glued on. */
  sunFace: '#ffe27a',
  cheek: '#ff7a8a',
  eyeWhite: '#fffdf5',
  pupil: '#1d1530',
  /** Back hills to front: hazed far off, saturated near. */
  hills: ['#bfe3a0', '#94d26b', '#6cbf45', '#4fa834'],
  tuft: '#3b8a26',
  cloud: '#ffffff',
  cloudShade: '#dbe9f7',
} as const;

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
