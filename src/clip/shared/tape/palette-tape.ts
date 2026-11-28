/** The tape's colours: the TV, the VCR's display, and the test card. */
export const TAPE_PALETTE = {
  /** Around the 4:3 picture: the dark of the tube's unlit edge. */
  bezel: '#050506',
  black: '#000000',
  white: '#ffffff',
  /** The channel masks the chroma split separates the picture into. */
  red: '#ff0000',
  cyan: '#00ffff',
  /** A neutral the `saturation` blend takes the colour out with. */
  grey: '#808080',
  /** What tape lifts the picture's black to. */
  lift: '#141a26',
  transparent: 'rgba(0, 0, 0, 0)',
  glare: 'rgba(235, 245, 255, 1)',
  glareEdge: 'rgba(235, 245, 255, 0)',
  /** The tube's last light: a blue-white phosphor. */
  phosphor: '#e8f4ff',
  phosphorEdge: 'rgba(160, 200, 255, 0)',
  osd: '#f2f6ee',
  osdShadow: '#08080c',
  osdChannel: '#6dff7e',
  osdRec: '#ff3d2e',
  bugDisc: '#ffd23e',
  /** SMPTE bars at 75%, left to right. */
  bars: [
    '#bfbfbf',
    '#bfbf00',
    '#00bfbf',
    '#00bf00',
    '#bf00bf',
    '#bf0000',
    '#0000bf',
  ],
  /** The strip under the bars, mirrored. */
  castellations: [
    '#0000bf',
    '#131313',
    '#bf00bf',
    '#131313',
    '#00bfbf',
    '#131313',
    '#bfbfbf',
  ],
  /** The bottom ramp, black to white. */
  ramp: ['#0d0d0d', '#333333', '#5c5c5c', '#858585', '#adadad', '#ebebeb'],
} as const;
