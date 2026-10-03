/**
 * A mushroom as a mouse's house: the windows put in its cap and the door in
 * its stem, and where on the mushroom each of them goes. Lengths are in units
 * of the mushroom's size, like its genes.
 */

import type { Sized } from '@/shared/typings';

import {
  arch,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  outside,
  type Point,
  sample,
} from './geometry';
import {
  hasTrumpet,
  HEAD_KIND,
  type HeadKind,
  type MushroomGenes,
} from './mushroom-genes';
import { capOutlines, MUSHROOM_INK } from './mushroom-outline';
import { stemAt, type StemStation } from './mushroom-pose';
import {
  capBase,
  capSurface,
  frontSag,
  funnelHeight,
  rimWave,
  stemHalfWidth,
} from './mushroom-profile';

/** The four windows of Syama's drawing, in the order he drew them. */
const WINDOW_KINDS = ['cross', 'round', 'square', 'tall'] as const;
export type WindowKind = (typeof WINDOW_KINDS)[number];
/** What one pick puts into a house. */
export type Furnishing = WindowKind | 'door';
/** Every pick the house picker offers, in the order it shows them: the windows, then the door. */
export const FURNISHINGS: readonly Furnishing[] = [...WINDOW_KINDS, 'door'];

export type House = {
  /** In the order they were picked, each going into the next of `windowSlots`. */
  windows: readonly WindowKind[];
  door: boolean;
};
export type Housed = { house: House };

export const EMPTY_HOUSE: House = { windows: [], door: false };

/**
 * The side of the square every window is drawn inside, whatever its kind: a
 * tall window takes the square's height and less of its width.
 */
export const PANE = 0.1;
/** From one window's middle to the next's: a pane's width of cap between them. */
const SLOT_PITCH = PANE * 2;
/** How high a dome's row of windows stands, as a fraction of the cap's height. */
const ROW_LEVEL = 0.3;
/** How far a pane keeps inside the cap's face, above and below. */
const PANE_MARGIN = 0.02;
const MOST_WINDOWS = 5;
/**
 * The fewest windows a cap has room for: three across a dome, and one on a
 * chanterelle's funnel, whose face under the rim is wide enough for a
 * window only at its middle.
 */
const FEWEST_WINDOWS = { dome: 3, trumpet: 1 } as const satisfies Record<
  HeadKind,
  number
>;
/** How finely a pane's top and bottom edges are read against the cap's face. */
const PANE_SAMPLES = 8;

/**
 * The face a window goes in, at `x` across the cap: a dome's from its
 * underside up to its top; a chanterelle's the funnel's, from its lower edge
 * up to the front rim.
 */
function faceAt(
  genes: MushroomGenes,
  x: number,
): { top: number; base: number } {
  if (!hasTrumpet(genes))
    return { top: capSurface(genes, x), base: capBase(genes, x) };
  return {
    top: capBase(genes, x),
    base: funnelHeight(genes, x) + rimWave(genes, x),
  };
}

/** Whether a pane with its middle at `slot` keeps `PANE_MARGIN` inside the cap's face, over its whole width. */
function paneFits(genes: MushroomGenes, slot: Point): boolean {
  return sample(slot.x - PANE / 2, slot.x + PANE / 2, PANE_SAMPLES, (x) =>
    faceAt(genes, x),
  ).every(
    ({ top, base }) =>
      top >= slot.y + PANE / 2 + PANE_MARGIN &&
      base <= slot.y - PANE / 2 - PANE_MARGIN,
  );
}

/**
 * How high a window `x` across the cap stands: a dome's row on its lower
 * band, never so low a pane's bottom leaves the underside; a chanterelle's
 * just under its front rim, so they ring the funnel as the rim does and dip
 * at the middle with it — the rim's sag alone, which is the same either side.
 */
export function slotLevel(genes: MushroomGenes, x: number): number {
  if (!hasTrumpet(genes)) {
    return Math.max(genes.capHeight * ROW_LEVEL, PANE / 2 + PANE_MARGIN);
  }
  const lowestRim = genes.capHeight - genes.waveAmp - frontSag(genes, x);
  return lowestRim - PANE_MARGIN - PANE / 2;
}

