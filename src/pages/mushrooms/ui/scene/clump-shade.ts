/**
 * How much of a flower's head the mushrooms a visit opens with draw over:
 * each mushroom's caps and stem as drawn, where the layout stands it, read
 * as a silhouette of cells so a flower's many tries stay cheap.
 */

import type { Planted } from '../../model/game';
import {
  type Box,
  boxesMeet,
  type Circle,
  type Point,
} from '../../model/geometry';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import { type MushroomGround, placeIn } from './clump-layout';
import { standingWith } from './door-sight';
import type { Placement } from './layout';

/** A mushroom standing as a visit opens: its seed, and the foot it stands on. */
export type Opener = Pick<Planted, 'seed' | 'species' | 'foot'>;

/** A silhouette's cell, in units of the mushroom's size. */
const CELL = 0.02;

/**
 * Every cell a mushroom stood with one splay draws over, in its own units
 * about its foot, y down the screen, spread by a cell every way so the
 * cells hold the whole of what is drawn.
 */
type Silhouette = Pick<Box, 'left' | 'top'> & {
  columns: number;
  rows: number;
  cells: Uint8Array;
};

/** The mushrooms of a visit's opening, each as its silhouette where it stands and the box round it. */
export type ClumpShade = ReadonlyArray<{
  place: Placement;
  silhouette: Silhouette;
  box: Box;
}>;

/** The shade of each of `openers` standing where `ground` stands it. */
export function clumpShade(
  ground: MushroomGround,
  openers: readonly Opener[],
): ClumpShade {
  return openers.flatMap((opener) => {
    const place = placeIn(ground, opener);
    if (!place) return [];
    const silhouette = silhouetteOf(mushroomGenes(opener), place.splay);
    return [{ place, silhouette, box: placedBox(silhouette, place) }];
  });
}

/** Each grown mushroom's silhouettes by splay: genes are never changed once grown. */
const silhouettes = new WeakMap<MushroomGenes, Map<number, Silhouette>>();

/** The silhouette of `genes` stood with `splay` (`Silhouette`), drawn once. */
function silhouetteOf(genes: MushroomGenes, splay: number): Silhouette {
  const bySplay = silhouettes.get(genes) ?? new Map<number, Silhouette>();
  silhouettes.set(genes, bySplay);
  const known = bySplay.get(splay);
  if (known) return known;
  const outlines = standingWith(
    { x: 0, y: 0, size: 1, splay, haze: 0 },
    genes,
  ).drawn;
  const xs = outlines.flat().map(({ x }) => x);
  const ys = outlines.flat().map(({ y }) => y);
  // A cell's margin all round, which the spread reaches into.
  const left = Math.min(...xs) - 2 * CELL;
  const top = Math.min(...ys) - 2 * CELL;
  const columns = Math.ceil((Math.max(...xs) + 2 * CELL - left) / CELL);
  const rows = Math.ceil((Math.max(...ys) + 2 * CELL - top) / CELL);
  const filled = new Uint8Array(columns * rows);
  for (const outline of outlines) {
    fill(outline, { left, top, columns, rows, cells: filled });
  }
  const cells = new Uint8Array(columns * rows);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (filled[row * columns + column] !== 1) continue;
      for (let down = -1; down <= 1; down++) {
        for (let across = -1; across <= 1; across++) {
          const r = row + down;
          const c = column + across;
          if (r >= 0 && r < rows && c >= 0 && c < columns) {
            cells[r * columns + c] = 1;
          }
        }
      }
    }
  }
  const silhouette = { left, top, columns, rows, cells };
  bySplay.set(splay, silhouette);
  return silhouette;
}

/**
 * Marks every cell of `into` whose centre the closed `outline` holds, by the
 * even-odd rule: each edge notes where it crosses each row's centre, and each
 * row is filled between its crossings in pairs.
 */
function fill(outline: readonly Point[], into: Silhouette): void {
  const { left, top, columns, rows, cells } = into;
  const crossings: number[][] = Array.from({ length: rows }, () => []);
  let a = outline.at(-1);
  for (const b of outline) {
    if (a !== undefined && a.y !== b.y) {
      const [low, high] = a.y < b.y ? [a, b] : [b, a];
      // The rows whose centre lies in [low.y, high.y).
      const first = Math.max(0, Math.ceil((low.y - top) / CELL - 0.5));
      const last = Math.min(
        rows - 1,
        Math.ceil((high.y - top) / CELL - 0.5) - 1,
      );
      for (let row = first; row <= last; row++) {
        const y = top + (row + 0.5) * CELL;
        crossings[row]?.push(
          low.x + ((y - low.y) * (high.x - low.x)) / (high.y - low.y),
        );
      }
    }
    a = b;
  }
  for (const [row, xs] of crossings.entries()) {
    xs.sort((p, q) => p - q);
    for (let index = 0; index + 1 < xs.length; index += 2) {
      const from = Math.ceil(((xs[index] ?? 0) - left) / CELL - 0.5);
      const to = Math.floor(((xs[index + 1] ?? 0) - left) / CELL - 0.5);
      for (
        let column = Math.max(0, from);
        column <= Math.min(columns - 1, to);
        column++
      ) {
        cells[row * columns + column] = 1;
      }
    }
  }
}

/**
 * The most of any of `heads` the mushrooms of `shade` standing nearer the
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
  // Which lattice points any nearer mushroom draws over.
  const over = new Uint8Array(columns * rows);
  for (const { place, silhouette } of nearer) {
    const { left, top, cells } = silhouette;
    for (let row = 0; row < rows; row++) {
      const y = around.top + (row + 0.5) * step;
      const cellRow = Math.floor(((y - place.y) / place.size - top) / CELL);
      if (cellRow < 0 || cellRow >= silhouette.rows) continue;
      for (let column = 0; column < columns; column++) {
        const x = around.left + (column + 0.5) * step;
        const cell = Math.floor(((x - place.x) / place.size - left) / CELL);
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

/** The box on screen `silhouette` stays inside, stood at its place. */
function placedBox(
  { left, top, columns, rows }: Silhouette,
  { x, y, size }: Placement,
): Box {
  return {
    left: x + left * size,
    top: y + top * size,
    right: x + (left + columns * CELL) * size,
    bottom: y + (top + rows * CELL) * size,
  };
}
