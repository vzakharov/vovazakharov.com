/**
 * A mushroom as a mouse's house: the windows put in its cap and the door in
 * its stem, and where on the mushroom each of them goes. Lengths are in units
 * of the mushroom's size, like its genes.
 */

import type { Sized } from '@/shared/typings';

import type { Point } from './geometry';
import { domeHeight, type MushroomGenes } from './mushroom-genes';
import { stemAt, type StemStation } from './mushroom-pose';

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
/** How high the row's middle stands, as a fraction of the cap's height. */
const ROW_LEVEL = 0.3;
/** How far a pane keeps below the dome's surface. */
const PANE_MARGIN = 0.02;
const MOST_WINDOWS = 5;
const FEWEST_WINDOWS = 3;
const REACH_STEP = 0.002;

/**
 * Where a cap has room for windows: the middles of a row along its lower
 * band, in the cap's own frame (`capFrame`'s, the middle of its underside at
 * the origin, y up). Three windows or five, as the cap's width allows — an odd
 * count, so the row ends balanced — ordered from the middle outward: the
 * first centred, then each pair's left before its right.
 */
export function windowSlots(
  genes: Pick<MushroomGenes, 'capWidth' | 'capHeight' | 'domePower'>,
): Point[] {
  const y = genes.capHeight * ROW_LEVEL;
  const top = y + PANE / 2 + PANE_MARGIN;
  // The farthest a pane's middle goes out before its top corner meets the dome.
  let reach = 0;
  while (domeHeight(genes, reach + REACH_STEP + PANE / 2) >= top) {
    reach += REACH_STEP;
  }
  const pairs = Math.max(
    (FEWEST_WINDOWS - 1) / 2,
    Math.min((MOST_WINDOWS - 1) / 2, Math.floor(reach / SLOT_PITCH)),
  );
  const slots: Point[] = [{ x: 0, y }];
  for (let pair = 1; pair <= pairs; pair++) {
    slots.push({ x: -pair * SLOT_PITCH, y }, { x: pair * SLOT_PITCH, y });
  }
  return slots;
}

/** A door's width, as a fraction of the stem's width at its foot. */
const DOOR_WIDTH = 0.7;
/** A door's height over its width: an arched door, taller than wide. */
export const DOOR_ASPECT = 1.45;
/** How far the door's sill stands above the ground. */
const DOOR_SILL = 0.012;
const RISE_STEP = 0.005;

/** A door on the stem: its middle, the stem's tilt there, and its size. */
export type DoorPlace = StemStation & Sized;

/**
 * Where a mushroom's door goes, in the mushroom's own frame (foot at the
 * origin, y up): its middle on the stem's centreline, its sill just above the
 * ground, upright along the stem there.
 */
export function doorPlace(genes: MushroomGenes): DoorPlace {
  const width = genes.stemWidth * genes.footBulge * DOOR_WIDTH;
  const height = width * DOOR_ASPECT;
  const middle = DOOR_SILL + height / 2;
  let t = 0;
  while (stemAt(genes, t).y < middle) t += RISE_STEP;
  return { ...stemAt(genes, t), width, height };
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
