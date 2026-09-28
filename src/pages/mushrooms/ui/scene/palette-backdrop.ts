/** `PALETTE`'s backdrop section: the sky, the sun, the clouds, the hills and the ground. */
export const BACKDROP = {
  skyTop: 0x6c_b4_e6,
  /** The sky at the hills' crests: a warm cream, as a sky pales toward the light. */
  skyLow: 0xfc_ee_d2,
  /** The sun's warmth over the sky round it, laid on at a few per cent. */
  skyWarm: 0xff_e8_b8,
  sun: 0xff_e0_5c,
  sunGlow: 0xff_f4_b8,
  sunRay: 0xff_c8_46,
  sunRayDeep: 0xff_a8_36,
  sunInner: 0xff_f0_9e,
  cloud: 0xff_ff_ff,
  /** A cloud's cool side, away from the sun. */
  cloudShade: 0xe2_dc_f0,
  /** A cloud's rim on the sun's side. */
  cloudLit: 0xff_f6_e4,
  farHill: 0x8f_c4_9c,
  nearHill: 0x80_c2_62,
  /** The ground far off, sunlit: only behind the flowers' back row. */
  groundLit: 0x9c_cc_62,
  ground: 0x58_a8_48,
  /** The ground at the bottom edge, and the darkest it ever gets. */
  groundDeep: 0x3a_7e_46,
  tuft: 0x86_d0_62,
  tuftDark: 0x2e_6c_2c,
} as const;
