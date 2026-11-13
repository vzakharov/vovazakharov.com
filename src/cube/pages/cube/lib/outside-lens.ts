import type { Exposed } from '@/cube/entities/theme';

import { DAYLIGHT_LENS } from './daylight-lens.shader';
import { firstFloorThrough } from './shader';

/** What the outside's lens is set to for one frame. */
export type OutsideLens = Exposed & {
  /** How far the eyelids are open: 0 shut, 1 wide. */
  eyelids: number;
  /**
   * How far the eye has become floor 1's: absent or 0, the outside's film at
   * `exposure`; 1, floor 1's own lens to the pixel, whatever `exposure` is;
   * between, the two mixed. An eye crossing the doorway runs it from one end
   * to the other, so the frame on either side of the switch is the same.
   */
  indoors?: number;
};

/**
 * The lens of an eye that has been outdoors a while: it puts sunlit sand in
 * the film's upper middle and leaves the sun's disc and its path on the
 * water to burn out.
 */
export const OUTSIDE_LENS: OutsideLens = { exposure: 0.3, eyelids: 1 };

/** The whole shader of the outside's lens. */
export const outsideLensSource = (): string => firstFloorThrough(DAYLIGHT_LENS);
