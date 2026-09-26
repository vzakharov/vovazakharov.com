import * as Phaser from 'phaser';

import { type Point, sample } from '../../model/geometry';

/** Phaser's typings ask for its own vectors where any `{ x, y }` would do. */
function vectors(points: readonly Point[]): Phaser.Math.Vector2[] {
  return points.map(({ x, y }) => new Phaser.Math.Vector2(x, y));
}

export function fillShape(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  graphics.fillPoints(vectors(points), true);
}

export function strokeShape(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  graphics.strokePoints(vectors(points), true, true);
}

/** A line through `points`, left open. */
export function strokeLine(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  graphics.strokePoints(vectors(points), false);
}

const PETAL_STEPS = 10;

/**
 * A petal, or a sun's ray: a pointed lens from `from` to `to` out from
 * `centre` along `angle`, widest a third of the way out: the stroke rosettes
 * are built from, rays and petals alike.
 */
export function petal(
  centre: Point,
  angle: number,
  [from, to]: readonly [number, number],
  halfWidth: number,
): Point[] {
  const along = { x: Math.cos(angle), y: Math.sin(angle) };
  const across = { x: -along.y, y: along.x };
  const at = (t: number, side: number): Point => {
    const reach = from + (to - from) * t;
    const width = side * halfWidth * Math.sin(Math.PI * t ** 0.75);
    return {
      x: centre.x + along.x * reach + across.x * width,
      y: centre.y + along.y * reach + across.y * width,
    };
  };
  const steps = sample(0, 1, PETAL_STEPS, (t) => t);
  return [
    ...steps.map((t) => at(t, 1)),
    ...steps.toReversed().map((t) => at(t, -1)),
  ];
}

/**
 * A crescent along `arc`, its inner edge pulled toward `towards` by up to
 * `width` and tapering to nothing at both ends, so no straight edge closes it.
 */
export function crescent(
  arc: readonly Point[],
  towards: Point,
  width: number,
): Point[] {
  const last = arc.length - 1;
  const inner = arc.map((point, index) => {
    const before = arc[Math.max(0, index - 1)] ?? point;
    const after = arc[Math.min(last, index + 1)] ?? point;
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
    let normal = {
      x: -(after.y - before.y) / length,
      y: (after.x - before.x) / length,
    };
    if (
      normal.x * (towards.x - point.x) + normal.y * (towards.y - point.y) <
      0
    ) {
      normal = { x: -normal.x, y: -normal.y };
    }
    const reach = width * Math.sin((Math.PI * index) / (last || 1));
    return { x: point.x + normal.x * reach, y: point.y + normal.y * reach };
  });
  return [...arc, ...inner.toReversed()];
}

/**
 * From a piece's own frame to the canvas. A window's frame is the square it
 * is drawn inside, side 1 round its middle; a door's is in door widths, its
 * sill's middle at the origin; both y up.
 */
export type Place = (point: Point) => Point;
/** How a painter inks and tints: the ink line in pixels, and the haze a colour takes. */
export type Brush = { ink: number; tone: (colour: number) => number };

const ROUND_STEPS = 28;

export function ellipse({ x, y }: Point, rx: number, ry: number = rx): Point[] {
  return sample(0, Math.PI * 2, ROUND_STEPS, (angle) => ({
    x: x + rx * Math.cos(angle),
    y: y + ry * Math.sin(angle),
  })).slice(0, -1);
}

export function box(left: number, bottom: number, right: number, top: number) {
  return [
    { x: left, y: bottom },
    { x: right, y: bottom },
    { x: right, y: top },
    { x: left, y: top },
  ];
}

/**
 * A shape `width` across and `height` tall, its bottom's middle `bottom` up,
 * with a round top: a doorway, a tall window.
 */
export function arch(width: number, height: number, bottom = 0): Point[] {
  const half = width / 2;
  const spring = bottom + height - half;
  return [
    { x: -half, y: bottom },
    { x: half, y: bottom },
    ...sample(0, Math.PI, ROUND_STEPS, (angle) => ({
      x: half * Math.cos(angle),
      y: spring + half * Math.sin(angle),
    })),
  ];
}
