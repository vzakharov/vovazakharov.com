/**
 * How the six faces meet: the 24 edge transforms, derived from `FACE_FRAMES`
 * rather than tabled by hand, and the cell grid's neighbours across them.
 */

import {
  type Axis,
  type Face,
  FACE_FRAMES,
  type FaceFrame,
  type FacePoint,
  FACES,
  type WithFace,
} from './cube';

export const DIRECTIONS = ['right', 'left', 'up', 'down'] as const;

/** A way off a face cell: `right`/`left` along `u`, `up`/`down` along `v`. */
export type Direction = (typeof DIRECTIONS)[number];

/** The direction leading back to where a step came from. */
type WithBack = { readonly back: Direction };

/**
 * Where leaving a face by one of its edges lands: the face beyond, the
 * direction on it that leads back, and whether the coordinate along the edge is
 * negated on that side.
 */
export type Edge = WithFace & WithBack & { readonly flip: boolean };

/** Cell `(x, y)` of a `2^level × 2^level` grid. */
export type GridCell = {
  readonly x: number;
  readonly y: number;
  readonly level: number;
};

/**
 * A cell of `face`'s grid, `x` along `u` and `y` along `v`, both from `0` at
 * `−1`.
 */
export type CubeCell = GridCell & WithFace;

/** A cell's neighbour and the direction from it back to the cell. */
export type Neighbour = CubeCell & WithBack;

const OPPOSITE: Readonly<Record<Direction, Direction>> = {
  right: 'left',
  left: 'right',
  up: 'down',
  down: 'up',
};

const negated = ({ index, sign }: Axis): Axis => ({
  index,
  sign: sign === 1 ? -1 : 1,
});

const sameAxis = (p: Axis, q: Axis) => p.index === q.index && p.sign === q.sign;

const isAlongU = (direction: Direction) =>
  direction === 'right' || direction === 'left';

const isForward = (direction: Direction) =>
  direction === 'right' || direction === 'up';

/** The world axis a direction leads along on a face. */
function heading({ u, v }: FaceFrame, direction: Direction): Axis {
  const forward = isAlongU(direction) ? u : v;
  return isForward(direction) ? forward : negated(forward);
}

/** The world axis of the coordinate running along the edge a direction crosses. */
const alongEdge = ({ u, v }: FaceFrame, direction: Direction) =>
  isAlongU(direction) ? v : u;

function only<T>(items: readonly T[], what: string): T {
  const [first, ...rest] = items;
  if (first === undefined || rest.length > 0) {
    throw new Error(`cube frames: expected one ${what}, got ${items.length}`);
  }
  return first;
}

function edgeOf(face: Face, direction: Direction): Edge {
  const frame = FACE_FRAMES[face];
  const beyond = only(
    FACES.filter((f) =>
      sameAxis(FACE_FRAMES[f].normal, heading(frame, direction)),
    ),
    `face beyond ${face} ${direction}`,
  );
  const back = only(
    DIRECTIONS.filter((d) =>
      sameAxis(heading(FACE_FRAMES[beyond], d), frame.normal),
    ),
    `way back from ${beyond} to ${face}`,
  );
  const mine = alongEdge(frame, direction);
  const theirs = alongEdge(FACE_FRAMES[beyond], back);
  if (mine.index !== theirs.index) {
    throw new Error(`cube frames: ${face} ${direction} edge axes disagree`);
  }
  return { face: beyond, back, flip: mine.sign !== theirs.sign };
}

const edgesOf = (face: Face): Readonly<Record<Direction, Edge>> => ({
  right: edgeOf(face, 'right'),
  left: edgeOf(face, 'left'),
  up: edgeOf(face, 'up'),
  down: edgeOf(face, 'down'),
});

/** The 24 edge transforms, `EDGES[face][direction]`. */
export const EDGES: Readonly<Record<Face, Readonly<Record<Direction, Edge>>>> =
  {
    px: edgesOf('px'),
    nx: edgesOf('nx'),
    py: edgesOf('py'),
    ny: edgesOf('ny'),
    pz: edgesOf('pz'),
    nz: edgesOf('nz'),
  };

/** The point at `along ∈ [−1, 1]` on the edge `direction` crosses of `face`. */
export function edgePoint(
  face: Face,
  direction: Direction,
  along: number,
): FacePoint {
  const side = isForward(direction) ? 1 : -1;
  return isAlongU(direction)
    ? { face, u: side, v: along }
    : { face, u: along, v: side };
}

/**
 * The same edge point as `edgePoint(face, direction, along)`, in the
 * coordinates of the face beyond the edge.
 */
export function crossEdge(
  face: Face,
  direction: Direction,
  along: number,
): FacePoint {
  const { face: beyond, back, flip } = EDGES[face][direction];
  return edgePoint(beyond, back, flip ? 0 - along : along);
}

/** The cell one step from `cell` in `direction`, across a face edge if need be. */
export function neighbour(cell: CubeCell, direction: Direction): Neighbour {
  const { face, level, x, y } = cell;
  const last = 2 ** level - 1;
  const step = isForward(direction) ? 1 : -1;
  const nx = isAlongU(direction) ? x + step : x;
  const ny = isAlongU(direction) ? y : y + step;
  if (nx >= 0 && nx <= last && ny >= 0 && ny <= last) {
    return { face, level, x: nx, y: ny, back: OPPOSITE[direction] };
  }
  const { face: beyond, back, flip } = EDGES[face][direction];
  const index = isAlongU(direction) ? y : x;
  const along = flip ? last - index : index;
  const fixed = isForward(back) ? last : 0;
  return isAlongU(back)
    ? { face: beyond, level, x: fixed, y: along, back }
    : { face: beyond, level, x: along, y: fixed, back };
}
