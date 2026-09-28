import { BACKDROP } from './palette-backdrop';
import { CREATURES } from './palette-creatures';

/** The colours both the backdrop and the creatures paint with. */
const SHARED = {
  skyHorizon: 0xd4_f1_ff,
  /** What distance takes a colour toward at ground level: a pale green-blue mist. */
  air: 0xd6_ea_e4,
  /** Cartoon ink: every outline in the foreground. */
  ink: 0x3b_22_18,
  /** A deep indigo: the warm sun's complement, and the blue of Syama's pen. */
  inkCool: 0x26_2a_5c,
  /** Laid over a fill at low alpha, so one shade works on every colour. */
  shadeInk: 0x2a_10_10,
  highlight: 0xff_ff_ff,
} as const;

/**
 * Every colour the game paints. This module and its two sections,
 * `palette-backdrop.ts` and `palette-creatures.ts`, are the one place on the
 * site holding colour literals: a canvas is out of the CSS tokens' reach, so
 * they are the canvas's token table. A per-mushroom variation is a gene
 * applied on top, never a literal elsewhere.
 */
export const PALETTE = { ...SHARED, ...BACKDROP, ...CREATURES } as const;
