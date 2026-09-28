/** `PALETTE`'s creatures section: the mushrooms, the flowers, the house, the insects and the HUD, and the shadow they cast. */
export const CREATURES = {
  /** A shadow cast on the grass: cool, as a sunlit scene's shadows are. */
  shadowCool: 0x24_48_40,
  /** Shade laid over a creature's fill at low alpha: bluer, never blacker. */
  shadeCool: 0x3a_2c_6a,
  /** The warm light along a cap's sun-facing edge, and the pale one just inside every lit contour and in every shine. */
  capLit: 0xff_7a_52,
  rimLight: 0xff_f0_d0,
  groundShadow: 0x1e_4a_1a,
  stem: 0xfb_f3_df,
  gills: 0xef_dc_b6,
  capRed: 0xe6_36_2b,
  capDark: 0x5a_18_2e,
  spot: 0xff_fb_f1,
  flowerStem: 0x4c_a0_3c,
  leaf: 0x5e_b8_48,
  flowerCentre: 0xff_c8_2e,
  flowerCentreDeep: 0xe8_8a_1c,
  /** One per `FLOWER_COLOURS` name, the flowers' petals. */
  flowers: {
    pink: 0xff_8f_c0,
    yellow: 0xff_de_4a,
    white: 0xff_fb_f4,
    violet: 0xb2_7c_f0,
    blue: 0x6c_b4_ff,
  },
  spore: 0xff_f6_d8,
  hud: 0xff_ff_ff,
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
  doorway: 0x3a_1e_16,
  mouse: 0xa4_a2_ae,
  mouseLight: 0xd2_d0_da,
  mousePink: 0xff_a2_b4,
  mouseEye: 0x1e_12_12,
  /** One per `BUTTERFLY_COLOURS` name: a butterfly's wings and its eyes' rings. */
  butterflies: {
    coral: 0xff_6e_52,
    peach: 0xff_b4_86,
    orange: 0xff_9a_2e,
    yellow: 0xff_dc_3c,
    lemon: 0xec_f2_5e,
    mint: 0x52_d8_a8,
    turquoise: 0x30_c4_d8,
    sky: 0x4e_a6_ff,
    cobalt: 0x4a_6c_f0,
    periwinkle: 0x8c_84_ff,
    violet: 0xb0_78_f2,
    magenta: 0xd8_5a_da,
    rose: 0xff_78_b4,
    white: 0xff_fb_f2,
  },
  /** A butterfly's body, warm and dark, and the dark ring of its wings' eyes. */
  insectBody: 0x4a_2c_28,
  wingEye: 0x3a_1c_2a,
  /** A fly's dark body, which its sheen tints, and its big eyes, a cheerful red. */
  flyBody: 0x2c_30_36,
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
  beeBlack: 0x2e_24_22,
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
