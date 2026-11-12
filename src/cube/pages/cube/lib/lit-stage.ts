import { INTRO_STAGE, type Shot, type Stage } from '@/cube/features/player';

import { OUTSIDE_LENS, type OutsideLens } from './outside-lens';

/**
 * The intro's stage as this page's lenses expose it: a scene's exposure is a
 * multiple of the outdoor lens's, and floor 1's lens holds 1.
 */
export const LIT_STAGE: Stage = {
  ...INTRO_STAGE,
  indoors: 1 / OUTSIDE_LENS.exposure,
};

/** The lens a scene's camera sees through at `shot`. */
export const lensOf = ({ exposure, lids }: Shot): OutsideLens => ({
  exposure: OUTSIDE_LENS.exposure * exposure,
  eyelids: lids,
});
