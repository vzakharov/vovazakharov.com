/**
 * One fold: split the pieces the line crosses, take the selected flap closed
 * over paper connectivity, and swing it across the line — flat (180°, a
 * reflection and a restack) or shaping (any other angle, a 3D rotation).
 */
import {
  add,
  apply,
  compose,
  contains,
  EPS,
  invert,
  type Line,
  lineThrough,
  onLine,
  perpendicular,
  reflection,
  scale,
  type Segment,
  side,
  splitConvex,
  type Vec,
} from './geometry.ts';
import {
  differ,
  invertRigid,
  type Mat4,
  multiply,
  rotationAbout,
} from './space.ts';
import {
  adjacency,
  cut,
  flatPolygon,
  type FoldDirection,
  type FoldState,
  hinges,
  isUpper,
  type Piece,
  square,
} from './state.ts';

/** Which pieces seed the moving flap; the flap is then closed over paper
 * connectivity, so a seed drags along everything joined to it off the line. */
type Selection =
  | 'all'
  | 'flap'
  | { readonly tag: string }
  | { readonly at: Vec; readonly top: number }
  | { readonly at: Vec; readonly bottom: number }
  | { readonly at: Vec; readonly layers: readonly [number, number] }
  | { readonly at: Vec; readonly all: true };

export type Step = {
  /** Two points of the fold line, in the flat folded state. */
  readonly line: { readonly p: Vec; readonly q: Vec };
  /** A point on the side that moves. */
  readonly moving: Vec;
  readonly select?: Selection;
  readonly direction?: FoldDirection;
  /** Degrees; 180 folds flat, anything else shapes the model in 3D. */
  readonly angle?: number;
  /** Added to every moving piece. */
  readonly tag?: string;
  /** For reverse folds: pieces carrying this tag form the lower half. */
  readonly lower?: string;
  /** The share of its fold angle the crease keeps when the model is let go:
   * 1 is pressed sharp. Overrides the paper's default for the fold's kind. */
  readonly hold?: number;
};

/** A step, or a step computed from the state it folds. */
export type StepSpec = Step | ((state: FoldState) => Step);

/** Pieces whose flat polygon holds `at`, bottom first. */
function piecesAt(state: FoldState, at: Vec): Piece[] {
  const here = state.pieces
    .filter((p) => contains(flatPolygon(p), at))
    .toSorted((a, b) => a.order - b.order);
  if (here.length === 0) throw new Error(`fold: nothing at ${at.join(',')}`);
  return here;
}

function seeds(
  state: FoldState,
  selection: Selection,
  line: Line,
  movingPoint: Vec,
): Piece[] {
  const movingSign = Math.sign(side(movingPoint, line));
  if (selection === 'all') {
    return state.pieces.filter((p) =>
      flatPolygon(p).some((v) => side(v, line) * movingSign > EPS),
    );
  }
  if (selection === 'flap') {
    return state.pieces.filter((p) => contains(flatPolygon(p), movingPoint));
  }
  if ('tag' in selection) {
    return state.pieces.filter((p) => p.tags.has(selection.tag));
  }
  const here = piecesAt(state, selection.at);
  if ('all' in selection) return here;
  if ('top' in selection) return here.slice(-selection.top);
  if ('bottom' in selection) return here.slice(0, selection.bottom);
  return here.slice(selection.layers[0], selection.layers[1] + 1);
}

/** The moving set: seeds split by the line, closed over paper adjacency
 * across every shared edge that is not on the fold line. */
function flap(
  state: FoldState,
  seedPieces: Piece[],
  line: Line,
  movingSign: number,
): Set<number> {
  const moving = new Set<number>();
  const processed = new Set<number>();
  const queue = seedPieces.map((p) => p.id);
  const alongLine = (piece: Piece, points: readonly Vec[]) =>
    points.every((pt) => onLine(apply(piece.placement, pt), line));

  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    if (processed.has(id)) continue;
    processed.add(id);
    const piece = state.pieces.find((p) => p.id === id);
    // A piece split earlier in this fold is gone; its halves are queued.
    if (!piece) continue;
    const inverse = invert(piece.placement);
    const paperLine = lineThrough(
      apply(inverse, line.p),
      apply(inverse, add(line.p, line.d)),
    );
    const { left, right } = splitConvex(piece.paper, paperLine);
    const probe = apply(
      inverse,
      add(line.p, scale(perpendicular(line.d), movingSign)),
    );
    const movingIsLeft = side(probe, paperLine) > 0;
    const movingPart = movingIsLeft ? left : right;
    const stationaryPart = movingIsLeft ? right : left;
    if (!movingPart) continue;
    let mover = piece;
    if (stationaryPart) {
      mover = cut(state, piece, movingPart);
      const rest = cut(state, piece, stationaryPart);
      state.pieces = [
        ...state.pieces.filter((p) => p.id !== piece.id),
        mover,
        rest,
      ];
      processed.add(mover.id);
      processed.add(rest.id);
    }
    moving.add(mover.id);
    for (const other of state.pieces) {
      if (
        other.id === mover.id ||
        (processed.has(other.id) && moving.has(other.id))
      ) {
        continue;
      }
      const shared = adjacency(mover, other);
      if (!shared || alongLine(mover, shared)) continue;
      processed.delete(other.id);
      if (!moving.has(other.id)) queue.push(other.id);
    }
  }
  return moving;
}

