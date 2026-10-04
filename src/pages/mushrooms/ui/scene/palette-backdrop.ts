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
  /** A rain cloud, its cool underside and its rim on the sun's side: each a dark twin's counterpart of the three above. */
  rainCloud: 0x8c_92_aa,
  rainCloudShade: 0x6a_6e_8a,
  rainCloudLit: 0xa6_aa_be,
  /** The slate wash over the meadow while it rains. */
  rainWash: 0x2e_36_4e,
  /** The blue-violet wash over the meadow at dusk. */
  duskWash: 0x26_1c_5e,
  /** The moon's lit face, the crescent of its shadow, and its rosette halo. */
  moon: 0xfa_f4_dc,
  moonShade: 0xc6_c2_dc,
  moonHalo: 0xc8_c4_f4,
  /** A star in the dusk sky. */
  star: 0xff_f6_d8,
  /** A falling drop's streak, pale against the darkened sky and the wash. */
  rainDrop: 0xd6_ea_ff,
  /** The ring a drop splashes where it lands. */
  rainSplash: 0xe8_f4_ff,
  /** The rainbow's bands, outermost first. */
  rainbow: [
    0xff_5e_5e, 0xff_a6_4a, 0xff_e6_5a, 0x7c_d0_6a, 0x5a_b0_e8, 0x6e_72_d8,
    0xa8_6a_d4,
  ],
  farHill: 0x8f_c4_9c,
  nearHill: 0x80_c2_62,
  /** The ground far off, sunlit: only behind the flowers' back row. */
  groundLit: 0x9c_cc_62,
  ground: 0x58_a8_48,
  /** The ground at the bottom edge, and the darkest it ever gets. */
  groundDeep: 0x3a_7e_46,
  /** The light catching the meadow's brow, where the ground rounds over its horizon. */
  browLit: 0xe8_f6_b4,
  tuft: 0x86_d0_62,
  tuftDark: 0x2e_6c_2c,
  /** The glow on the ground under the tuft the flower picker is open on. */
  sproutGlow: 0xff_f8_d0,
} as const;
