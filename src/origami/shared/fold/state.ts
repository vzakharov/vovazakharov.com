/**
 * The folded sheet: convex pieces, each with its polygon in paper
 * coordinates, a flat placement, a stacking key and a 3D shaping matrix.
 */
import {
  type Affine,
  apply,
  contains,
  edges,
  IDENTITY,
  type Line,
  onLine,
  overlaps,
  type Polygon,
  type Segment,
  sharedSegment,
  type Vec,
} from './geometry.ts';
import { IDENTITY4, type Mat4 } from './space.ts';

/** A piece of the sheet as the paper knows it: which one, and its outline in
 * paper coordinates. */
export type PaperPiece = {
  readonly id: number;
  readonly paper: Polygon;
};

export type Piece = PaperPiece & {
  /** Paper → flat folded state. */
  placement: Affine;
  /** Stacking key in the flat state: higher lies above. Only order matters. */
  order: number;
  /** Shaping folds, applied on top of the flat placement. */
  shaping: Mat4;
  readonly tags: Set<string>;
};

export const FOLD_DIRECTIONS = [
  'valley',
  'mountain',
  'inside',
  'outside',
] as const;
/**
 * `valley` swings the flap up and lands it on top, `mountain` down and below.
 * `inside` and `outside` are reverse folds on a model folded in half: each
 * half's moving part lands on its own stationary part, between the halves or
 * around them.
 */
export type FoldDirection = (typeof FOLD_DIRECTIONS)[number];

/** What one fold did, kept for the physics that reads the state after it. */
/** The pieces a fold moved, by id, as they exist after it. */
export type Moved = { readonly moved: ReadonlySet<number> };

export type FoldRecord = Moved & {
  readonly line: Line;
  readonly direction: FoldDirection;
  readonly flat: boolean;
  /** Tag telling the two halves of a reverse fold apart; see `fold`. */
  readonly lowerTag: string | undefined;
  /** The paper the fold bent, in paper coordinates. Later folds only cut
   * these into collinear pieces, so every crease lies within some fold's. */
  readonly creases: readonly Segment[];
  /** The step's own `hold`, when it overrides the paper's. */
  readonly hold: number | undefined;
};

export const isReverse = (record: FoldRecord): boolean =>
  record.direction === 'inside' || record.direction === 'outside';

/** Whether `piece` is in the upper half of a reverse fold: the half not
 * carrying `lowerTag`, or, with none given, the half tagged `R`. */
export const isUpper = (piece: Piece, lowerTag: string | undefined): boolean =>
  lowerTag === undefined ? piece.tags.has('R') : !piece.tags.has(lowerTag);

export type FoldState = {
  pieces: Piece[];
  readonly log: FoldRecord[];
  nextId: number;
};

export function square(): FoldState {
  return {
    pieces: [
      {
        id: 0,
        paper: [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        placement: IDENTITY,
        order: 0,
        shaping: IDENTITY4,
        tags: new Set(),
      },
    ],
    log: [],
    nextId: 1,
  };
}

/** A new piece cut from `from`, keeping its placement, stacking and tags. */
export function cut(state: FoldState, from: Piece, paper: Polygon): Piece {
  return { ...from, id: state.nextId++, paper, tags: new Set(from.tags) };
}

export const flatPolygon = (piece: Piece): Polygon =>
  piece.paper.map((pt) => apply(piece.placement, pt));

/** Where a point of the paper lies in the flat folded state. */
export function where(state: FoldState, pt: Vec): Vec {
  const piece = state.pieces.find((p) => contains(p.paper, pt));
  if (!piece) throw new Error(`paper point ${pt.join(',')} is on no piece`);
  return apply(piece.placement, pt);
}

/** The paper edge two pieces share, when they share one — a crease or a cut
 * the engine made, never the sheet's own outline. */
export function adjacency(p: Piece, q: Piece): Segment | undefined {
  for (const a of edges(p.paper)) {
    for (const b of edges(q.paper)) {
      const shared = sharedSegment(a, b);
      if (shared) return shared;
    }
  }
  return undefined;
}

/** A crease a fold bends: a moved piece, a piece that stayed, and the ends of
 * the paper edge they share, in the flat state. */
export type Hinge = {
  readonly moved: Piece;
  readonly still: Piece;
  readonly ends: readonly [Vec, Vec];
};

/** Every stretch of `line` where a piece in `moved` is joined to one that is
 * not. */
export function hinges(
  state: FoldState,
  line: Line,
  moved: ReadonlySet<number>,
): Hinge[] {
  const still = state.pieces.filter((p) => !moved.has(p.id));
  return state.pieces
    .filter((p) => moved.has(p.id))
    .flatMap((piece) =>
      still.flatMap((other): Hinge[] => {
        const shared = adjacency(piece, other);
        if (!shared) return [];
        const a = apply(piece.placement, shared[0]);
        const b = apply(piece.placement, shared[1]);
        return onLine(a, line) && onLine(b, line)
          ? [{ moved: piece, still: other, ends: [a, b] }]
          : [];
      }),
    );
}

/** Each piece's local layer index: the longest chain of overlapping pieces
 * beneath it. Pieces apart from each other both sit on layer 0. */
export function layers(state: FoldState): Map<number, number> {
  const stack = [...state.pieces]
    .toSorted((a, b) => a.order - b.order)
    .map((piece) => ({ ...piece, polygon: flatPolygon(piece), layer: 0 }));
  for (const [i, entry] of stack.entries()) {
    for (const below of stack.slice(0, i)) {
      if (overlaps(entry.polygon, below.polygon)) {
        entry.layer = Math.max(entry.layer, below.layer + 1);
      }
    }
  }
  return new Map(stack.map(({ id, layer }) => [id, layer]));
}
