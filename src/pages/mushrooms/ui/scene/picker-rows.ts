/**
 * The pickers' rows across the top of the sky, in CSS pixels: as many of a
 * picker's buttons abreast as keep a finger's size, the rest beside the mute
 * or under the row, each held `PICK_CLEAR` off every other button.
 */

import type { Circle } from '../../model/geometry';
import {
  apart,
  BUTTON_INSET,
  GROW_GAP,
  TAP_RADIUS,
  tapReach,
} from './tap-reach';

/**
 * The picker's buttons at their largest, and their spacing in radii: at the
 * least, which a narrow screen gets, and where there is room.
 */
const PICK_R = 46;
const PICK_SPACING = 2.2;
const PICK_ROOMY_SPACING = 2.7;
/**
 * The picker's buttons at their largest on a short screen, as a share of its
 * height, so the row keeps to the sky above the clump's caps; never under a
 * finger's size, which a short sky keeps by the buttons in the row's way
 * giving way to it (`Controls.yielding`).
 */
const PICK_SHARE = 0.095;
/**
 * How far an open picker's buttons keep, at the least, from the reach of
 * every button standing while it is open, so none reads as touching another:
 * the gap its own buttons keep at a finger's size.
 */
export const PICK_CLEAR = (PICK_SPACING - 2) * TAP_RADIUS;
/**
 * How far a picker's row keeps from the buttons it shares the top row with,
 * where the screen has room: wider than the gaps inside either, so the row
 * reads as a group of its own rather than as more of the controls.
 */
export const PICK_APART = GROW_GAP * 2;

/** `count` buttons standing as `row` does, as many abreast as it holds, the rest in rows under it. */
export function stacked(row: readonly Circle[], count: number): Circle[] {
  const step = (row[0] ? tapReach(row[0].r) * 2 : 0) + GROW_GAP;
  return Array.from({ length: count }, (_, index) => {
    const at = row[index % row.length];
    if (!at) throw new Error('A picker row with no buttons');
    return { ...at, y: at.y + step * Math.floor(index / row.length) };
  });
}

/** A picker's radius with `count` buttons abreast. */
function pickRadius(count: number, span: number, height: number): number {
  return Math.min(
    PICK_R,
    span / (PICK_SPACING * (count - 1) + 2),
    Math.max(height * PICK_SHARE, TAP_RADIUS),
  );
}

/** Where the mute button stands, which a picker's row keeps off. */
export type WithMute = { mute: Circle };

type PickerRowParams = WithMute & { dropped: number };

/**
 * A picker's buttons across the top, as many of `count` abreast as keep a
 * finger's size — their top edge `dropped` where a narrow screen would have
 * them meet the `mute`, and smaller on a short one.
 */
export function pickerRow(
  count: number,
  [width, height]: readonly [number, number],
  { mute, dropped }: PickerRowParams,
): Circle[] {
  const row = rowAcross(count, [BUTTON_INSET, width - BUTTON_INSET], height);
  const [first] = row;
  const clearOfMute =
    first !== undefined && first.x - first.r >= mute.x + mute.r + BUTTON_INSET;
  if (clearOfMute) return row;
  return row.map((pick) => ({ ...pick, y: dropped + pick.r }));
}

/**
 * As many of `count` buttons abreast as keep a finger's size, across the
 * top between `left` and `right`, as near their middle as their spacing
 * lets them.
 */
function rowAcross(
  count: number,
  [left, right]: readonly [number, number],
  height: number,
): Circle[] {
  const span = right - left;
  let abreast = count;
  while (abreast > 2 && pickRadius(abreast, span, height) < TAP_RADIUS) {
    abreast--;
  }
  const r = pickRadius(abreast, span, height);
  const gaps = abreast - 1;
  const step = Math.min(r * PICK_ROOMY_SPACING, (span - r * 2) / gaps);
  const first = (left + right) / 2 - (step * gaps) / 2;
  return Array.from({ length: abreast }, (_, index) => ({
    x: first + step * index,
    y: BUTTON_INSET + r,
    r,
  }));
}

