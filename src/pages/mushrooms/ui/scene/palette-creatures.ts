/**
 * `PALETTE`'s creatures section: the mushrooms, the flowers, the house, the
 * insects and the HUD, and the shadow they cast. A dark fill — a dark cap,
 * the doorway, an insect's body — stays dark enough to stand 3:1 off the
 * deepest ground by itself, a hue nudge included, so its ink can be a lighter
 * line that stands off it (`inkFor`); a fill a little lighter than that gets
 * only a dark edge it barely stands off.
 */
export const CREATURES = {
  /** A shadow cast on the grass: cool, as a sunlit scene's shadows are. */
  shadowCool: 0x24_48_40,
  /** Shade laid over a creature's fill at low alpha: bluer, never blacker. */
  shadeCool: 0x3a_2c_6a,
  /** The warm light along a cap's sun-facing edge, and the pale one just inside every lit contour and in every shine. */
  capLit: 0xff_7a_52,
  rimLight: 0xff_f0_d0,
  stem: 0xfb_f3_df,
  /** The warm light down a stem's sun side: the cap's `capLit`, for a pale fill. */
  stemLit: 0xff_d6_8a,
  gills: 0xef_dc_b6,
  capRed: 0xe6_36_2b,
  capDark: 0x48_11_24,
  spot: 0xff_fb_f1,
  flowerStem: 0x4c_a0_3c,
  leaf: 0x5e_b8_48,
  flowerCentre: 0xff_c8_2e,
  flowerCentreDeep: 0xe8_8a_1c,
  /**
   * One per `FLOWER_COLOURS` name, the flowers' petals; with the
   * butterflies', a little softer than pure and turned a few degrees toward
   * the sun's yellow, a warm cast over the lit meadow.
   */
  flowers: {
    pink: 0xff_9a_c0,
    yellow: 0xff_e7_5c,
    white: 0xff_fb_f4,
    violet: 0xbf_88_f0,
    blue: 0x7b_c4_ff,
  },
  spore: 0xff_f6_d8,
  /** The buttons' discs: a warm white, so they sit in the palette. */
  hud: 0xff_fa_f0,
  /** The `+` and `−` badges. */
  grow: 0x4c_b0_4a,
  shrink: 0xe8_7a_2c,
  /**
   * The band round a selected mushroom and its ring on the ground: a warm
   * yellow as far from the grass, the sky and the caps as a colour gets, and
   * edged in `ink` against the pale ones.
   */
  selection: 0xff_d4_1a,
  /**
   * A window's pane: a warm lamplight, as if the room behind were lit — the
   * hue dusk turns up.
   */
  windowPane: 0xff_d8_6a,
  windowShine: 0xff_f4_c8,
  /** Window frames, and the door's wood with its planks' darker grain. */
  wood: 0xb0_6e_3a,
  woodDeep: 0x86_4e_28,
  doorKnob: 0xff_c8_46,
  /** The dark inside an open door, which the mouse comes out of. */
  doorway: 0x33_1a_13,
  mouse: 0xa4_a2_ae,
  mouseLight: 0xd2_d0_da,
  mousePink: 0xff_a2_b4,
  mouseEye: 0x1e_12_12,
  /** One per `BUTTERFLY_COLOURS` name: a butterfly's wings and its eyes' rings. */
  butterflies: {
    coral: 0xff_87_63,
    peach: 0xff_c3_92,
    orange: 0xff_b2_43,
    yellow: 0xff_e6_50,
    lemon: 0xed_f2_6d,
    mint: 0x5f_d8_a5,
    turquoise: 0x41_d0_d8,
    sky: 0x60_ba_ff,
    cobalt: 0x5b_83_f0,
    periwinkle: 0x9f_90_ff,
    violet: 0xbe_84_f2,
    magenta: 0xda_67_d4,
    rose: 0xff_85_b3,
    white: 0xff_fb_f2,
  },
  /** A butterfly's body, warm and dark, and the dark ring of its wings' eyes. */
  insectBody: 0x33_1d_1a,
  wingEye: 0x3a_1c_2a,
  /** A fly's dark body, which its sheen tints, and its big eyes, a cheerful red. */
  flyBody: 0x23_26_2b,
  flyEye: 0xe8_3a_2e,
  flyEyeDeep: 0xa8_1e_1e,
  /** One per `FLY_SHEENS` name: the metal a fly's body catches the light in. */
  flySheens: {
    bottle: 0x3c_a0_4c,
    emerald: 0x22_b8_78,
    teal: 0x1e_a8_a8,
    peacock: 0x2a_8c_d0,
    bluebottle: 0x3e_64_e0,
  },
  /** A bee's black bands and head. */
  beeBlack: 0x2a_21_1f,
  /** One per `BEE_YELLOWS` name: a bee's yellow bands. */
  beeYellows: {
    lemon: 0xff_e6_48,
    gold: 0xff_cc_22,
    amber: 0xff_b0_1e,
    honey: 0xf0_a0_2a,
  },
  /** The pollen in a bee's baskets, a flower's centre carried off. */
  pollen: 0xff_a8_1a,
  /** A fly's and a bee's clear wings: the glass, laid over at low alpha, and its veins. */
  wingGlass: 0xe8_f6_ff,
  wingVein: 0x5a_6a_7e,
} as const;
