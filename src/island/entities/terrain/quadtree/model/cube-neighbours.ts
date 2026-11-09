import {
  type CubeCell,
  type Direction,
  EDGES,
  neighbour,
} from '@/island/shared/globe';

import { type Corner, cubeTileId, type NeighbourLevels } from '../../tile';

/** The leaf of `leaves` holding cell `key` or one of its ancestors, if any. */
export const covering = (
  leaves: ReadonlyMap<string, CubeCell>,
  { face, level, x, y }: CubeCell,
): CubeCell | undefined =>
  Array.from({ length: level + 1 }, (_, shift) =>
    leaves.get(
      cubeTileId({ face, level: level - shift, x: x >> shift, y: y >> shift }),
    ),
  ).find((key) => key !== undefined);

/** Each corner as the two edges meeting there, along `u` first. */
const CORNER_EDGES: Readonly<Record<Corner, readonly [Direction, Direction]>> =
  {
    sw: ['left', 'down'],
    se: ['right', 'down'],
    nw: ['left', 'up'],
    ne: ['right', 'up'],
  };

const isAlongU = (direction: Direction) =>
  direction === 'right' || direction === 'left';

const isForward = (direction: Direction) =>
  direction === 'right' || direction === 'up';

/**
 * The cell one step `first` then one step `second` from `key`, `second` read
 * in `key`'s frame even past a face edge. Off a cube corner, where no
 * diagonal cell exists, it lands on a cell beside one of `key`'s edge
 * neighbours that still touches the corner.
 */
export function diagonal(
  key: CubeCell,
  first: Direction,
  second: Direction,
): CubeCell {
  const next = neighbour(key, first);
  if (next.face === key.face) return neighbour(next, second);
  // Beyond the edge, `second` runs along the edge, signed by its flip.
  const forward = isForward(second) !== EDGES[key.face][first].flip;
  const turned: Direction = isAlongU(next.back)
    ? forward
      ? 'up'
      : 'down'
    : forward
      ? 'right'
      : 'left';
  return neighbour(next, turned);
}

/**
 * Each leaf's `NeighbourLevels` within `leaves`, by tile id: an edge's is the
 * leaf covering the cell beyond it, a corner's the coarsest of both edge
 * neighbours and both two-step diagonals. A finer or missing neighbour counts
 * as the leaf's own level.
 */
export function neighbourLevels(
  leaves: readonly CubeCell[],
): Map<string, NeighbourLevels> {
  const byId = new Map(leaves.map((key) => [cubeTileId(key), key] as const));
  const levelAt = (key: CubeCell, cell: CubeCell) =>
    Math.min(key.level, covering(byId, cell)?.level ?? key.level);
  const result = new Map<string, NeighbourLevels>();
  for (const [id, key] of byId) {
    const edge = (direction: Direction) =>
      levelAt(key, neighbour(key, direction));
    const corner = (at: Corner) => {
      const [u, v] = CORNER_EDGES[at];
      return Math.min(
        edge(u),
        edge(v),
        levelAt(key, diagonal(key, u, v)),
        levelAt(key, diagonal(key, v, u)),
      );
    };
    result.set(id, {
      edges: {
        right: edge('right'),
        left: edge('left'),
        up: edge('up'),
        down: edge('down'),
      },
      corners: {
        sw: corner('sw'),
        se: corner('se'),
        nw: corner('nw'),
        ne: corner('ne'),
      },
    });
  }
  return result;
}
