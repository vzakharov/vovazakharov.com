/**
 * The colours every drawing in the clip shares. With the `palette-*.ts`
 * modules beside the scenes that own the rest, this is the one place the clip
 * holds colour literals: a canvas is out of the CSS tokens' reach.
 */
export const INK_PALETTE = {
  /** The outline of everything, and the dark of every shadow. */
  ink: '#141216',
  skin: '#e2d4ac',
  metal: '#8f939b',
  metalDark: '#5d6169',
  metalLight: '#c3c7cd',
  bone: '#ece6d2',
} as const;
