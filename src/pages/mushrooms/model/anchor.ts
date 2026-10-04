/**
 * The eye the meadow's rules are judged from: the walking eye snapped to a
 * coarse lattice, so the layout anchored at it, and every rule cached on it,
 * changes a few times a second while the child walks, not every frame.
 */

import { D_SEE, type Eye } from './ground';

/** How far, in the clump's size, the eye walks before the anchor moves. */
export const ANCHOR_STEP = 0.5;

/** How far the eye turns before the anchor turns: the angle `ANCHOR_STEP` subtends at the brow. */
export const ANCHOR_TURN = ANCHOR_STEP / D_SEE;

/** `eye` snapped to the anchor lattice; an anchor is its own anchor. */
export function anchorOf({ x, y, heading }: Eye): Eye {
  return {
    x: snapped(x, ANCHOR_STEP),
    y: snapped(y, ANCHOR_STEP),
    heading: snapped(heading, ANCHOR_TURN),
  };
}

/** Whether two anchors are the same, so nothing judged at one needs judging again. */
export function sameAnchor(a: Eye, b: Eye): boolean {
  return a.x === b.x && a.y === b.y && a.heading === b.heading;
}

function snapped(value: number, step: number): number {
  return Math.round(value / step) * step;
}
