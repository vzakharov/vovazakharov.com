/**
 * What a fold asks of real paper: the engine folds with zero thickness and
 * perfect accuracy, so each step is measured against a sheet — how many
 * layers its crease bends, how thick the model gets, how far the outer layers
 * creep, and how sharp a tip it leaves — and flagged where hands give up.
 *
 * The thresholds are starting calibrations from folding practice, not
 * measurements: they are expected to move once real models are folded by hand.
 */
import { fold, type StepSpec } from './fold.ts';
import {
  add,
  apply,
  contains,
  dot,
  length,
  type Line,
  NEAR,
  normalize,
  onLine,
  perpendicular,
  scale,
  sub,
  type Vec,
} from './geometry.ts';
import type { Paper } from './paper.ts';
import { transform } from './space.ts';
import {
  adjacency,
  flatPolygon,
  type FoldRecord,
  type FoldState,
  hinges,
  isUpper,
  layers,
  type Piece,
  square,
} from './state.ts';

/** A valley or mountain fold through this many layers is hard to crease
 * cleanly; past twice that the stack springs open. */
const SIMPLE_LAYERS_WARN = 16;
const SIMPLE_LAYERS_ERROR = 32;
/** A reverse fold turns both halves inside out at once, so its budget is on
 * the layers of both together: 8 is what ordinary kami still pushes through. */
export const REVERSE_LAYERS_ERROR = 8;
/** Creep as a share of the flap's width along the crease: past the first the
 * flap's edges visibly misalign, past the second it no longer lies flat. */
const CREEP_WARN = 0.15;
const CREEP_ERROR = 0.3;
/** A tip narrower than this turns a millimetre's error at its base into
 * about 7.6 mm at its point (`1 / tan(θ/2)`), where hands stop being exact. */
const TIP_WARN_DEGREES = 15;
/** Paper joined in the sheet and apart in space is a model the engine tore:
 * a hundredth of a millimetre is far past rounding and far below any hand. */
const TEAR_ERROR_MM = 0.01;

const LEVELS = ['warn', 'error'] as const;
type Level = (typeof LEVELS)[number];

type Finding = { readonly level: Level; readonly message: string };

/** What one step asks of the paper, before it is judged. */
type Measured = {
  /** 1-based, as a person counts steps. */
  readonly step: number;
  readonly record: FoldRecord;
  /** Most layers the crease bends at any point along it. */
  readonly bent: number;
  /** A reverse fold's layers bent per half, lower first. */
  readonly halves: readonly [number, number] | undefined;
  /** Deepest stack anywhere after the step, in layers, and its depth in mm. */
  readonly stack: number;
  readonly depth: number;
  /** Deepest stack at the crease, in layers. */
  readonly stackAtCrease: number;
  /** Outer-against-inner shift of the bent layers, and the flap's width along
   * the crease, both in mm. */
  readonly creep: number;
  readonly width: number;
  /** The sharpest tip this step leaves, in degrees, and how many mm a 1 mm
   * error at its base moves its point. */
  readonly tip:
    | { readonly degrees: number; readonly amplification: number }
    | undefined;
  /** The widest gap, in mm, where two pieces joined in the paper lie apart in
   * space. */
  readonly tear: number;
};

export type StepReport = Measured & { readonly findings: readonly Finding[] };

const DEGREES = 180 / Math.PI;
const TAU = 2 * Math.PI;

type Interval = readonly [number, number];
const sweepOf = ([a, b]: Interval): number => b - a;
type Bend = { readonly span: Interval; readonly upper: boolean };

/** Distance along the line's unit direction from its anchor. */
const along = (line: Line, pt: Vec): number =>
  dot(sub(pt, line.p), normalize(line.d));

/** Each stretch of the crease, as distances along it, and its half. */
const bends = (state: FoldState, record: FoldRecord): Bend[] =>
  hinges(state, record.line, record.moved).map(({ moved, ends: [a, b] }) => {
    const [s, t] = [along(record.line, a), along(record.line, b)];
    return {
      span: [Math.min(s, t), Math.max(s, t)],
      upper: isUpper(moved, record.lowerTag),
    };
  });

/** The midpoints of the stretches between consecutive hinge ends. */
function samples(spans: readonly Interval[]): number[] {
  const ends = [...new Set(spans.flat())].toSorted((a, b) => a - b);
  return ends.slice(1).map((end, i) => ((ends[i] ?? end) + end) / 2);
}

const deepest = (spans: readonly Interval[], at: readonly number[]): number =>
  Math.max(
    0,
    ...at.map((t) => spans.filter(([a, b]) => a <= t && t <= b).length),
  );

