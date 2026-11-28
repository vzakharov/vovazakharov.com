import { type Pen, type Point, rng } from '@/clip/shared/ink';

import type { Stroke } from './glyph';
import {
  cut,
  layOut,
  lengthOf,
  type TextLayout,
  type WrittenStroke,
} from './layout';
import { LETTERING_PALETTE } from './palette-lettering';
import { traceBoiled } from './trace';
import { writeWith, type Writing } from './write';

/** A wavering line and its length. */
type Layer = readonly [Stroke, number];

/** Where the blood pools under a stroke, and how far it runs when it runs all the way. */
type Drip = {
  pool: Point;
  /** How far it runs, in stage units. */
  dripLength: number;
  sway: number;
};

/** One stroke as the shaking hand made it: one wavering line per layer, and its drip. */
type Gouged = {
  /** The smear, the wet line and the gouge. */
  layers: readonly Layer[];
  /** None for a stroke that did not drip. */
  drip?: Drip;
};

// How far each layer's line wavers off the stroke, in cap heights.
const WAVER = [0.06, 0.05, 0.03] as const;

/** The lowest of `points`, where blood gathers. */
function lowest(points: Stroke): Point {
  let low: Point = points[0] ?? [0, 0];
  for (const point of points) if (point[1] > low[1]) low = point;
  return low;
}

/** `points` cut into short pieces, each joint nudged by up to `amplitude`. */
function shaky(
  points: Stroke,
  random: () => number,
  amplitude: number,
  step: number,
): Stroke {
  const out: Point[] = [];
  const nudge = () => (random() - 0.5) * amplitude;
  for (let n = 1; n < points.length; n += 1) {
    const [ax, ay] = points[n - 1] ?? [0, 0];
    const [bx, by] = points[n] ?? [0, 0];
    const pieces = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = n === 1 ? 0 : 1; k <= pieces; k += 1) {
      out.push([
        ax + ((bx - ax) * k) / pieces + nudge(),
        ay + ((by - ay) * k) / pieces + nudge(),
      ]);
    }
  }
  return out.length > 0 ? out : points;
}

function gouge(layout: TextLayout, size: number, seed: number): Gouged[] {
  const random = rng(seed);
  return layout.strokes.map(({ points }) => {
    const layers = WAVER.map((waver): Layer => {
      const line = shaky(points, random, size * waver, size * 0.12);
      return [line, lengthOf(line)];
    });
    const pool = lowest(points);
    const drips = random() < 0.45;
    const reach = size * (0.25 + random() * 0.9);
    const sway = (random() - 0.5) * size * 0.1;
    return drips
      ? { layers, drip: { pool, dripLength: reach, sway } }
      : { layers };
  });
}

// The wavering lines are a pure function of the layout and the seed, so each
// is drawn up once.
const GOUGED = new WeakMap<TextLayout, Map<number, Gouged[]>>();

function gougedOf(layout: TextLayout, size: number, seed: number): Gouged[] {
  const bySeed = GOUGED.get(layout) ?? new Map<number, Gouged[]>();
  GOUGED.set(layout, bySeed);
  const cached = bySeed.get(seed);
  if (cached) return cached;
  const fresh = gouge(layout, size, seed);
  bySeed.set(seed, fresh);
  return fresh;
}

// The wet line's width in cap heights: what `weight` sets.
const WET_WEIGHT = 0.09;

const LAYER_STYLE = [
  { color: LETTERING_PALETTE.smear, width: 0.2, alpha: 0.6 },
  { color: LETTERING_PALETTE.blood, width: 0.09, alpha: 0.95 },
  { color: LETTERING_PALETTE.gouge, width: 0.022, alpha: 0.75 },
] as const;

/**
 * Gouged into wall paint with a fingernail and filled with blood: a dark smear,
 * a wet red line over it, the pale scratch in the paint showing through both,
 * and drips running down from the low end of strokes. A drip runs as the hand
 * writes on past its stroke, and `bleed` in `[0, 1]` runs every drip further —
 * 1 runs them all the way.
 */
export function writeScratched(
  pen: Pen,
  text: string,
  writing: Writing & { bleed?: number },
): void {
  const {
    letterHeight: size,
    seed = 1,
    bleed = 0,
    weight = WET_WEIGHT,
  } = writing;
  const gouged = gougedOf(layOut(text, writing), size, seed);
  // Every layer's width keeps its proportion to the wet line's.
  const thickness = weight / WET_WEIGHT;
  writeWith(pen, text, writing, (strokes) => {
    const { ctx } = pen;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const wobble = size * 0.012;
    for (const [layer, style] of LAYER_STYLE.entries()) {
      ctx.beginPath();
      // `writtenUpTo` keeps the layout's order from its first stroke, so the
      // n-th written stroke is the layout's n-th.
      for (const [n, stroke] of strokes.entries()) {
        const [line, length] = gouged[n]?.layers[layer] ?? [[], 0];
        const drawn = cut(line, length * stroke.done);
        traceBoiled(pen, drawn, seed + stroke.glyph, wobble);
      }
      ctx.globalAlpha = style.alpha;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = Math.max(1.2, size * style.width * thickness);
      ctx.stroke();
      if (layer === 1) {
        const runOf = ({ inkAfter }: WrittenStroke) =>
          inkAfter / (size * 2) + bleed;
        drawDrips(pen, strokes, gouged, runOf, size * 0.045 * thickness);
      }
    }
    ctx.restore();
  });
}

/**
 * The drips of the finished strokes, each run `runOf` of its way, `half` its
 * half-width where it leaves the stroke; it thins as it runs.
 */
function drawDrips(
  pen: Pen,
  strokes: readonly WrittenStroke[],
  gouged: readonly Gouged[],
  runOf: (stroke: WrittenStroke) => number,
  half: number,
): void {
  const { ctx } = pen;
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = LETTERING_PALETTE.drip;
  ctx.beginPath();
  for (const [n, stroke] of strokes.entries()) {
    const drip = gouged[n]?.drip;
    if (!drip || stroke.done < 1) continue;
    const run = Math.min(1, runOf(stroke));
    if (run <= 0) continue;
    const [x, y] = drip.pool;
    const length = drip.dripLength * run;
    const end = y + length;
    const bend = drip.sway * run;
    ctx.moveTo(x - half, y);
    ctx.quadraticCurveTo(
      x + bend - half * 0.5,
      y + length / 2,
      x - half * 0.4,
      end,
    );
    ctx.lineTo(x + half * 0.4, end);
    ctx.quadraticCurveTo(x + bend + half * 0.5, y + length / 2, x + half, y);
    ctx.closePath();
    // The bead the drip gathers into at its end.
    ctx.moveTo(x + half * 0.7, end);
    ctx.arc(x, end, half * 0.7, 0, Math.PI * 2);
  }
  ctx.fill();
}
