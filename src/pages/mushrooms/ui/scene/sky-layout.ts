/**
 * Where the buttons over the meadow stand, and the sun they keep off, in CSS
 * pixels: the buttons are a finger's size on every screen, so they are placed
 * by what room the screen leaves rather than in proportion to it.
 */

import type { Sized } from '@/shared/typings';

import type { Circle } from '../../model/geometry';
import { FURNISHINGS } from '../../model/house';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
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
/**
 * How far down the sky, as a share of the ground's top, the insects' column
 * down the left may reach: below it the back row's caps rise into it.
 */
const COLUMN_REACH = 0.7;

export type Controls = {
  mute: Circle;
  plus: Circle;
  minus: Circle;
  house: Circle;
  /** One per `INSECT_KINDS`, each releasing one of its kind: the insects' column down the left. */
  releases: Readonly<Record<InsectKind, Circle>>;
  /**
   * Whether the fly and the bee stand in the band a picker opens in, which a
   * screen too small for them anywhere else has them share: they give way,
   * hidden, while a picker is open.
   */
  yielding: boolean;
  /** One per `CAP_KINDS`, in that order. */
  picker: readonly Circle[];
  /** One per `FURNISHINGS`, in that order. */
  housePicker: readonly Circle[];
};

/** Every button that stands whatever is open: all but the pickers'. */
export function standingControls({
  mute,
  plus,
  minus,
  house,
  releases,
}: Controls): Circle[] {
  return [
    mute,
    plus,
    minus,
    house,
    ...INSECT_KINDS.map((kind) => releases[kind]),
  ];
}

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
  const row = rowAcross(count, [BUTTON_INSET, width - BUTTON_INSET], height);
  const [first] = row;
  const clearOfMute =
    first !== undefined && first.x - first.r >= mute.x + mute.r + BUTTON_INSET;
  if (clearOfMute) return row;
  return row.map((pick) => ({
    ...pick,
    y: mute.y + mute.r + BUTTON_INSET + pick.r,
  }));
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

const apart = (a: Circle, b: Circle, gap: number) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= tapReach(a.r) + tapReach(b.r) + gap;

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
 *
 * The insects' buttons, butterfly, fly and bee, stand down the left as Syama
 * drew the insects, or beside the mute where the sky is too short for that
 * (`placeReleases`).
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
  const topRow = column === 1 || cornered;
  const {
    releases,
    yielding,
    inTopRow,
    rows: [pickRow, furnishRow],
  } = placeReleases({
    mute,
    rows: [picker, houseRow],
    fixed: [
      { x, y: plusY, r: GROW_R },
      { x, y: plusY + below, r: GROW_R },
      house,
    ],
    width,
    height,
    lowest: topRow ? 0 : groundTop * COLUMN_REACH,
  });
  // The band beside the mute, or the insects beside it, up to the house
  // where it has the corner.
  const rest = FURNISHINGS.length - furnishRow.length;
  const r = furnishRow[0]?.r ?? TAP_RADIUS;
  const from =
    Math.max(
      mute.x + mute.r,
      ...inTopRow.map((button) => button.x + tapReach(button.r)),
    ) + BUTTON_INSET;
  const to = cornered ? house.x - hit - BUTTON_INSET : width - BUTTON_INSET;
  const band = Array.from({ length: rest }, (_, index) => ({
    x: from + ((to - from) * (index + 1)) / (rest + 1),
    y: BUTTON_INSET + r,
    r,
  }));
  return {
    mute,
    releases,
    yielding,
    plus: { x, y: plusY, r: GROW_R },
    minus: { x, y: plusY + below, r: GROW_R },
    house,
    picker: pickRow,
    housePicker: [...furnishRow, ...band],
  };
}

/** The insects' buttons, each a finger's size and `GROW_GAP` from the next. */
const RELEASE_STEP = TAP_RADIUS * 2 + GROW_GAP;

/** What the insects' buttons are placed among: the screen, the mute, the pickers' rows, the other buttons, and how far down the column may reach. */
type PlaceReleasesParams = Sized &
  Pick<Controls, 'mute'> & {
    rows: readonly [Circle[], Circle[]];
    fixed: readonly Circle[];
    lowest: number;
  };

/**
 * The insects' buttons, as the sky has room for them, the first that fits:
 * a column down the left under the mute and any picker's row over it, while
 * it ends above `lowest`; a row beside the mute, the pickers' rows moved right
 * of it when they stand in the top row too, clear of the `fixed` buttons; or,
 * on a screen too small for either, the butterfly beside the mute and the
 * fly and the bee in the band a picker opens in, which they give way to.
 */
