import { noise, reseed } from './noise';
import { INK_PALETTE } from './palette';
import type { Path, Point } from './path';

/** The size every scene is drawn at; the canvas scales it to its pixels. */
export const STAGE = { width: 1280, height: 720 } as const;

// How many times a second the hand-drawn line is redrawn.
const BOIL_RATE = 8;

/**
 * What a drawing function draws with. A scene is a pure function of it: the
 * same `t` paints the same picture, so nothing reads a clock or
 * `Math.random`.
 */
export type Pen = {
  ctx: CanvasRenderingContext2D;
  /** The clip's time in seconds. */
  t: number;
  /** Which redrawing of the line this is: an integer stepping with `t`. */
  boil: number;
};

export const penAt = (ctx: CanvasRenderingContext2D, t: number): Pen => ({
  ctx,
  t,
  boil: Math.floor(t * BOIL_RATE),
});

export type InkStyle = {
  /** Omitted, the shape is an outline alone. */
  fill?: string;
  /** The outline's colour, the palette's ink by default; `null` for none. */
  stroke?: string | null;
  /** The outline's width in stage units. */
  width?: number;
  /** Tells this shape's boil from every other's; shapes sharing one move as one. */
  seed?: number;
  alpha?: number;
  /** How far the boil moves a point, in the path's own units; 0 holds it still. */
  wobble?: number;
};

const DEFAULT_WIDTH = 5;
const DEFAULT_WOBBLE = 1.4;

/** `shape` laid into the context as its current path, each anchor boiled. */
function trace(pen: Pen, shape: Path, seed: number, wobble: number): void {
  const { ctx, boil } = pen;
  const key = reseed(seed, boil);
  let anchor = 0;
  let [startX, startY, startDx, startDy] = [0, 0, 0, 0];
  let [lastDx, lastDy] = [0, 0];
  ctx.beginPath();
  for (const { kind, points } of shape) {
    const end = points.at(-1);
    if (kind === 'Z' || !end) {
      ctx.closePath();
      continue;
    }
    const [x, y] = end;
    // A step ending where its outline began lands on that point's own nudge,
    // so a closed outline meets itself.
    const closes = kind !== 'M' && x === startX && y === startY;
    const dx = closes ? startDx : noise(key, anchor * 2) * wobble;
    const dy = closes ? startDy : noise(key, anchor * 2 + 1) * wobble;
    anchor += 1;
    const [[ax, ay] = [0, 0], [bx, by] = [0, 0]] = points;
    switch (kind) {
      case 'M': {
        [startX, startY, startDx, startDy] = [x, y, dx, dy];
        ctx.moveTo(x + dx, y + dy);
        break;
      }
      case 'L': {
        ctx.lineTo(x + dx, y + dy);
        break;
      }
      case 'Q': {
        ctx.quadraticCurveTo(
          ax + (lastDx + dx) / 2,
          ay + (lastDy + dy) / 2,
          x + dx,
          y + dy,
        );
        break;
      }
      default: {
        // A cubic: each control moves with the anchor it leans on, so the
        // curve keeps its tangents.
        ctx.bezierCurveTo(
          ax + lastDx,
          ay + lastDy,
          bx + dx,
          by + dy,
          x + dx,
          y + dy,
        );
        break;
      }
    }
    [lastDx, lastDy] = [dx, dy];
  }
}

/** Draws `shape`: its fill, then its outline over it, in the boiling line. */
export function ink(pen: Pen, shape: Path, style: InkStyle = {}): void {
  const { ctx } = pen;
  const {
    fill,
    stroke = INK_PALETTE.ink,
    width = DEFAULT_WIDTH,
    seed = 0,
    alpha = 1,
    wobble = DEFAULT_WOBBLE,
  } = style;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  trace(pen, shape, seed, wobble);
  if (fill !== undefined) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke !== null) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
}

/** `points` joined by one smooth line, bending at the midpoint of each pair. */
function throughPoints(points: readonly Point[]): Path {
  const [first, ...rest] = points;
  const last = rest.at(-1);
  if (!first || !last) return [];
  return [
    { kind: 'M', points: [first] },
    ...rest.slice(0, -1).map((point, n) => {
      const [nextX, nextY] = rest[n + 1] ?? point;
      const middle: Point = [(point[0] + nextX) / 2, (point[1] + nextY) / 2];
      return { kind: 'Q', points: [point, middle] } as const;
    }),
    { kind: 'L', points: [last] },
  ];
}

/**
 * An arm, a leg, a cable: a round-ended tube of `color` through `points`
 * (shoulder, elbow, wrist), outlined in ink.
 */
export function limb(
  pen: Pen,
  points: readonly Point[],
  color: string,
  width: number,
  seed = 0,
): void {
  const shape = throughPoints(points);
  ink(pen, shape, { width: width + DEFAULT_WIDTH * 2, seed });
  ink(pen, shape, { stroke: color, width, seed });
}

/** Where a drawing is put: its own origin moved, turned, scaled and mirrored. */
export type Place = {
  x?: number;
  y?: number;
  scale?: number;
  /** Clockwise, in degrees. */
  rot?: number;
  /** Mirrored left to right about its own origin. */
  flip?: boolean;
};

/** Runs `draw` with the context's origin at `place`, and restores it after. */
export function at(pen: Pen, place: Place, draw: () => void): void {
  const { ctx } = pen;
  const { x = 0, y = 0, scale = 1, rot = 0, flip = false } = place;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(flip ? -scale : scale, scale);
  draw();
  ctx.restore();
}
