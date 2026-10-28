/**
 * How much of a flower's head the mushrooms a visit opens with draw over:
 * each mushroom's caps and stem as drawn, where the layout stands it, read
 * as a silhouette of cells so a flower's many tries stay cheap.
 */

import { keptIn } from '@/kernel/shared/cache';

import type { Box, Point } from '@/mushrooms/shared/lib/geometry';
import {
  type ClumpShade,
  type MushroomGround,
  OCCUPANT_CELL,
  type Silhouette,
} from '@/mushrooms/shared/meadow';

import {
  type MushroomGenes,
  mushroomGenes,
  type MushroomSeed,
} from '../model/mushroom-genes';
import type { Footed } from '../model/placement';
import { placeIn, type Placement } from './clump-layout';
import { standingWith } from './door-sight';

/** A mushroom standing as a visit opens: its seed, and the foot it stands on. */
export type Opener = MushroomSeed & Footed;

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
  const bySplay = keptIn(
    silhouettes,
    genes,
    () => new Map<number, Silhouette>(),
  );
  return keptIn(bySplay, splay, () => drawnSilhouette(genes, splay));
}

function drawnSilhouette(genes: MushroomGenes, splay: number): Silhouette {
  const outlines = standingWith(
    { x: 0, y: 0, size: 1, splay, haze: 0 },
    genes,
  ).drawn;
  const xs = outlines.flat().map(({ x }) => x);
  const ys = outlines.flat().map(({ y }) => y);
  // A cell's margin all round, which the spread reaches into.
  const left = Math.min(...xs) - 2 * OCCUPANT_CELL;
  const top = Math.min(...ys) - 2 * OCCUPANT_CELL;
  const columns = Math.ceil(
    (Math.max(...xs) + 2 * OCCUPANT_CELL - left) / OCCUPANT_CELL,
  );
  const rows = Math.ceil(
    (Math.max(...ys) + 2 * OCCUPANT_CELL - top) / OCCUPANT_CELL,
  );
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
  return { left, top, columns, rows, cells };
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
      const first = Math.max(0, Math.ceil((low.y - top) / OCCUPANT_CELL - 0.5));
      const last = Math.min(
        rows - 1,
        Math.ceil((high.y - top) / OCCUPANT_CELL - 0.5) - 1,
      );
      for (let row = first; row <= last; row++) {
        const y = top + (row + 0.5) * OCCUPANT_CELL;
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
      const from = Math.ceil(((xs[index] ?? 0) - left) / OCCUPANT_CELL - 0.5);
      const to = Math.floor(
        ((xs[index + 1] ?? 0) - left) / OCCUPANT_CELL - 0.5,
      );
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

/** The box on screen `silhouette` stays inside, stood at its place. */
function placedBox(
  { left, top, columns, rows }: Silhouette,
  { x, y, size }: Placement,
): Box {
  return {
    left: x + left * size,
    top: y + top * size,
    right: x + (left + columns * OCCUPANT_CELL) * size,
    bottom: y + (top + rows * OCCUPANT_CELL) * size,
  };
}