/** Pieces holding a point just off the crease, on whichever side is deeper. */
function stackAtCrease(
  state: FoldState,
  line: Line,
  at: readonly number[],
): number {
  const unit = normalize(line.d);
  const offset = scale(perpendicular(unit), 1e-4);
  const polygons = state.pieces.map((piece) => flatPolygon(piece));
  return Math.max(
    0,
    ...at.flatMap((t) => {
      const pt = add(line.p, scale(unit, t));
      return [add(pt, offset), sub(pt, offset)].map(
        (probe) => polygons.filter((poly) => contains(poly, probe)).length,
      );
    }),
  );
}

type Wedge = {
  readonly start: number;
  readonly sweep: number;
  readonly moved: boolean;
};

/** The smallest arc covering every wedge: the circle less its widest gap. */
function arc(wedges: readonly Wedge[]): Interval {
  const pieces = wedges
    .flatMap(({ start, sweep }): Interval[] =>
      start + sweep > TAU
        ? [
            [start, TAU],
            [0, start + sweep - TAU],
          ]
        : [[start, start + sweep]],
    )
    .toSorted((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [a, b] of pieces) {
    const last = merged.at(-1);
    if (last && a <= last[1] + NEAR) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  const first = merged[0];
  if (!first) return [0, 0];
  const gaps = merged.map(([, end], i): Interval => {
    const next = merged[i + 1] ?? [first[0] + TAU, 0];
    return [end, next[0]];
  });
  const [widest] = gaps.toSorted((g, h) => sweepOf(h) - sweepOf(g));
  if (!widest) return [0, 0];
  return [widest[1], widest[0] + TAU];
}
const sameArc = (x: Interval, y: Interval): boolean =>
  Math.abs(sweepOf(x) - sweepOf(y)) < NEAR &&
  Math.abs((((x[0] - y[0]) % TAU) + TAU) % TAU) < NEAR;

/** The polygon's corner at vertex `i`, as a wedge of directions no wider
 * than a half-turn. */
function wedgeAt(
  polygon: readonly Vec[],
  i: number,
  moved: boolean,
): Wedge | undefined {
  const apex = polygon[i];
  const prev = polygon[(i + polygon.length - 1) % polygon.length];
  const next = polygon[(i + 1) % polygon.length];
  if (!apex || !prev || !next) return undefined;
  const angleTo = (pt: Vec) => {
    const [x, y] = sub(pt, apex);
    return (Math.atan2(y, x) + TAU) % TAU;
  };
  const a = angleTo(prev);
  const b = angleTo(next);
  const sweep = (b - a + TAU) % TAU;
  return sweep <= Math.PI
    ? { start: a, sweep, moved }
    : { start: b, sweep: TAU - sweep, moved };
}

/**
 * The sharpest tip the step's crease runs into, as the paper's full angle
 * there. A tip off the crease only travels with its flap, so it is not the
 * step's. A fold along a tip's own bisector lays the tip on itself and halves
 * what is seen flat without sharpening the paper, so such a tip counts double.
 */
function sharpestTip(state: FoldState, record: FoldRecord): number | undefined {
  const polygons = state.pieces.map((piece) => ({
    polygon: flatPolygon(piece),
    moved: record.moved.has(piece.id),
  }));
  const key = ([x, y]: Vec) => `${x.toFixed(6)},${y.toFixed(6)}`;
  const apexes = new Map<string, Vec>();
  for (const { polygon, moved } of polygons) {
    if (!moved) continue;
    for (const v of polygon) if (onLine(v, record.line)) apexes.set(key(v), v);
  }
  const angles = [...apexes.values()].flatMap((apex) => {
    const wedges: Wedge[] = [];
    for (const { polygon, moved } of polygons) {
      const i = polygon.findIndex((v) => length(sub(v, apex)) < NEAR);
      if (i !== -1) {
        const wedge = wedgeAt(polygon, i, moved);
        if (wedge) wedges.push(wedge);
      } else if (contains(polygon, apex)) {
        return [];
      }
    }
    const span = sweepOf(arc(wedges));
    if (span >= Math.PI - NEAR) return [];
    const movedWedges = wedges.filter((w) => w.moved);
    const stillWedges = wedges.filter((w) => !w.moved);
    const onItself =
      movedWedges.length > 0 &&
      stillWedges.length > 0 &&
      sameArc(arc(movedWedges), arc(stillWedges));
    return [onItself ? 2 * span : span];
  });
  return angles.length > 0 ? Math.min(...angles) * DEGREES : undefined;
}

const isReverse = (record: FoldRecord): boolean =>
  record.direction === 'inside' || record.direction === 'outside';

/** Where a paper point of `piece` lies in space, on no layer: layers stacked
 * apart are not a tear. */
const unlifted = (piece: Piece, pt: Vec) =>
  transform(piece.shaping, [...apply(piece.placement, pt), 0]);

/** In sheet units. */
function widestTear(state: FoldState): number {
  let widest = 0;
  for (const [i, piece] of state.pieces.entries()) {
    for (const other of state.pieces.slice(i + 1)) {
      for (const pt of adjacency(piece, other) ?? []) {
        const [x, y, z] = unlifted(piece, pt);
        const [u, v, w] = unlifted(other, pt);
        widest = Math.max(widest, Math.hypot(x - u, y - v, z - w));
      }
    }
  }
  return widest;
}

function findings(measured: Measured): Finding[] {
  const tear: Finding[] =
    measured.tear > TEAR_ERROR_MM
      ? [
          {
            level: 'error',
            message: `the model tears ${measured.tear.toFixed(2)} mm apart at a crease`,
          },
        ]
      : [];
  return [...tear, ...paperFindings(measured)];
}

function paperFindings({
  record,
  bent,
  creep,
  width,
  tip,
}: Measured): Finding[] {
  if (!record.flat) return [];
  const out: Finding[] = [];
  if (isReverse(record)) {
    if (bent > REVERSE_LAYERS_ERROR) {
      out.push({
        level: 'error',
        message: `reverse fold bends ${bent} layers, budget ${REVERSE_LAYERS_ERROR}`,
      });
    }
  } else if (bent > SIMPLE_LAYERS_ERROR) {
    out.push({
      level: 'error',
      message: `bends ${bent} layers, over ${SIMPLE_LAYERS_ERROR}`,
    });
  } else if (bent > SIMPLE_LAYERS_WARN) {
    out.push({
      level: 'warn',
      message: `bends ${bent} layers, over ${SIMPLE_LAYERS_WARN}`,
    });
  }
  const share = width > 0 ? creep / width : 0;
  const creepText = `creep ${creep.toFixed(2)} mm on a ${width.toFixed(1)} mm flap (${Math.round(share * 100)}%)`;
  if (share > CREEP_ERROR) out.push({ level: 'error', message: creepText });
  else if (share > CREEP_WARN) out.push({ level: 'warn', message: creepText });
  if (tip && tip.degrees < TIP_WARN_DEGREES) {
    out.push({
      level: 'warn',
      message: `tip of ${tip.degrees.toFixed(2)}° amplifies a base error ${tip.amplification.toFixed(1)}×`,
    });
  }
  return out;
}

/** Measures the step `state.log` last recorded, on the state right after it. */
function measure(state: FoldState, paper: Paper): StepReport {
  const record = state.log.at(-1);
  if (!record) throw new Error('physics: nothing folded yet');
  const all = bends(state, record);
  const spans = all.map((h) => h.span);
  const at = samples(spans);
  const bent = deepest(spans, at);
  const half = (upper: boolean) =>
    deepest(
      all.filter((h) => h.upper === upper).map((h) => h.span),
      at,
    );
  const stack = Math.max(0, ...layers(state).values()) + 1;
  const width =
    spans.length > 0
      ? (Math.max(...spans.map(([, b]) => b)) -
          Math.min(...spans.map(([a]) => a))) *
        paper.side
      : 0;
  const degrees = record.flat ? sharpestTip(state, record) : undefined;
  const measured: Measured = {
    step: state.log.length,
    record,
    bent,
    halves: isReverse(record) ? [half(false), half(true)] : undefined,
    stack,
    depth: stack * paper.thickness,
    stackAtCrease: stackAtCrease(state, record.line, at),
    // Bending n layers through 180° shifts the outermost against the
    // innermost by about π·n·t.
    creep: record.flat ? Math.PI * bent * paper.thickness : 0,
    width,
    tip:
      degrees === undefined
        ? undefined
        : { degrees, amplification: 1 / Math.tan(degrees / DEGREES / 2) },
    tear: widestTear(state) * paper.side,
  };
  return { ...measured, findings: findings(measured) };
}

/** Folds a fresh square step by step, measuring each step as it lands. */
export function physics(
  steps: readonly StepSpec[],
  paper: Paper,
): StepReport[] {
  const state = square();
  return steps.map((step) => measure(fold(state, step), paper));
}
