import type { Gridded, Point } from '@/scene/shared/lib/plane';

import type { PlaneGrid } from './fit-grid';

/** How much of the drawn land the field gets wrong, in nodes. */
export type WrongArea = {
  /** Field land over drawn sea. */
  added: number;
  /** Drawn land the field leaves sea. */
  lost: number;
  truthLand: number;
  /** `(added + lost) / truthLand`. */
  wrongShare: number;
};

export function wrongArea(land: Uint8Array, truth: Uint8Array): WrongArea {
  let added = 0;
  let lost = 0;
  let truthLand = 0;
  for (const [n, t] of truth.entries()) {
    const l = land[n] ?? 0;
    truthLand += t;
    if (l === 1 && t === 0) added += 1;
    if (l === 0 && t === 1) lost += 1;
  }
  return { added, lost, truthLand, wrongShare: (added + lost) / truthLand };
}

/** A 4-connected piece of a mask, in grid nodes. */
export type Piece = {
  nodes: number;
  /** Node-index centroid. */
  i: number;
  j: number;
  touchesBorder: boolean;
};

/**
 * The 4-connected pieces where `mask` is 1: a label per node (−1 off the mask)
 * and each piece, indexed by its label.
 */
export function piecesOf(
  mask: Uint8Array,
  { columns, rows }: Gridded,
): { label: Int32Array; pieces: Piece[] } {
  const label = new Int32Array(columns * rows).fill(-1);
  const stack = new Int32Array(columns * rows);
  const pieces: Piece[] = [];
  for (let start = 0; start < label.length; start += 1) {
    if (mask[start] !== 1 || label[start] !== -1) continue;
    const id = pieces.length;
    let top = 0;
    let nodes = 0;
    let si = 0;
    let sj = 0;
    let touchesBorder = false;
    stack[top++] = start;
    label[start] = id;
    while (top > 0) {
      const n = stack[--top] ?? 0;
      const i = n % columns;
      const j = Math.floor(n / columns);
      nodes += 1;
      si += i;
      sj += j;
      if (i === 0 || j === 0 || i === columns - 1 || j === rows - 1) {
        touchesBorder = true;
      }
      for (const m of [
        i > 0 ? n - 1 : -1,
        i + 1 < columns ? n + 1 : -1,
        j > 0 ? n - columns : -1,
        j + 1 < rows ? n + columns : -1,
      ]) {
        if (m < 0 || mask[m] !== 1 || label[m] !== -1) continue;
        label[m] = id;
        stack[top++] = m;
      }
    }
    pieces.push({ nodes, i: si / nodes, j: sj / nodes, touchesBorder });
  }
  return { label, pieces };
}

/** A wrong patch, placed on the plane at its centroid, kilometres. */
export type Patch = Point & {
  kind: 'added' | 'dropped';
  km2: number;
};

/** The `count` largest wrong patches of either kind, largest first. */
export function largestPatches(
  land: Uint8Array,
  truth: Uint8Array,
  grid: PlaneGrid,
  count: number,
): Patch[] {
  const km2 = (grid.cellMetres / 1000) ** 2;
  const place = (kind: Patch['kind'], piece: Piece): Patch => ({
    kind,
    km2: piece.nodes * km2,
    x: (grid.originX + piece.i * grid.cellMetres) / 1000,
    y: (grid.originY + piece.j * grid.cellMetres) / 1000,
  });
  const added = land.map((l, n) => (l === 1 && truth[n] === 0 ? 1 : 0));
  const dropped = land.map((l, n) => (l === 0 && truth[n] === 1 ? 1 : 0));
  return [
    ...piecesOf(added, grid).pieces.map((p) => place('added', p)),
    ...piecesOf(dropped, grid).pieces.map((p) => place('dropped', p)),
  ]
    .toSorted((a, b) => b.km2 - a.km2)
    .slice(0, count);
}

/**
 * The sea `values < 0` that reaches the grid's border through sea, 4-connected
 * — the open sea, when the grid's border lies in it.
 */
export function openSea(
  values: ArrayLike<number>,
  grid: Gridded,
): Uint8Array {
  const { length } = values;
  const sea = Uint8Array.from({ length }, (_, n) =>
    (values[n] ?? 0) < 0 ? 1 : 0,
  );
  const { label, pieces } = piecesOf(sea, grid);
  return Uint8Array.from(label, (id) =>
    id >= 0 && pieces[id]?.touchesBorder === true ? 1 : 0,
  );
}

/**
 * The lakes: sea `values < 0` walled off from the grid's border, each piece
 * with its label in `label` (−1 elsewhere).
 */
export function lakesOf(
  values: ArrayLike<number>,
  grid: Gridded,
): { label: Int32Array; pieces: Piece[] } {
  const open = openSea(values, grid);
  const { length } = values;
  const closed = Uint8Array.from({ length }, (_, n) =>
    (values[n] ?? 0) < 0 && open[n] === 0 ? 1 : 0,
  );
  return piecesOf(closed, grid);
}

/** The node of `grid` nearest plane point `(x, y)` metres, or −1 off it. */
export function nodeAt(grid: PlaneGrid, x: number, y: number): number {
  const i = Math.round((x - grid.originX) / grid.cellMetres);
  const j = Math.round((y - grid.originY) / grid.cellMetres);
  const inside = i >= 0 && j >= 0 && i < grid.columns && j < grid.rows;
  return inside ? j * grid.columns + i : -1;
}