/**
 * The room a picker's rest may take: the band beside the mute, from `from`
 * to `to` across the top, or rows under the picker's own down to `floor`,
 * clear of every button of `standing` still shown while it is open.
 */
type Room = Record<'from' | 'to' | 'floor', number> & {
  standing: readonly Circle[];
};

/**
 * A picker of `count` buttons whose `row` holds only some of them: the rest
 * spread across the band of `room` where it holds them `PICK_CLEAR` apart
 * from each other and from `row`, its ends' reach `PICK_CLEAR` inside the band's;
 * otherwise in rows under `row` (`stacked`) where those keep above the room's
 * floor and `PICK_CLEAR` from its standing buttons; and on a screen too small
 * for either, in the band as it falls.
 */
export function completed(
  row: readonly Circle[],
  count: number,
  { from, to, floor, standing }: Room,
): Circle[] {
  const rest = count - row.length;
  if (rest === 0) return [...row];
  const r = row[0]?.r ?? TAP_RADIUS;
  const reach = tapReach(r);
  const inBand = Array.from({ length: rest }, (_, index) => ({
    x: from + ((to - from) * (index + 1)) / (rest + 1),
    y: BUTTON_INSET + r,
    r,
  }));
  const [first, ...others] = inBand;
  const held =
    first !== undefined &&
    first.x - reach >= from - BUTTON_INSET + PICK_CLEAR &&
    (inBand.at(-1)?.x ?? first.x) + reach <= to + BUTTON_INSET - PICK_CLEAR &&
    others.every((button, index) => {
      const before = inBand[index];
      return before !== undefined && apart(before, button, PICK_CLEAR);
    }) &&
    inBand.every((button) =>
      row.every((other) => apart(button, other, PICK_CLEAR)),
    );
  if (held) return [...row, ...inBand];
  const under = stacked(row, count);
  const fits = under
    .slice(row.length)
    .every(
      (button) =>
        button.y + tapReach(button.r) <= floor &&
        standing.every((other) => apart(button, other, PICK_CLEAR)),
    );
  return fits ? under : [...row, ...inBand];
}

/** Where `rowsFrom` fits the pickers' rows in the top row. */
type TopRow = {
  /** The right edge of the reach of the buttons the rows stand after. */
  after: number;
  /** How far down the top row's buttons reach: a row below it may stay. */
  bandBottom: number;
  /** Whether a row's buttons stand `gap` clear of every button they must keep off. */
  clear: (gap: number) => (buttons: readonly Circle[]) => boolean;
  size: readonly [number, number];
};

/**
 * The pickers' `rows`, each as it stands where it is below the top row and
 * `PICK_CLEAR` clear; else in the top row `PICK_APART` past `after` and clear
 * of the rest by as much, narrowed from the right until it is; else the same
 * at `PICK_CLEAR`; `undefined` where a row fits whole in none of these.
 */
export function rowsFrom(
  rows: readonly [Circle[], Circle[]],
  { after, bandBottom, clear, size: [width, height] }: TopRow,
): readonly [Circle[], Circle[]] | undefined {
  const inTopRow = (count: number, gap: number): Circle[] | undefined => {
    const left = after + gap;
    for (let right = width - BUTTON_INSET; right > left; right--) {
      const placed = rowAcross(count, [left, right], height);
      if (
        placed.length === count &&
        placed.every((button) => button.r >= TAP_RADIUS) &&
        clear(gap)(placed)
      ) {
        return placed;
      }
    }
    return undefined;
  };
  const fitted = (row: Circle[]): Circle[] | undefined => {
    const [first] = row;
    if (!first) return row;
    if (first.y - first.r > bandBottom && clear(PICK_CLEAR)(row)) return row;
    return inTopRow(row.length, PICK_APART) ?? inTopRow(row.length, PICK_CLEAR);
  };
  const [picks, furnishings] = rows.map((row) => fitted(row));
  return picks && furnishings ? [picks, furnishings] : undefined;
}
