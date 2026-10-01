/**
 * Where the buttons over the meadow stand, in CSS pixels: they are a finger's
 * size on every screen, so they are placed by what room the screen leaves
 * rather than in proportion to it; `sun-layout.ts` keeps the sun off them.
 */

import type { Sized } from '@/shared/typings';

import { FLOWER_SHAPES, PICKED_COLOURS } from '../../model/flower-sounds';
import type { Circle } from '../../model/geometry';
import type { Camera } from '../../model/ground';
import { FURNISHINGS } from '../../model/house';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import {
  beside,
  completed,
  PICK_CLEAR,
  pickerRow,
  rowsFrom,
  stacked,
  type WithMute,
} from './picker-rows';
import {
  apart,
  BUTTON_INSET,
  GROW_GAP,
  TAP_RADIUS,
  tapReach,
} from './tap-reach';

/** The mute button's radius. */
const BUTTON_R = 28;
/**
 * The radius of `+`, `−` and the house, and the `+`'s height at the lowest,
 * as a share of the screen's.
 */
const GROW_R = 36;
const PLUS_HEIGHT = 0.36;
/**
 * How far down the sky, as a share of the ground's top, the insects' column
 * down the left may reach: below it the back row's caps rise into it.
 */
const COLUMN_REACH = 0.7;

/** The buttons that may give way, hidden, to an open picker. */
const YIELDERS = [...INSECT_KINDS, 'house'] as const;
type Yielder = (typeof YIELDERS)[number];

export type Controls = WithMute & {
  plus: Circle;
  minus: Circle;
  house: Circle;
  /** One per `INSECT_KINDS`, each releasing one of its kind: the insects' column down the left. */
  releases: Readonly<Record<InsectKind, Circle>>;
  /**
   * Those buttons that stand where a picker opens, which a screen too small
   * for both anywhere else has them share: they give way, hidden, while a
   * picker is open.
   */
  yielding: readonly Yielder[];
  /** One per `MUSHROOM_SPECIES`, in that order. */
  picker: readonly Circle[];
  /** One per `FURNISHINGS`, in that order. */
  housePicker: readonly Circle[];
};

/** The button `name` names among `house` and `releases`. */
function yielder(
  name: Yielder,
  { house, releases }: Pick<Controls, 'house' | 'releases'>,
): Circle {
  return name === 'house' ? house : releases[name];
}

/** Every button still shown while a picker is open: all that stand but those `yielding`. */
export function shownOverPickers(controls: Controls): Circle[] {
  const hidden = new Set(
    controls.yielding.map((name) => yielder(name, controls)),
  );
  return standingControls(controls).filter((button) => !hidden.has(button));
}

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

/**
 * The flower picker's two stages, one open at a time, in the top row the
 * other pickers share: its five colours where the house picker's five
 * stand, then its four shapes where the caps' four do. Where that picker
 * does not hold a stage's count apart, the stage stands as many abreast as
 * the caps' row holds, the rest in rows under it. Open on a flower, the
 * colours have the cross with them, which pulls it up (`flowerCross`).
 */
export function flowerPicker({
  cross,
  ...controls
}: Controls & Crossed): FlowerStages & Crossed {
  return { ...flowerStages(controls), cross };
}

type FlowerStages = Record<'colours' | 'shapes', readonly Circle[]>;

/** Whether `row` holds `count` buttons, each `PICK_CLEAR` from every other. */
function whole(row: readonly Circle[], count: number): boolean {
  return (
    row.length === count &&
    row.every((button, index) =>
      row.slice(index + 1).every((other) => apart(button, other, PICK_CLEAR)),
    )
  );
}

/** The flower picker's colours and shapes (`flowerPicker`). */
function flowerStages({ picker, housePicker }: Controls): FlowerStages {
  const stage = (row: readonly Circle[], count: number) =>
    whole(row, count) ? row : stacked(picker, count);
  return {
    colours: stage(housePicker, PICKED_COLOURS.length),
    shapes: stage(picker, FLOWER_SHAPES.length),
  };
}

/** Where the flower picker's cross stands (`flowerCross`). */
export type Crossed = { cross: Circle };

/**
 * The flower picker's cross beside its colours (`beside`), its reach out of
 * what is `drawn` there: the sun's rays stand where they do whatever is
 * open, so the cross, shown only while picking, is what yields.
 */
export function flowerCross(
  controls: Controls & Pick<Camera, 'width' | 'groundTop'>,
  drawn: readonly Circle[],
): Circle {
  const { width, groundTop } = controls;
  return beside(flowerStages(controls).colours, {
    width,
    floor: groundTop * COLUMN_REACH,
    standing: shownOverPickers(controls),
    drawn,
  });
}

