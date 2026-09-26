/**
 * Every colour the game paints. The one file on the site holding colour
 * literals: a canvas is out of the CSS tokens' reach, so this is the canvas's
 * token table. A per-mushroom variation is a gene applied on top, never a
 * literal elsewhere.
 */
export const PALETTE = {
  skyTop: 0x5a_b8_ee,
  skyHorizon: 0xd4_f1_ff,
  sun: 0xff_e0_5c,
  sunGlow: 0xff_f4_b8,
  sunRay: 0xff_c8_46,
  sunRayDeep: 0xff_a8_36,
  sunInner: 0xff_f0_9e,
  cloud: 0xff_ff_ff,
  cloudShade: 0xd8_ea_f6,
  farHill: 0xa6_d8_a0,
  farHillShade: 0x93_ca_92,
  nearHill: 0x78_c4_5e,
  nearHillShade: 0x66_b0_50,
  ground: 0x5c_b0_46,
  groundDeep: 0x46_94_3a,
  tuft: 0x86_d0_62,
  tuftDark: 0x3e_88_34,
  /** Cartoon ink: every outline in the foreground. */
  ink: 0x3b_22_18,
  /** Laid over a fill at low alpha, so one shade works on every colour. */
  shadeInk: 0x2a_10_10,
  highlight: 0xff_ff_ff,
  groundShadow: 0x1e_4a_1a,
  stem: 0xfb_f3_df,
  gills: 0xef_dc_b6,
  capRed: 0xe6_36_2b,
  capDark: 0x6e_1d_22,
  spot: 0xff_fb_f1,
} as const;
