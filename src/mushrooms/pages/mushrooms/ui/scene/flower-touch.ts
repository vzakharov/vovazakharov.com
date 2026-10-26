import type { Action } from '../../model/game';

/** How a finger reaches a flower: Phaser's one pointer taps it; any finger past that plays it in a chord. */
export type FlowerTouch = 'tap' | 'chord';

/**
 * What a touch on a flower asks of the meadow beyond opening the flower and
 * sounding it. A tap is a tap on the meadow too, so it deselects; a chord
 * finger only plays, so a selection and an open picker hold under it.
 */
export const FLOWER_TOUCH_ACTIONS = {
  tap: [{ kind: 'deselect' }],
  chord: [],
} as const satisfies Record<FlowerTouch, readonly Action[]>;
