/** The bedroom at 3 am: the floor, the bed, the night through the window, the set's glow. */
export const BEDROOM_PALETTE = {
  floor: '#3b2f3a',
  floorSeam: '#2a2129',
  bedFrame: '#6b4a3a',
  sheet: '#d9d2c2',
  blanket: '#4f6fa8',
  blanketFold: '#3d5788',
  pillow: '#ece6d6',
  sky: '#141a3a',
  moon: '#f2e9b8',
  sill: '#7a6a58',
  /** The summer afternoon the window shows instead of the night. */
  summerSky: '#7fc8f0',
  sun: '#ffd23a',
  field: '#8cc44a',
  fence: '#b07a42',
  /** A sweat drop, and the damp it leaves on the pillow. */
  sweat: '#bfe2ff',
  damp: '#9a978c',
  tvBody: '#2f2d33',
  stand: '#4a3c33',
  night: '#0b0d1e',
  glowEdge: 'rgba(0, 0, 0, 0)',
  /** The screen's colour as it washes the room, one per quarter in turn. */
  washes: [
    'rgba(170, 210, 255, 0.42)',
    'rgba(255, 120, 190, 0.38)',
    'rgba(140, 255, 170, 0.34)',
    'rgba(255, 220, 110, 0.36)',
  ],
  /** The one cold colour the set washes the room in while he sweats. */
  coldWash: 'rgba(120, 190, 255, 0.5)',
  /** What the set throws on the wallpaper behind whoever stands in its light. */
  castShadow: '#140f1c',
} as const;