/** Re-keys `group` former-top-first: a flap turned over reverses its order. */
function restack(group: Piece[], key: (i: number, n: number) => number): void {
  for (const [i, piece] of [...group]
    .toSorted((a, b) => b.order - a.order)
    .entries()) {
    piece.order = key(i, group.length);
  }
}

function extreme(zs: number[], pick: typeof Math.max): number {
  if (zs.length === 0) {
    throw new Error(
      'fold: a reverse fold needs a stationary part in each half',
    );
  }
  return pick(...zs);
}

function flatFold(
  state: FoldState,
  moved: Piece[],
  line: Line,
  step: Step,
): void {
  const direction = step.direction ?? 'valley';
  const mirror = reflection(line);
  for (const piece of moved) piece.placement = compose(mirror, piece.placement);
  const movedIds = new Set(moved.map((p) => p.id));
  const stationary = state.pieces.filter((p) => !movedIds.has(p.id));

  if (direction === 'valley' || direction === 'mountain') {
    const zs = stationary.map((p) => p.order);
    const base =
      direction === 'valley'
        ? Math.max(0, ...zs) + 1
        : Math.min(0, ...zs) - moved.length - 1;
    restack(moved, (i) => base + i);
  } else {
    const upper = (p: Piece) => isUpper(p, step.lower);
    const lowZ = stationary.filter((p) => !upper(p)).map((p) => p.order);
    const upZ = stationary.filter((p) => upper(p)).map((p) => p.order);
    const above = (anchor: number) => (i: number, n: number) =>
      anchor + (i + 1) / (n + 1);
    const below = (anchor: number) => (i: number, n: number) =>
      anchor - (n - i) / (n + 1);
    const lowMoved = moved.filter((p) => !upper(p));
    const upMoved = moved.filter((p) => upper(p));
    if (direction === 'inside') {
      restack(lowMoved, above(extreme(lowZ, Math.max)));
      restack(upMoved, below(extreme(upZ, Math.min)));
    } else {
      restack(lowMoved, below(extreme(lowZ, Math.min)));
      restack(upMoved, above(extreme(upZ, Math.max)));
    }
  }
  for (const [i, piece] of [...state.pieces]
    .toSorted((a, b) => a.order - b.order)
    .entries()) {
    piece.order = i;
  }
}

/** The shaping of the paper the flap stays joined to: where the crease is in
 * space. Throws when the pieces along the crease disagree, since then there is
 * no one crease to turn about. */
function hingeShaping(
  state: FoldState,
  line: Line,
  moved: ReadonlySet<number>,
): Mat4 {
  const [first, ...rest] = hinges(state, line, moved).map((h) => h.still);
  if (!first) throw new Error('fold: a shaping fold with no crease to turn on');
  if (rest.some((other) => differ(other.shaping, first.shaping))) {
    throw new Error('fold: the crease runs through differently shaped paper');
  }
  return first.shaping;
}

/** Folds `state` in place by one step and records it in `state.log`. */
export function fold(state: FoldState, spec: StepSpec): FoldState {
  const step = typeof spec === 'function' ? spec(state) : spec;
  const line = lineThrough(step.line.p, step.line.q);
  const movingSign = Math.sign(side(step.moving, line));
  if (!movingSign) throw new Error('fold: the moving point is on the line');
  const angle = step.angle ?? 180;
  const flat = Math.abs(angle - 180) < EPS;
  const direction = step.direction ?? 'valley';

  const movedIds = flap(
    state,
    seeds(state, step.select ?? 'all', line, step.moving),
    line,
    movingSign,
  );
  if (movedIds.size === 0) throw new Error('fold: moved nothing');
  const moved = state.pieces.filter((p) => movedIds.has(p.id));
  if (step.tag !== undefined) {
    for (const piece of moved) piece.tags.add(step.tag);
  }
  const creases = hinges(state, line, movedIds).map(
    ({ moved: piece, ends }): Segment => {
      const toPaper = invert(piece.placement);
      return [apply(toPaper, ends[0]), apply(toPaper, ends[1])];
    },
  );

  if (flat) flatFold(state, moved, line, step);
  else {
    const sign = direction === 'valley' ? 1 : -1;
    const rotation = rotationAbout(
      line,
      ((angle * Math.PI) / 180) * sign * movingSign,
    );
    // The line is drawn flat, but the crease lies where the still side's
    // shaping put it: conjugating by that shaping turns the flap about it
    // there, whatever shaping each moved piece carries of its own.
    const hinge = hingeShaping(state, line, movedIds);
    const turn = multiply(hinge, multiply(rotation, invertRigid(hinge)));
    for (const piece of moved) piece.shaping = multiply(turn, piece.shaping);
  }

  state.log.push({
    line,
    direction,
    flat,
    moved: movedIds,
    lowerTag: step.lower,
    creases,
    hold: step.hold,
  });
  return state;
}

/** A fresh square folded by the first `upTo` steps. */
export function run(
  steps: readonly StepSpec[],
  upTo = steps.length,
): FoldState {
  const state = square();
  for (const step of steps.slice(0, upTo)) fold(state, step);
  return state;
}
