/**
 * A house's windows as a finger's targets, beside its door: in the pixels its
 * house's graphics paints in, which its zoom scales onto the screen.
 */

import { type Circle, containsPoint, type Point } from '../../model/geometry';
import { PANE, windowSlots } from '../../model/house';
import { hasTrumpet, type MushroomGenes } from '../../model/mushroom-genes';
import { capOutlines, toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { type DoorTarget, tappedDoor } from './door-tap';
import { TAP_RADIUS } from './tap-reach';

/**
 * The least a window reaches round its middle, in screen pixels: half a
 * door's, so a row of them leaves a small cap's face to its mushroom — a
 * window is a detail of the cap, which stays a whole finger's target.
 */
export const WINDOW_REACH = TAP_RADIUS / 2;

/** Which part of one house a tap goes to: its door, or a window by its index in `House.windows`. */
export type HousePart = 'door' | number;

/**
 * Where each of the first `count` windows of `genes` drawn `size` px to its
 * unit answers a tap: a circle round its slot's middle taking in its whole
 * painted pane and its `ink` line, never under `WINDOW_REACH` on a screen
 * the house's graphics is scaled onto by `zoom`.
 */
export function windowReaches(
  genes: MushroomGenes,
  size: number,
  count: number,
  ink: number,
  zoom: number,
): Circle[] {
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const r = Math.max((PANE * size) / Math.SQRT2 + ink, WINDOW_REACH / zoom);
  return windowSlots(genes)
    .slice(0, count)
    .map((slot) => ({ ...canvas(cap(slot)), r }));
}

/**
 * The face of the cap the windows sit on, as it is filled: a dome's top, a
 * chanterelle's funnel under its rim. A window's reach is cut to it, so a
 * tap off the cap never finds a window.
 */
export function windowFace(genes: MushroomGenes, size: number): Point[] {
  const canvas = toCanvas(size);
  const [top, under] = capOutlines(genes);
  return (hasTrumpet(genes) ? under : top).map((point) => canvas(point));
}

/**
 * Which part of a house a tap at `finger` goes to, of its door's tap area and
 * its windows' `reaches` cut to `face`: of those holding it, the one whose
 * middle is nearest (`tappedDoor`). `undefined` where none holds it.
 */
export function tappedPart(
  finger: Point,
  door: DoorTarget | undefined,
  reaches: readonly Circle[],
  face: readonly Point[],
): HousePart | undefined {
  const windows = reaches.map(({ x, y, r }, part) => ({
    part,
    x,
    y,
    holds: (at: Point) =>
      Math.hypot(at.x - x, at.y - y) <= r && containsPoint(face, at),
  }));
  const parts = door
    ? [{ part: 'door' as const, ...door }, ...windows]
    : windows;
  return tappedDoor(finger, parts)?.part;
}
