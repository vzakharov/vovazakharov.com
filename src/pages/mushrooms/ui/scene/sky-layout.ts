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
  inTopRow,
  PICK_APART,
  PICK_CLEAR,
  pickerRow,
  rowsFrom,
  stacked,
  type WithMap,
} from './picker-rows';
import {
  apart,
  BUTTON_INSET,
  GROW_GAP,
  TAP_RADIUS,
  tapReach,
} from './tap-reach';

/** The map button's radius. */
const BUTTON_R = 28;
/**
 * The radius of `+`, `−` and the house, and the `+`'s height at the lowest,
 * as a share of the screen's.
 */
const GROW_R = 36;
const PLUS_HEIGHT = 0.36;
/**
 * How far down the sky, as a share of the ground's top, a picker's rows and
 * the flower picker's cross may reach: below it the back row's caps rise into
 * it.
 */
const PICK_REACH = 0.7;

/** The buttons that may give way, hidden, to an open picker. */
const YIELDERS = [...INSECT_KINDS, 'house'] as const;
type Yielder = (typeof YIELDERS)[number];
/** Those, and the gait button, which gives way where the sky has no spot free for it (`gaitSpot`). */
type Giving = Yielder | 'gait';

export type Controls = WithMap & {
  /** The button that switches a ground drag between steps and flight, beside the map button (`gaitSpot`). */
  gait: Circle;
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
  yielding: readonly Giving[];
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
    controls.yielding.map((name) =>
      name === 'gait' ? controls.gait : yielder(name, controls),
    ),
  );
  return standingControls(controls).filter((button) => !hidden.has(button));
}

/** Every button that stands whatever is open: all but the pickers'. */
export function standingControls({
  map,
  gait,
  plus,
  minus,
  house,
  releases,
}: Controls): Circle[] {
  return [
    map,
    gait,
    plus,
    minus,
    house,
    ...INSECT_KINDS.map((kind) => releases[kind]),
  ];
}

/**
 * Whether `button` reaches down onto the meadow, as a column at the screen's
 * foot does (`placeColumns`). What stands on the ground there stands
 * whatever the screen, so a turn moves nothing; the button is drawn over it,
 * as over anything a pan brings under a button.
 */
export function overMeadow(button: Circle, groundTop: number): boolean {
  return button.y + button.r > groundTop;
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
    floor: groundTop * PICK_REACH,
    standing: shownOverPickers(controls),
    drawn,
  });
}

/**
 * The map button in the top left; the two pickers across the top, one at a
 * time, as each closes the other; and the two columns down the sides, the
 * insects' buttons on the left and `+`, `−` and the house on the right, one
 * height across (`placeColumns`). A picker too long for one row at a
 * finger's size — only ever on a screen narrow enough to drop the row below
 * the map button — puts the rest in the band that leaves free beside the map
 * button, or in rows under its own where that band is too narrow to hold them
 * (`completed`).
 *
 * The gait button stands on its first spot, right of the map button, here, so
 * the rows, the sun and the cross keep off it: `gaitSpot` moves it where that
 * spot is not free once they stand.
 */
export function placeControls(
  width: number,
  height: number,
  groundTop: number,
): Controls {
  const map = {
    x: BUTTON_INSET + BUTTON_R,
    y: BUTTON_INSET + BUTTON_R,
    r: BUTTON_R,
  };
  const dropped = map.y + map.r + BUTTON_INSET;
  const picker = pickerRow(MUSHROOM_SPECIES.length, [width, height], {
    map,
    dropped,
  });
  const houseRow = pickerRow(FURNISHINGS.length, [width, height], {
    map,
    dropped,
  });
  // The gait button's first spot, right of the map button (`gaitSpot`).
  const gait = {
    x: map.x + tapReach(map.r) + TAP_RADIUS,
    y: map.y,
    r: TAP_RADIUS,
  };
  const top = {
    after: gait.x + TAP_RADIUS,
    clear: clearOf(width, [gait]),
    size: [width, height] as const,
  };
  // A row in the top row moves past the gait button's spot where it meets it;
  // one dropped below the map button moves up there where it is as large.
  const besideView = (row: Circle[]) => {
    const inTop = row.every((pick) => pick.y === BUTTON_INSET + pick.r);
    if (inTop && top.clear(PICK_APART)(row)) return row;
    const moved = inTopRow(row.length, top);
    const large = (moved?.[0]?.r ?? 0) >= (row[0]?.r ?? Infinity);
    return moved && (inTop || large) ? moved : row;
  };
  // The columns come after the pickers whole, so they keep off a rest stacked under a row.
  const room = {
    from: top.after + BUTTON_INSET,
    to: width - BUTTON_INSET,
    floor: groundTop * PICK_REACH,
    standing: [map, gait],
  };
  const {
    columns: { plus, minus, house, releases },
    rows: [pickers, furnishings],
    yielding,
  } = placeColumns({
    map,
    rows: [
      completed(besideView(picker), MUSHROOM_SPECIES.length, room),
      completed(besideView(houseRow), FURNISHINGS.length, room),
    ],
    width,
    height,
    groundTop,
  });
  return {
    map,
    gait,
    releases,
    yielding,
    plus,
    minus,
    house,
    picker: pickers,
    housePicker: furnishings,
  };
}