/**
 * The mute in the top left; the two pickers across the top, one at a time, as
 * each closes the other; and `+`, `−` and the house down the right, where
 * Syama drew them: at `PLUS_HEIGHT`, raised where that would bring the house
 * down onto the ground, but never onto a picker's row or off the screen.
 *
 * A sky too short for three down the right stands the house left of `+`,
 * and a picker's row that would push them onto the ground moves instead.
 * Where the rows, dropped below the mute, push the house under the ground's
 * edge, it takes the top right corner, opposite the mute, instead. A picker
 * too long for one row at a finger's size — only ever on a screen narrow
 * enough to drop the row below the mute — puts the rest in the band that
 * leaves free beside the mute, or in rows under its own where that band is
 * too narrow to hold them (`completed`).
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
  // A row dropped below the mute clears the house too, should it take the corner.
  const dropped = Math.max(
    mute.y + mute.r + BUTTON_INSET,
    BUTTON_INSET + tapReach(GROW_R) * 2 + PICK_CLEAR,
  );
  const picker = pickerRow(MUSHROOM_SPECIES.length, [width, height], {
    mute,
    dropped,
  });
  const houseRow = pickerRow(FURNISHINGS.length, [width, height], {
    mute,
    dropped,
  });
  const x = width - BUTTON_INSET - GROW_R;
  const hit = tapReach(GROW_R);
  const below = GROW_R * 2 + GROW_GAP;
  // The lowest reach of any picker button standing over the column.
  const overColumn = [...picker, ...houseRow]
    .filter((pick) => pick.x + tapReach(pick.r) > x - hit)
    .map((pick) => pick.y + tapReach(pick.r) + GROW_GAP + hit);
  const column = hit * 2 + below * 2 <= groundTop - GROW_GAP ? 2 : 1;
  const lowestPlus = groundTop - GROW_GAP - hit - below * column;
  const plusY = Math.max(
    hit,
    // A row that would push the short column onto the ground gives way instead.
    ...(column === 1 ? overColumn.filter((y) => y <= lowestPlus) : overColumn),
    Math.min(height * PLUS_HEIGHT, lowestPlus),
  );
  const underMinus = plusY + below * 2;
  const cornered = column === 2 && underMinus > groundTop;
  const house = {
    x: column === 1 ? x - below : x,
    y: column === 1 ? plusY : cornered ? BUTTON_INSET + GROW_R : underMinus,
    r: GROW_R,
  };
  const topRow = column === 1 || cornered;
  const plus = { x, y: plusY, r: GROW_R };
  const minus = { x, y: plusY + below, r: GROW_R };
  const {
    releases,
    yielding,
    inTopRow,
    rows: [pickRow, furnishRow],
  } = placeReleases({
    mute,
    rows: [picker, houseRow],
    grow: { plus, minus, house },
    width,
    height,
    lowest: topRow ? 0 : groundTop * COLUMN_REACH,
  });
  // The band beside the mute, or the insects beside it, up to the house
  // where it has the corner.
  const room = {
    from:
      Math.max(
        mute.x + mute.r,
        ...inTopRow.map((button) => button.x + tapReach(button.r)),
      ) + BUTTON_INSET,
    to: cornered ? house.x - hit - BUTTON_INSET : width - BUTTON_INSET,
    floor: groundTop * COLUMN_REACH,
    // Those `yielding` are hidden while a picker is open, so it may stand over them.
    standing: [
      plus,
      minus,
      ...YIELDERS.filter((name) => !yielding.includes(name)).map((name) =>
        yielder(name, { house, releases }),
      ),
    ],
  };
  return {
    mute,
    releases,
    yielding,
    plus,
    minus,
    house,
    picker: completed(pickRow, MUSHROOM_SPECIES.length, room),
    housePicker: completed(furnishRow, FURNISHINGS.length, room),
  };
}

/** The insects' buttons, each a finger's size and `GROW_GAP` from the next. */
const RELEASE_STEP = TAP_RADIUS * 2 + GROW_GAP;

/** What the insects' buttons are placed among: the screen, the mute, the pickers' rows, the other buttons, and how far down the column may reach. */
type PlaceReleasesParams = Sized &
  Pick<Controls, 'mute'> & {
    rows: readonly [Circle[], Circle[]];
    grow: Pick<Controls, 'plus' | 'minus' | 'house'>;
    lowest: number;
  };

/**
 * The insects' buttons, as the sky has room for them, the first that fits:
 * a column down the left under the mute and any picker's row over it, while
 * it ends above `lowest`; a row beside the mute, the pickers' rows moved right
 * of it when they stand in the top row too, clear of the `grow` buttons; that
 * row where a sky too short for a picker's row anywhere else has the rows
 * stand over it, from the mute to `+`, and whichever of the insects and the
 * house they meet give way to them; or, on a screen too narrow for the row,
 * the butterfly beside the mute and the fly and the bee in the band a picker
 * opens in, which they give way to.
 */
function placeReleases({
  mute,
  rows,
  grow,
  width,
  height,
  lowest,
}: PlaceReleasesParams): {
  releases: Record<InsectKind, Circle>;
  yielding: readonly Yielder[];
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
      yielding: [],
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
  const clear =
    (gap: number, fixed: readonly Circle[]) => (buttons: readonly Circle[]) =>
      buttons.every(
        (button) =>
          button.x + tapReach(button.r) <= width - BUTTON_INSET &&
          fixed.every((other) => apart(button, other, gap)),
      );
  const inRowReleases = keyed((index) => inRow[index] ?? mute);
  const last = inRow.at(-1) ?? mute;
  const fits = clear(GROW_GAP / 2, Object.values(grow))(inRow);
  const moved = fits
    ? rowsFrom(rows, {
        after: last.x + tapReach(last.r),
        bandBottom: last.y + tapReach(last.r),
        clear: (gap) => clear(gap, Object.values(grow)),
        size: [width, height],
      })
    : undefined;
  if (moved) {
    return {
      releases: inRowReleases,
      yielding: [],
      inTopRow: inRow,
      rows: moved,
    };
  }
  const over = fits
    ? rowsFrom(rows, {
        after: muteX + tapReach(muteR),
        bandBottom: Infinity,
        clear: (gap) => clear(gap, [grow.plus, grow.minus]),
        size: [width, height],
      })
    : undefined;
  if (over) {
    const { house } = grow;
    const met = (button: Circle) =>
      over.flat().some((pick) => !apart(pick, button, PICK_CLEAR));
    return {
      releases: inRowReleases,
      yielding: YIELDERS.filter((name) =>
        met(yielder(name, { house, releases: inRowReleases })),
      ),
      inTopRow: inRow,
      rows: over,
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
    yielding: ['fly', 'bee'],
    inTopRow: [butterfly],
    rows,
  };
}
