/**
 * Where the buttons over the meadow stand, and the sun they keep off, in CSS
 * pixels: the buttons are a finger's size on every screen, so they are placed
 * by what room the screen leaves rather than in proportion to it.
 */

import type { Circle } from '../../model/geometry';
import { FURNISHINGS } from '../../model/house';
import { CAP_KINDS } from '../../model/mushroom-genes';

/** The mute button's radius, and how far its edge keeps from the corner. */
const BUTTON_R = 28;
const BUTTON_INSET = 18;
/**
 * The radius of `+`, `−` and the house, the gap between each and the next,
 * and the `+`'s height at the lowest, as a share of the screen's.
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
/** The sun's longest rays reach this many radii out. */
export const SUN_RAY_REACH = 1.8;

export type Controls = {
  mute: Circle;
  plus: Circle;
  minus: Circle;
  house: Circle;
  /** One per `CAP_KINDS`, in that order. */
  picker: readonly Circle[];
  /** One per `FURNISHINGS`, in that order. */
  housePicker: readonly Circle[];
};

/** A picker's radius with `count` buttons abreast. */
function pickRadius(count: number, span: number, height: number): number {
  return Math.min(
    PICK_R,
    span / (PICK_SPACING * (count - 1) + 2),
    height * PICK_SHARE,
  );
}

/**
 * A picker's buttons across the top, as many of `count` abreast as keep a
 * finger's size — pushed below the mute where a narrow screen would have them
 * meet, and smaller on a short one.
 */
function pickerRow(
  count: number,
  width: number,
  height: number,
  mute: Circle,
): Circle[] {
  const span = width - BUTTON_INSET * 2;
  let abreast = count;
  while (abreast > 2 && pickRadius(abreast, span, height) < TAP_RADIUS) {
    abreast--;
  }
  const r = pickRadius(abreast, span, height);
  const gaps = abreast - 1;
  const step = Math.min(r * PICK_ROOMY_SPACING, (span - r * 2) / gaps);
  const first = width / 2 - (step * gaps) / 2;
  const clearOfMute = first - r >= mute.x + mute.r + BUTTON_INSET;
  const y = clearOfMute
    ? BUTTON_INSET + r
    : mute.y + mute.r + BUTTON_INSET + r;
  return Array.from({ length: abreast }, (_, index) => ({
    x: first + step * index,
    y,
    r,
  }));
}

/**
 * The mute in the top left; the two pickers across the top, one at a time, as
 * each closes the other; and `+`, `−` and the house down the right, where
 * Syama drew them: at `PLUS_HEIGHT`, raised where that would bring the house
 * down onto the ground, but never onto a picker's row or off the screen.
 *
 * A sky too short for three down the right stands the house left of `+`.
 * Where the rows, dropped below the mute, push the house under the ground's
 * edge, it takes the top right corner, opposite the mute, instead. A picker
 * too long for one row at a finger's size — only ever on a screen narrow
 * enough to drop the row below the mute — puts the rest in the band that
 * leaves free beside the mute.
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
  const picker = pickerRow(CAP_KINDS.length, width, height, mute);
  const houseRow = pickerRow(FURNISHINGS.length, width, height, mute);
  const x = width - BUTTON_INSET - GROW_R;
  const hit = tapReach(GROW_R);
  const below = GROW_R * 2 + GROW_GAP;
  // The lowest reach of any picker button standing over the column.
  const overColumn = [...picker, ...houseRow]
    .filter((pick) => pick.x + tapReach(pick.r) > x - hit)
    .map((pick) => pick.y + tapReach(pick.r) + GROW_GAP + hit);
  const column = hit * 2 + below * 2 <= groundTop - GROW_GAP ? 2 : 1;
  const plusY = Math.max(
    hit,
    ...overColumn,
    Math.min(height * PLUS_HEIGHT, groundTop - GROW_GAP - hit - below * column),
  );
  const underMinus = plusY + below * 2;
  const cornered = column === 2 && underMinus > groundTop;
  const house = {
    x: column === 1 ? x - below : x,
    y: column === 1 ? plusY : cornered ? BUTTON_INSET + GROW_R : underMinus,
    r: GROW_R,
  };
  // The band beside the mute, up to the house where it has the corner.
  const rest = FURNISHINGS.length - houseRow.length;
  const r = houseRow[0]?.r ?? TAP_RADIUS;
  const from = mute.x + mute.r + BUTTON_INSET;
  const to = cornered ? house.x - hit - BUTTON_INSET : width - BUTTON_INSET;
  const band = Array.from({ length: rest }, (_, index) => ({
    x: from + ((to - from) * (index + 1)) / (rest + 1),
    y: BUTTON_INSET + r,
    r,
  }));
  return {
    mute,
    plus: { x, y: plusY, r: GROW_R },
    minus: { x, y: plusY + below, r: GROW_R },
    house,
    picker,
    housePicker: [...houseRow, ...band],
  };
}

/**
 * The sun in the top right, pulled in from the corner until its glow fits.
 * Where its rays would reach a picker's row it comes down below the rows —
 * over on the left, where a phone's narrow width brings a row down onto the
 * sun itself — and it moves left until its rays keep `BUTTON_INSET` off the
 * buttons down the right.
 */
export function placeSun(
  width: number,
  height: number,
  r: number,
  { plus, minus, house, picker, housePicker }: Controls,
): Circle {
  const glow = r * SUN_GLOW_REACH;
  const rays = r * SUN_RAY_REACH;
  const corner = {
    x: Math.min(width * 0.84, width - glow),
    y: Math.max(height * 0.15, glow),
  };
  const picks = [...picker, ...housePicker];
  const meets = (reach: number) =>
    picks.some(
      (pick) =>
        Math.hypot(pick.x - corner.x, pick.y - corner.y) <
        tapReach(pick.r) + reach,
    );
  const { x: across, y } = meets(rays)
    ? {
        x: meets(r) ? width - corner.x : corner.x,
        y: Math.max(...picks.map((pick) => pick.y + tapReach(pick.r))) + rays,
      }
    : corner;
  const x = Math.min(
    across,
    ...[plus, minus, house].map((button) => {
      const reach = tapReach(button.r) + rays + BUTTON_INSET;
      const rise = button.y - y;
      return Math.abs(rise) < reach
        ? button.x - Math.sqrt(reach ** 2 - rise ** 2)
        : across;
    }),
  );
  return { x, y, r };
}
