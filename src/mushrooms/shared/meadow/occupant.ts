/**
 * A thing standing on the meadow as the things beside it meet it: the ground
 * its foot takes, which nothing else stands on, and what it hides of whatever
 * stands behind it. The mushrooms are the meadow's occupants; each entity
 * turns its own into one, and a rule judging ground or sight reads only this.
 */

import {
  type Box,
  boxesMeet,
  type Circle,
  containsPoint,
  type Cornered,
  type Point,
} from '../lib/geometry';
import type { Footing, Layered, Rooted } from '../space/ground';
import type { Distant } from '../space/view';
import type { MushroomGround } from './anchored-ground';

/** An occupant's outlines as drawn, each with the box round it. */
type BoxedOutlines = {
  drawn: ReadonlyArray<{ outline: readonly Point[]; box: Box }>;
};

/** What an occupant hides: how near the front it stands, and its outlines as drawn. */
export type Cover = Layered & BoxedOutlines;

/** An occupant as a screen's ground stands it: its foot on the plane, and what it hides (`Cover`). */
export type Occupant = Rooted & { cover: Cover };

/**
 * Every one of `standing` that `ground` shows, as an occupant: what an entity
 * hands a rule that judges ground or sight among its things, for whatever
 * ground the rule anchors.
 */
export type Occupying<Thing> = (
  ground: MushroomGround,
  standing: readonly Thing[],
) => readonly Occupant[];

/** The meadow's occupants as it holds them, in the order they were planted, so the last is the newest. */
export type Occupied<Thing> = { mushrooms: readonly Thing[] };

/** An occupant as a frame draws it: how far from the eye it stands, and its outlines on the screen. */
export type ShownCover = Distant & BoxedOutlines;

/**
 * Whether something drawn at `point` on the screen, standing `distance` from
 * the eye, shows past `covers`: none of them standing nearer is drawn over it.
 */
export function inSightPast(
  covers: readonly ShownCover[],
  point: Point,
  distance: number,
): boolean {
  return covers.every(
    (cover) =>
      cover.distance >= distance ||
      cover.drawn.every(
        ({ outline, box }) =>
          point.x < box.left ||
          point.x > box.right ||
          point.y < box.top ||
          point.y > box.bottom ||
          !containsPoint(outline, point),
      ),
  );
}

/** A silhouette's cell, in units of the occupant's size. */
export const OCCUPANT_CELL = 0.02;

/**
 * Every cell an occupant draws over, in its own units about its foot, y down
 * the screen, spread by a cell every way so the cells hold the whole of what
 * is drawn.
 */
export type Silhouette = Cornered & {
  columns: number;
  rows: number;
  cells: Uint8Array;
};

/** Occupants as a visit opens, each as its silhouette where it stands and the box round it. */
export type ClumpShade = ReadonlyArray<{
  place: Footing;
  silhouette: Silhouette;
  box: Box;
}>;

/**
 * The most of any of `heads` the occupants of `shade` standing nearer the
 * front than `depth`, a foot's height on screen, draw over together: what
 * stands behind is drawn under. Every head is read at the points of one
 * lattice, `step` apart, that it holds.
 */
export function mostShaded(
  heads: readonly Circle[],
  shade: ClumpShade,
  depth: number,
  step: number,
): number {
  const around = {
    left: Math.min(...heads.map(({ x, r }) => x - r)),
    right: Math.max(...heads.map(({ x, r }) => x + r)),
    top: Math.min(...heads.map(({ y, r }) => y - r)),
    bottom: Math.max(...heads.map(({ y, r }) => y + r)),
  };
  const nearer = shade.filter(
    ({ place, box }) => place.y > depth && boxesMeet(around, box),
  );
  if (nearer.length === 0) return 0;
  const columns = Math.ceil((around.right - around.left) / step);
  const rows = Math.ceil((around.bottom - around.top) / step);
  // Which lattice points any nearer occupant draws over.
  const over = new Uint8Array(columns * rows);
  for (const { place, silhouette } of nearer) {
    const { left, top, cells } = silhouette;
    for (let row = 0; row < rows; row++) {
      const y = around.top + (row + 0.5) * step;
      const cellRow = Math.floor(
        ((y - place.y) / place.size - top) / OCCUPANT_CELL,
      );
      if (cellRow < 0 || cellRow >= silhouette.rows) continue;
      for (let column = 0; column < columns; column++) {
        const x = around.left + (column + 0.5) * step;
        const cell = Math.floor(
          ((x - place.x) / place.size - left) / OCCUPANT_CELL,
        );
        if (
          cell >= 0 &&
          cell < silhouette.columns &&
          cells[cellRow * silhouette.columns + cell] === 1
        ) {
          over[row * columns + column] = 1;
        }
      }
    }
  }
  let most = 0;
  for (const { x, y, r } of heads) {
    let inside = 0;
    let shaded = 0;
    const first = Math.max(0, Math.floor((y - r - around.top) / step));
    const last = Math.min(rows - 1, Math.ceil((y + r - around.top) / step));
    const from = Math.max(0, Math.floor((x - r - around.left) / step));
    const to = Math.min(columns - 1, Math.ceil((x + r - around.left) / step));
    for (let row = first; row <= last; row++) {
      const down = around.top + (row + 0.5) * step - y;
      for (let column = from; column <= to; column++) {
        const across = around.left + (column + 0.5) * step - x;
        if (across * across + down * down > r * r) continue;
        inside += 1;
        shaded += over[row * columns + column] ?? 0;
      }
    }
    most = Math.max(most, shaded / Math.max(1, inside));
  }
  return most;
}