/**
 * Where a cap has room for windows: the middles of a row across the face of
 * its cap (`faceAt`), in the cap's own frame (`capFrame`'s, y up). As many
 * as the cap's width allows, from its `FEWEST_WINDOWS` up to five — an odd
 * count, so the row ends balanced — ordered from the middle outward: the
 * first centred, then each pair's left before its right, a pane's width of
 * cap between each two.
 */
export function windowSlots(genes: MushroomGenes): Point[] {
  const slot = (x: number) => ({ x, y: slotLevel(genes, x) });
  // Whether a pane `pair` pitches out fits on both sides.
  const pairFits = (pair: number) =>
    [-1, 1].every((side) => paneFits(genes, slot(side * pair * SLOT_PITCH)));
  const fewest = FEWEST_WINDOWS[HEAD_KIND[genes.species]];
  let pairs = (fewest - 1) / 2;
  while (pairs < (MOST_WINDOWS - 1) / 2 && pairFits(pairs + 1)) pairs += 1;
  const slots: Point[] = [slot(0)];
  for (let pair = 1; pair <= pairs; pair++) {
    slots.push(slot(-pair * SLOT_PITCH), slot(pair * SLOT_PITCH));
  }
  return slots;
}

/** How far a spot keeps from a window's square for the house to leave it painted: the window's line of ink. */
const SPOT_CLEARANCE = MUSHROOM_INK;

/** How far `point` stands from the square a window in `slot` is drawn inside: 0 within it. */
function fromPane(point: Point, slot: Point): number {
  return Math.hypot(
    Math.max(0, Math.abs(point.x - slot.x) - PANE / 2),
    Math.max(0, Math.abs(point.y - slot.y) - PANE / 2),
  );
}

/**
 * The spots of `genes` its `house` leaves painted: those clear of every
 * window put in by `SPOT_CLEARANCE`, so a window takes a spot's place rather
 * than half-covering it. The spots stay the seed's; only their painting
 * consults the house.
 */
export function paintedSpots(
  genes: MushroomGenes,
  { windows }: House,
): Circle[] {
  const panes = windowSlots(genes).slice(0, windows.length);
  return genes.spots.filter((spot) =>
    panes.every((slot) => fromPane(spot, slot) >= spot.r + SPOT_CLEARANCE),
  );
}

/** A door's width, as a fraction of the stem's narrowest width across its frame. */
const DOOR_WIDTH = 0.7;
/**
 * The widest a door grows, in the mushroom's size: on a porcini's barrel it
 * stays a door, low enough under the cap to climb the stem and to show past
 * the mushroom in front.
 */
const DOOR_MOST = 0.175;
/** A door's height over its width: an arched door, taller than wide. */
export const DOOR_ASPECT = 1.45;
/** How far the door's frame stands out round the doorway, in door widths: to either side, and over the arch. */
const DOOR_FRAME = 0.09;
/**
 * How far a door's frame keeps inside the stem's edge: a line of ink, and a
 * quarter more for the stem's curve between the points it is drawn through.
 */
const FRAME_MARGIN = MUSHROOM_INK * 1.25;
/** How far the lowest door's sill stands above the ground, the ground's line clear of it. */
const DOOR_SILL = FRAME_MARGIN;
/** From one door station to the next up the stem, in `stemAt`'s `t`. */
const STATION_STEP = 0.05;
const RISE_STEP = 0.005;
/** How finely the stem's width is read along a door's frame. */
const FIT_SAMPLES = 8;

/** A door on the stem: its middle, the stem's tilt there, and its size. */
export type DoorPlace = StemStation & Sized;

/** The doorway, `aspect` door widths tall, in the door's frame: door widths, its sill's middle at the origin, y up. */
export function doorway(aspect: number): Point[] {
  return arch(1, aspect);
}

/** The door as painted: its doorway in the frame round it, in the door's frame. */
export function paintedDoor(aspect: number): Point[] {
  return arch(1 + DOOR_FRAME * 2, aspect + DOOR_FRAME);
}

/**
 * From the door's frame onto its stem, in the mushroom's frame: upright along
 * the stem at its middle, `grown` of its size round that middle.
 */
