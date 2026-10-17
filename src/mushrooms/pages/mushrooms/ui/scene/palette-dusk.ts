/**
 * The backdrop's colours at full dusk, each the twin of `PALETTE`'s colour by
 * the same name: a deep indigo top paling through violet and mauve to a
 * rose-amber band at the hills, dimmer violet-green hills and ground under a
 * lavender mist, and clouds lit rose from below. The backdrop is toned from
 * these as from the day's (`tonesOf`), and the two cross-faded by `duskness`.
 */
export const DUSK = {
  skyTop: 0x1c_1e_52,
  /** What the sky pales toward through its middle: a soft lavender. */
  highlight: 0xb4_96_dc,
  skyHorizon: 0xd8_86_a8,
  /** The sky at the hills' crests: the last of the sun's warmth. */
  skyLow: 0xff_c4_86,
  /** The rim the crests catch on the side the sun went down. */
  sunGlow: 0xff_b4_8c,
  /** What distance takes a colour toward: a lavender mist. */
  air: 0x8a_7c_b4,
  farHill: 0x5c_70_8e,
  nearHill: 0x4e_76_62,
  groundLit: 0x62_84_5e,
  ground: 0x46_6e_52,
  groundDeep: 0x30_52_44,
  browLit: 0xe8_b8_a4,
  /** As far over the dusk ground as the day's tuft stands over the day's, so the grass never glows. */
  tuft: 0x5a_88_58,
  tuftDark: 0x22_44_34,
  cloud: 0xa8_96_cc,
  /** A cloud's underside, lit rose by the sun below the hills. */
  cloudShade: 0xff_b0_96,
  cloudLit: 0xc4_b0_e0,
} as const;
