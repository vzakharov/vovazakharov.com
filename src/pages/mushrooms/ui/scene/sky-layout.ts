/**
 * Where the buttons over the meadow stand, and the sun they keep off, in CSS
 * pixels: the buttons are a finger's size on every screen, so they are placed
 * by what room the screen leaves rather than in proportion to it.
 */

import type { Circle } from '../../model/geometry';
import { CAP_KINDS } from '../../model/mushroom-genes';

/** The mute button's radius, and how far its edge keeps from the corner. */
const BUTTON_R = 28;
const BUTTON_INSET = 18;
/**
 * The `+` and `−` buttons' radius, the gap between them, and the `+`'s height
 * at the lowest, as a share of the screen's.
 */
const GROW_R = 36;
const GROW_GAP = 16;
const PLUS_HEIGHT = 0.36;
/**
 * The picker's buttons at their largest, and their spacing in radii: at the
 * least, which a narrow screen gets, and where there is room.
 */
const PICK_R = 46;
const PICK_SPACING = 2.2;
const PICK_ROOMY_SPACING = 2.7;
/**
 * The picker's buttons at their largest on a short screen, as a share of its
 * height, so the row keeps to the sky above the clump's caps.
 */
const PICK_SHARE = 0.095;
/**
 * The least radius, in CSS pixels, a tap target reaches: 64 across, which a
 * six-year-old's finger finds without aiming.
 */
export const TAP_RADIUS = 32;

/** A tap target's hit radius: what it draws, and never under `TAP_RADIUS`. */
export function tapReach(r: number): number {
  return Math.max(r, TAP_RADIUS);
}

/** The sun's glow reaches this many radii out, and must stay on screen. */
export const SUN_GLOW_REACH = 2.6;

export type Controls = {
  mute: Circle;
  plus: Circle;
  minus: Circle;
  /** One per `CAP_KINDS`, in that order. */
  picker: readonly Circle[];
};

/**
 * The mute in the top left; the picker across the top — pushed below the mute
 * where a narrow screen would have them meet, and smaller on a short one —
 * and the `+` and `−` on the right, where Syama drew them: at `PLUS_HEIGHT`,
 * raised where that would bring the `−` down onto the ground, but never onto
 * the picker's row or off the screen.
 */
export function placeControls(
  width: number,
  height: number,
  groundTop: number,
): Controls {
  const mute = {
    x: BUTTON_INSET + BUTTON_R,
    y: BUTTON_INSET + BUTTON_R,
    r: BUTTON_R,
  };
  const span = width - BUTTON_INSET * 2;
  const gaps = CAP_KINDS.length - 1;
  const r = Math.min(
    PICK_R,
    span / (PICK_SPACING * gaps + 2),
    height * PICK_SHARE,
  );
  const step = Math.min(r * PICK_ROOMY_SPACING, (span - r * 2) / gaps);
  const first = width / 2 - (step * gaps) / 2;
  const clearOfMute = first - r >= mute.x + mute.r + BUTTON_INSET;
  const y = clearOfMute ? BUTTON_INSET + r : mute.y + mute.r + BUTTON_INSET + r;
  const x = width - BUTTON_INSET - GROW_R;
  const hit = tapReach(GROW_R);
  const below = GROW_R * 2 + GROW_GAP;
  const last = first + step * gaps;
  const underRow = last + tapReach(r) > x - hit;
  const plusY = Math.max(
    underRow ? y + tapReach(r) + GROW_GAP + hit : hit,
    Math.min(height * PLUS_HEIGHT, groundTop - GROW_GAP - hit - below),
  );
  return {
    mute,
    plus: { x, y: plusY, r: GROW_R },
    minus: { x, y: plusY + below, r: GROW_R },
    picker: CAP_KINDS.map((_, index) => ({ x: first + step * index, y, r })),
  };
}

/**
 * The sun in the top right, pulled in from the corner until its glow fits;
 * where the picker's row comes down onto it, which a phone's narrow width
 * calls for, it stands below the row on the left instead, the `+` and `−`
 * keeping the right.
 */
export function placeSun(
  width: number,
  height: number,
  r: number,
  picker: readonly Circle[],
): Circle {
  const glow = r * SUN_GLOW_REACH;
  const sun = {
    x: Math.min(width * 0.84, width - glow),
    y: Math.max(height * 0.15, glow),
    r,
  };
  const [row] = picker;
  const onRow = picker.some(
    (pick) => Math.hypot(pick.x - sun.x, pick.y - sun.y) < tapReach(pick.r) + r,
  );
  if (!onRow || row === undefined) return sun;
  return {
    x: width - sun.x,
    y: row.y + tapReach(row.r) + BUTTON_INSET + r,
    r,
  };
}