export function onStem(door: DoorPlace, grown = 1): (point: Point) => Point {
  const width = door.width * grown;
  const aspect = door.height / door.width;
  const cos = Math.cos(door.tilt);
  const sin = Math.sin(door.tilt);
  return ({ x, y }) => {
    const across = x * width;
    const up = (y - aspect / 2) * width;
    return {
      x: door.x + across * cos + up * sin,
      y: door.y - across * sin + up * cos,
    };
  };
}

/**
 * A door with its middle `t` up the stem, as wide as the stem allows there:
 * `DOOR_WIDTH` of its narrowest width along the frame up to `DOOR_MOST`, and
 * never so wide that the frame comes nearer the stem's edge than `FRAME_MARGIN`.
 */
function doorAt(genes: MushroomGenes, t: number): DoorPlace {
  const station = stemAt(genes, t);
  // Along the stem, the frame reaches no farther from its middle than a door
  // as wide as the stem at the middle would.
  const widest = 2 * stemHalfWidth(genes, t) * DOOR_WIDTH;
  const reach = widest * (DOOR_ASPECT / 2 + DOOR_FRAME);
  const below = stemAt(genes, Math.max(0, t - RISE_STEP));
  const above = stemAt(genes, Math.min(1, t + RISE_STEP));
  const perT =
    Math.hypot(above.x - below.x, above.y - below.y) /
    (Math.min(1, t + RISE_STEP) - Math.max(0, t - RISE_STEP));
  const span = reach / perT;
  const narrowest = Math.min(
    ...sample(
      Math.max(0, t - span),
      Math.min(1, t + span),
      FIT_SAMPLES,
      (along) => stemHalfWidth(genes, along),
    ),
  );
  const width = Math.min(
    DOOR_MOST,
    2 * narrowest * DOOR_WIDTH,
    (2 * narrowest - 2 * FRAME_MARGIN) / (1 + DOOR_FRAME * 2),
  );
  return { ...station, width, height: width * DOOR_ASPECT };
}

/**
 * Where a mushroom's door may go, in the mushroom's own frame (foot at the
 * origin, y up), from the lowest up: its sill just above the ground, then a
 * station at a time up the stem for as long as the frame keeps under the cap.
 * `turn` is the one the mushroom stands at, whose ground `stemOutline` levels
 * the foot with. Which one it takes is the scene's call, as the mushrooms in
 * front allow.
 */
export function doorStations(genes: MushroomGenes, turn = 0): DoorPlace[] {
  // The ground runs through the foot level on screen: `x * slope` up here.
  const slope = Math.tan(turn);
  // The frame's lower corner nearest the ground, as the stem's tilt and the
  // ground's slope dip one of them.
  const sill = (t: number) => {
    const place = onStem(doorAt(genes, t));
    const corner = 0.5 + DOOR_FRAME;
    return Math.min(
      ...[-corner, corner].map((x) => {
        const point = place({ x, y: 0 });
        return point.y - point.x * slope;
      }),
    );
  };
  const overhead = capOutlines(genes);
  const overBox = boxAround(overhead.flat());
  const frame = paintedDoor(DOOR_ASPECT);
  // The whole frame, and `FRAME_MARGIN` round it, clear of the cap.
  const underCap = (door: DoorPlace) => {
    const place = onStem(door);
    const around = outside(frame, FRAME_MARGIN / door.width).map((point) =>
      place(point),
    );
    return (
      !boxesMeet(boxAround(around), overBox) ||
      around.every(
        (point) => !overhead.some((outline) => containsPoint(outline, point)),
      )
    );
  };
  let lowest = 0;
  while (sill(lowest) < DOOR_SILL) lowest += RISE_STEP;
  const stations: DoorPlace[] = [];
  for (let t = lowest; t <= 1; t += STATION_STEP) {
    const door = doorAt(genes, t);
    if (!underCap(door)) break;
    stations.push(door);
  }
  return stations;
}

/**
 * `house` with `piece` put in, when a cap with `slots` windows' room has
 * space for it; `undefined` when it has not — a full row, or a second door.
 */
export function furnished(
  house: House,
  piece: Furnishing,
  slots: number,
): House | undefined {
  if (piece === 'door')
    return house.door ? undefined : { ...house, door: true };
  if (house.windows.length >= slots) return undefined;
  return { ...house, windows: [...house.windows, piece] };
}