/** Whether a picker's row keeps inside the screen's right edge and `gap` off each of `standing`. */
const clearOf =
  (width: number, standing: readonly Circle[]) =>
  (gap: number) =>
  (buttons: readonly Circle[]): boolean =>
    buttons.every(
      (button) =>
        button.x + tapReach(button.r) <= width - BUTTON_INSET &&
        standing.every((other) => apart(button, other, gap)),
    );

/**
 * The columns' sizes, the first whose columns fit: `+`, `−` and the house as
 * drawn, then, on a screen too short for them, at a finger's size and closer
 * together. The insects' buttons are a finger's size in either.
 */
const COLUMN_SIZES = [
  { r: GROW_R, gap: GROW_GAP },
  { r: TAP_RADIUS, gap: GROW_GAP / 2 },
] as const;
type ColumnSize = (typeof COLUMN_SIZES)[number];

type Columns = Pick<Controls, 'plus' | 'minus' | 'house' | 'releases'>;

/** What the columns are placed among: the screen, the map button and the pickers' rows. */
type PlaceColumnsParams = Sized &
  Pick<Controls, 'map'> &
  Pick<Camera, 'groundTop'> & { rows: readonly [Circle[], Circle[]] };

/**
 * The insects' buttons, butterfly, fly and bee, down the left, and `+`, `−`
 * and the house down the right, each at one height across, the first that
 * keeps them on the screen, `GROW_GAP` off the map button and `PICK_CLEAR` off
 * the pickers' rows: in the sky, at `PLUS_HEIGHT` or lowered under the rows,
 * but never onto the ground; else down at the screen's foot, on the meadow,
 * where the sky leaves the map button no room over them; each at
 * `COLUMN_SIZES`' sizes in turn. A screen too short for even that stands the
 * insects' column beside the map button rather than under it, and moves the
 * pickers' rows in between the columns (`rowsFrom`); where they meet the
 * columns there too, whichever of the insects and the house they meet give
 * way to them.
 */
function placeColumns({
  map,
  rows,
  width,
  height,
  groundTop,
}: PlaceColumnsParams): {
  columns: Columns;
  rows: readonly [Circle[], Circle[]];
  yielding: readonly Yielder[];
} {
  const at = ({ r, gap }: ColumnSize, top: number, left: number): Columns => {
    const step = tapReach(r) * 2 + gap;
    const right = (index: number) => ({
      x: width - BUTTON_INSET - r,
      y: top + step * index,
      r,
    });
    const insect = (index: number) => ({
      x: left,
      y: top + step * index,
      r: TAP_RADIUS,
    });
    return {
      plus: right(0),
      minus: right(1),
      house: right(2),
      releases: { butterfly: insect(0), fly: insect(1), bee: insect(2) },
    };
  };
  const buttonsOf = ({ plus, minus, house, releases }: Columns) => [
    plus,
    minus,
    house,
    ...INSECT_KINDS.map((kind) => releases[kind]),
  ];
  const picks = rows.flat();
  const fits = (columns: Columns) =>
    buttonsOf(columns).every(
      (button) =>
        button.y - tapReach(button.r) >= BUTTON_INSET &&
        button.y + tapReach(button.r) <= height - BUTTON_INSET &&
        apart(button, map, GROW_GAP) &&
        picks.every((pick) => apart(button, pick, PICK_CLEAR)),
    );
  const under = BUTTON_INSET + TAP_RADIUS;
  // The first button's centre where the last one's ends at `floor`.
  const highest = ({ r, gap }: ColumnSize, floor: number) =>
    floor - tapReach(r) * 5 - gap * 2;
  for (const size of COLUMN_SIZES) {
    const step = tapReach(size.r) * 2 + size.gap;
    const start = Math.min(
      height * PLUS_HEIGHT,
      highest(size, groundTop - GROW_GAP),
    );
    // Lowered under the rows, the last button keeps its centre in the sky.
    for (let first = start; first + step * 2 <= groundTop; first++) {
      const columns = at(size, first, under);
      if (fits(columns)) return { columns, rows, yielding: [] };
    }
    const columns = at(size, highest(size, height - BUTTON_INSET), under);
    if (fits(columns)) return { columns, rows, yielding: [] };
  }
  const [tight] = COLUMN_SIZES.slice(-1);
  if (!tight) throw new Error('No column sizes');
  const besideMap = map.x + tapReach(map.r) + GROW_GAP + TAP_RADIUS;
  const columns = at(tight, highest(tight, height - BUTTON_INSET), besideMap);
  const standing = buttonsOf(columns);
  const between = rowsFrom(rows, {
    after: besideMap + TAP_RADIUS,
    bandBottom: -Infinity,
    clear: clearOf(width, standing),
    size: [width, height],
  });
  const moved = between ?? rows;
  const met = (button: Circle) =>
    moved.flat().some((pick) => !apart(pick, button, PICK_CLEAR));
  return {
    columns,
    rows: moved,
    yielding: YIELDERS.filter((name) => met(yielder(name, columns))),
  };
}