function placeReleases({
  mute,
  rows,
  fixed,
  width,
  height,
  lowest,
}: PlaceReleasesParams): {
  releases: Record<InsectKind, Circle>;
  yielding: boolean;
  /** Those of them that stand in the top row, beside the mute. */
  inTopRow: readonly Circle[];
  rows: readonly [Circle[], Circle[]];
} {
  const r = TAP_RADIUS;
  const { x: muteX, y: muteY, r: muteR } = mute;
  const keyed = (at: (index: number) => Circle) => ({
    butterfly: at(0),
    fly: at(1),
    bee: at(2),
  });
  const columnX = BUTTON_INSET + r;
  const columnTop = Math.max(
    muteY + tapReach(muteR) + GROW_GAP + r,
    ...rows
      .flat()
      .filter((pick) => pick.x - tapReach(pick.r) < columnX + r)
      .map((pick) => pick.y + tapReach(pick.r) + GROW_GAP + r),
  );
  const columnEnd = columnTop + RELEASE_STEP * (INSECT_KINDS.length - 1) + r;
  if (columnEnd <= lowest) {
    return {
      releases: keyed((index) => ({
        x: columnX,
        y: columnTop + RELEASE_STEP * index,
        r,
      })),
      yielding: false,
      inTopRow: [],
      rows,
    };
  }
  const rowFrom = muteX + tapReach(muteR) + GROW_GAP + r;
  const inRow = INSECT_KINDS.map((_, index) => ({
    x: rowFrom + RELEASE_STEP * index,
    y: muteY,
    r,
  }));
  // A picker's row, open only a moment, may come as near as touching.
  const clear = (gap: number) => (buttons: readonly Circle[]) =>
    buttons.every(
      (button) =>
        button.x + tapReach(button.r) <= width - BUTTON_INSET &&
        fixed.every((other) => apart(button, other, gap)),
    );
  const moved = clear(GROW_GAP / 2)(inRow)
    ? rowsBeside(inRow, rows, clear(0), [width, height])
    : undefined;
  if (moved) {
    return {
      releases: keyed((index) => inRow[index] ?? mute),
      yielding: false,
      inTopRow: inRow,
      rows: moved,
    };
  }
  const [butterfly = mute] = inRow;
  const band = muteY + muteR + BUTTON_INSET + r;
  return {
    releases: keyed((index) =>
      index === 0
        ? butterfly
        : { x: columnX + RELEASE_STEP * (index - 1), y: band, r },
    ),
    yielding: true,
    inTopRow: [butterfly],
    rows,
  };
}

/**
 * The pickers' `rows` with any standing in the top row moved right of
 * `inRow`, narrowed from the right until they are `clear`; `undefined`
 * where a row no longer fits whole.
 */
function rowsBeside(
  inRow: readonly Circle[],
  rows: readonly [Circle[], Circle[]],
  clear: (buttons: readonly Circle[]) => boolean,
  [width, height]: readonly [number, number],
): readonly [Circle[], Circle[]] | undefined {
  const last = inRow.at(-1);
  if (!last) return rows;
  const left = last.x + tapReach(last.r) + GROW_GAP / 2;
  const beside = (row: Circle[]): Circle[] | undefined => {
    const [first] = row;
    if (!first || first.y - first.r > last.y + tapReach(last.r)) return row;
    for (let right = width - BUTTON_INSET; right > left; right -= 4) {
      const placed = rowAcross(row.length, [left, right], height);
      if (placed.length === row.length && clear(placed)) return placed;
    }
    return undefined;
  };
  const [picks, furnishings] = rows.map((row) => beside(row));
  return picks && furnishings ? [picks, furnishings] : undefined;
}

/**
 * The sun in the top right, pulled in from the corner until its glow fits.
 * Where its rays would reach a picker's row it comes down below the rows —
 * over on the left, where a phone's narrow width brings a row down onto the
 * sun itself — and it moves left until its rays keep `BUTTON_INSET` off the
 * buttons down the right, and right until they keep it off the insects'.
 */
export function placeSun(
  width: number,
  height: number,
  r: number,
  { plus, minus, house, releases, picker, housePicker }: Controls,
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
  /** How far across from `button` the sun's rays keep `BUTTON_INSET` off it: 0 when they clear it at any x. */
  const clearing = (button: Circle) => {
    const reach = tapReach(button.r) + rays + BUTTON_INSET;
    const rise = button.y - y;
    return Math.abs(rise) < reach ? Math.sqrt(reach ** 2 - rise ** 2) : 0;
  };
  const x = Math.min(
    across,
    ...[plus, minus, house].map((button) =>
      clearing(button) > 0 ? button.x - clearing(button) : across,
    ),
  );
  const rightOf = Object.values(releases).map((button) =>
    clearing(button) > 0 ? button.x + clearing(button) : x,
  );
  return { x: Math.max(x, ...rightOf), y, r };
}
