/** The head's own colours, over the ink, skin, metal and bone the kit shares. */
export const HEAD_PALETTE = {
  hair: '#2a2420',
  mohawk: '#c8ff2e',
  mohawkDark: '#7fae12',
  eyeWhite: '#f4f1e4',
  iris: '#6b4a2a',
  /** The dark inside the mask: the socket, the nose, the mouth. */
  hollow: '#0c0b10',
  maw: '#a3121c',
  glint: '#ffffff',
  sweat: '#9fe8ff',
  scarf: '#1b1a20',
} as const;

/** LED colours, each `#rrggbb`: the glow fades one out by appending an alpha. */
export const LED_PALETTE = {
  red: '#ff2a1a',
  green: '#39ff88',
} as const;
