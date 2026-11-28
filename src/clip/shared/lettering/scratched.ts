import type { Pen, Point } from '@/clip/shared/ink';

import type { Stroke } from './glyph';
import { cut, layOut, type TextLayout, type WrittenStroke } from './layout';
import { LETTERING_PALETTE } from './palette-lettering';
import {
  pressureAt,
  ribbon,
  type Scratch,
  scratchesOf,
  stretchOf,
} from './scratch-marks';
import { boiledPoints, traceOnto } from './trace';
import { writeWith, type Writing } from './write';

// The scratches are a pure function of the layout and the seed, so each is
// worked out once.
const SCRATCHES = new WeakMap<TextLayout, Map<number, Scratch[]>>();

function scratchesFor(
  layout: TextLayout,
  size: number,
  seed: number,
): Scratch[] {
  const bySeed = SCRATCHES.get(layout) ?? new Map<number, Scratch[]>();
  SCRATCHES.set(layout, bySeed);
  const cached = bySeed.get(seed);
  if (cached) return cached;
  const fresh = scratchesOf(layout, size, seed);
  bySeed.set(seed, fresh);
  return fresh;
}

// A scratch's full width at full pressure, in cap heights: what `weight` sets.
const SCRATCH_WEIGHT = 0.05;

/** The shapes of one frame's writing, one list per colour. */
type Marks = {
  smears: Point[][];
  dried: Point[][];
  fresh: Point[][];
  grooves: Point[][];
};

/** `points` slid sideways, up to `aside` by their far end, as a thumb drags. */
function dragged(points: Stroke, aside: number): Point[] {
  const [ax, ay] = points[0] ?? [0, 0];
  const [bx, by] = points.at(-1) ?? [ax, ay];
  const span = Math.hypot(bx - ax, by - ay) || 1;
  const [nx, ny] = [-(by - ay) / span, (bx - ax) / span];
  const last = Math.max(1, points.length - 1);
  return points.map(([x, y], n): Point => {
    const f = (n / last) * aside;
    return [x + nx * f, y + ny * f];
  });
}

function marksOf(
  pen: Pen,
  strokes: readonly WrittenStroke[],
  scratches: readonly Scratch[],
  size: number,
  seed: number,
  half: number,
): Marks {
  const marks: Marks = { smears: [], dried: [], fresh: [], grooves: [] };
  const wobble = size * 0.01;
  // `writtenUpTo` keeps the layout's order from its first stroke, so the
  // n-th written stroke is the layout's n-th.
  for (const [n, { done, glyph }] of strokes.entries()) {
    const scratch = scratches[n];
    if (!scratch) continue;
    const boil = seed + glyph;
    for (const { line, lineLength, stillWet, pressureSeed } of scratch.passes) {
      const reach = lineLength * done;
      const drawn = boiledPoints(pen, cut(line, reach), boil, wobble);
      const outline = ribbon(
        drawn,
        (along) =>
          half * pressureAt(pressureSeed, along, lineLength, reach, size),
      );
      (stillWet ? marks.fresh : marks.dried).push(outline);
    }
    const [first] = scratch.passes;
    if (!first) continue;
    const { line, lineLength } = first;
    for (const [from, to] of scratch.grooves) {
      if (from >= done) continue;
      const groove = stretchOf(
        line,
        from * lineLength,
        Math.min(to, done) * lineLength,
      );
      const drawn = boiledPoints(pen, groove, boil, wobble);
      marks.grooves.push(ribbon(drawn, () => half * 0.3));
    }
    const { smear } = scratch;
    if (smear && smear.stretch[0] < done) {
      const [from, to] = smear.stretch;
      const part = stretchOf(
        line,
        from * lineLength,
        Math.min(to, done) * lineLength,
      );
      const smudge = dragged(
        boiledPoints(pen, part, boil, wobble),
        smear.aside,
      );
      const smudgeLength = (to - from) * lineLength;
      marks.smears.push(
        ribbon(
          smudge,
          (along) =>
            half * 2.2 * Math.sin(Math.PI * Math.min(1, along / smudgeLength)),
        ),
      );
    }
  }
  return marks;
}

/** Fills every outline in `shapes` at once. */
function fillAll(
  ctx: CanvasRenderingContext2D,
  shapes: readonly Point[][],
  color: string,
  alpha: number,
): void {
  ctx.beginPath();
  for (const shape of shapes) {
    traceOnto(ctx, shape);
    ctx.closePath();
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Scratched into wall paint with a fingernail and filled with blood, as with
 * a pencil: each stroke a bundle of two or three thin scratches, pressed
 * unevenly, mostly dried brown with one fresher red, the plaster showing in
 * patches, a thumb's smear on a few, drips off the low end of some verticals.
 * A drip runs as the hand writes on past its stroke, and `bleed` in `[0, 1]`
 * runs every drip further — 1 runs them all the way.
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
    weight = SCRATCH_WEIGHT,
  } = writing;
  const scratches = scratchesFor(layOut(text, writing), size, seed);
  const half = Math.max(0.7, (size * weight) / 2);
  writeWith(pen, text, writing, (strokes) => {
    const { ctx } = pen;
    const marks = marksOf(pen, strokes, scratches, size, seed, half);
    ctx.save();
    fillAll(ctx, marks.smears, LETTERING_PALETTE.smear, 0.38);
    fillAll(ctx, marks.dried, LETTERING_PALETTE.dried, 0.92);
    fillAll(ctx, marks.fresh, LETTERING_PALETTE.fresh, 0.95);
    fillAll(ctx, marks.grooves, LETTERING_PALETTE.groove, 0.45);
    const runOf = ({ inkAfter }: WrittenStroke) =>
      inkAfter / (size * 2) + bleed;
    drawDrips(pen, strokes, scratches, runOf, half * 0.9);
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
  scratches: readonly Scratch[],
  runOf: (stroke: WrittenStroke) => number,
  half: number,
): void {
  const { ctx } = pen;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = LETTERING_PALETTE.drip;
  ctx.beginPath();
  for (const [n, stroke] of strokes.entries()) {
    const drip = scratches[n]?.drip;
    if (!drip || stroke.done < 1) continue;
    const run = Math.min(1, runOf(stroke));
    if (run <= 0) continue;
    const [x, y] = drip.pool;
    const length = drip.dripLength * run;
    const end = y + length;
    const bend = drip.sway * run;
    ctx.moveTo(x - half, y);
    ctx.quadraticCurveTo(
      x + bend - half * 0.4,
      y + length / 2,
      x - half * 0.3,
      end,
    );
    ctx.lineTo(x + half * 0.3, end);
    ctx.quadraticCurveTo(x + bend + half * 0.4, y + length / 2, x + half, y);
    ctx.closePath();
    // The bead the drip gathers into at its end.
    ctx.moveTo(x + half * 0.6, end);
    ctx.arc(x, end, half * 0.6, 0, Math.PI * 2);
  }
  ctx.fill();
}
