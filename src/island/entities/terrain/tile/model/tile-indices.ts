import { type Direction, DIRECTIONS } from '@/island/shared/globe';

/** Which of a tile's edges a tile one level coarser meets. */
export type CoarseEdges = Readonly<Record<Direction, boolean>>;

export const NO_COARSE_EDGES: CoarseEdges = {
  right: false,
  left: false,
  up: false,
  down: false,
};

/** The edges counter-clockwise, each a quarter turn on from the one before. */
const TURNS = ['down', 'right', 'up', 'left'] as const satisfies Direction[];

function turned(turn: number): Direction {
  const direction = TURNS[turn % TURNS.length];
  if (direction === undefined) throw new RangeError(`no turn ${turn}`);
  return direction;
}

type Spot = readonly [i: number, j: number];

/** `spot` turned a quarter counter-clockwise `turn` times in a `[0, last]` square. */
function turnedSpot([i, j]: Spot, turn: number, last: number): Spot {
  let [u, v] = [i, j];
  for (let t = 0; t < turn; t++) [u, v] = [last - v, u];
  return [u, v];
}

/**
 * The grid's triangles, as vertex triples wound counter-clockwise in `(i, j)`
 * (east, north). Along an edge a coarser tile meets, every other border vertex
 * is left out: the border's triangles fan to the coarse tile's vertices only,
 * so each border edge is one of that tile's edges and no T-junction is left
 * for a rasteriser to leak through. A grid with a coarse edge needs an even
 * cell count of at least 4, so the coarse vertices are the even ones.
 */
export function gridTriangles(grid: number, coarse: CoarseEdges): number[] {
  const cells = grid - 1;
  const last = cells;
  const anyCoarse = DIRECTIONS.some((d) => coarse[d]);
  if (anyCoarse && (cells % 2 !== 0 || cells < 4)) {
    throw new RangeError(`no coarse edge on a grid of ${cells} cells`);
  }
  const triangles: number[] = [];
  const covered = new Uint8Array(cells * cells);

  for (const [turn, direction] of TURNS.entries()) {
    if (!coarse[direction]) continue;
    // Laid out as the down edge, then turned a quarter `turn` times
    // counter-clockwise: `(i, j) → (last − j, i)`, which keeps the winding.
    const fan = (...spots: Spot[]) => {
      for (const spot of spots) {
        const [u, v] = turnedSpot(spot, turn, last);
        triangles.push(v * grid + u);
      }
    };
    const cover = (i: number, j: number) => {
      const [u, v] = turnedSpot([i + 0.5, j + 0.5], turn, last);
      covered[Math.floor(v) * cells + Math.floor(u)] = 1;
    };
    const before = coarse[turned(turn + 3)];
    const after = coarse[turned(turn + 1)];

    if (before) {
      // Both edges at the corner coarse: the 2×2 cells there fan round (1, 1).
      const ring: Spot[] = [
        [0, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [1, 2],
        [0, 2],
      ];
      for (const [n, spot] of ring.entries()) {
        fan(spot, ring[(n + 1) % ring.length] ?? spot, [1, 1]);
      }
      for (const [i, j] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ] as const)
        cover(i, j);
    }
    const first = before ? 1 : 0;
    const end = cells / 2 - (after ? 1 : 0);
    for (let m = first; m < end; m++) {
      const [a, b] = [2 * m, 2 * m + 2];
      fan([a, 0], [b, 0], [a + 1, 1]);
      fan([a, 0], [a + 1, 1], [a, 1]);
      fan([b, 0], [b, 1], [a + 1, 1]);
      cover(a, 0);
      cover(a + 1, 0);
    }
  }

  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      if (covered[j * cells + i] === 1) continue;
      const sw = j * grid + i;
      const nw = sw + grid;
      triangles.push(sw, sw + 1, nw + 1, sw, nw + 1, nw);
    }
  }
  return triangles;
}

type IndexBuffer = Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;

const built = new Map<string, IndexBuffer>();

const copied = (indices: IndexBuffer): IndexBuffer =>
  indices instanceof Uint16Array
    ? new Uint16Array(indices)
    : new Uint32Array(indices);

/**
 * A tile's index buffer: the grid's triangles (`gridTriangles`), then the
 * skirt's two per border segment, hanging from every border vertex, a left-out
 * one included. Built once per grid and edge set; each call returns a copy of
 * its own, so a worker can transfer it.
 */
export function tileIndices(
  grid: number,
  loop: readonly number[],
  coarse: CoarseEdges,
): IndexBuffer {
  const name = `${grid}/${TURNS.map((d) => (coarse[d] ? 1 : 0)).join('')}`;
  const known = built.get(name);
  if (known !== undefined) return copied(known);
  const triangles = gridTriangles(grid, coarse);
  const skirt = grid * grid;
  for (const [k, top] of loop.entries()) {
    const next = (k + 1) % loop.length;
    const following = loop[next];
    if (following === undefined) throw new RangeError(`no loop entry ${next}`);
    triangles.push(
      top,
      skirt + k,
      following,
      following,
      skirt + k,
      skirt + next,
    );
  }
  const indices: IndexBuffer =
    skirt + loop.length <= 0xff_ff
      ? new Uint16Array(triangles)
      : new Uint32Array(triangles);
  built.set(name, indices);
  return copied(indices);
}
