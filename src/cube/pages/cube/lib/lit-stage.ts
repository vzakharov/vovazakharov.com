import type { Shot } from '@/cube/features/player';

import { OUTSIDE_LENS, type OutsideLens } from './outside-lens';

/** The lens a scene's camera sees through at `shot`. */
export const lensOf = ({ exposure, lids }: Shot): OutsideLens => ({
  exposure: OUTSIDE_LENS.exposure * exposure,
  eyelids: lids,
});
