/** The ghost bunny's colours, its wallpaper's and its audience's. */
export const BUNNY_PALETTE = {
  /** The bunny itself: wallpaper paper gone pale. */
  paper: '#eef3f7',
  pink: '#f08aa8',
  button: '#17161b',
  thread: '#e8e4da',
  /** The dark of an opened mouth. */
  mouth: '#2a0d12',
  glow: '#fff36b',
  glowCore: '#fffbd0',
  /** The cold light a near bunny gives off. */
  aura: '#bfe6ff',
  /** The flat dark it casts on a wall. */
  shadow: '#0b1719',
} as const;

/** The nursery wallpaper the bunny came off. */
export const WALLPAPER_PALETTE = {
  ground: '#363b78',
  motif: '#8b92d6',
  sprig: '#5a609f',
  /** The bare plaster behind the hole. */
  plaster: '#1d1a1c',
  /** The torn paper's white edge round the hole. */
  torn: '#d9d2bf',
} as const;

/** The TV studio's audience, seen from behind. */
export const AUDIENCE_PALETTE = {
  fur: '#1b1922',
  /** The stage light catching the ears' edges. */
  rim: '#ff5fa2',
  /** An ear gone up as a rocket: its exhaust and the smoke it leaves. */
  flame: '#ff8a1f',
  flameCore: '#fff2a8',
  smoke: '#d8d2e0',
} as const;
