import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';

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

const PETAL_STEPS = 10;

/** `point` at `steps + 1` evenly spaced values from `from` to `to`, both ends included. */
export function sample<Sampled>(
  from: number,
  to: number,
  steps: number,
  point: (value: number) => Sampled,
): Sampled[] {
  return Array.from({ length: steps + 1 }, (_, step) =>
    point(from + ((to - from) * step) / steps),
  );
}

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

/** One round of Chaikin's corner cutting over a closed outline. */
function cutCorners(outline: readonly Point[]): Point[] {
  return outline.flatMap((point, index) => {
    const next = outline[(index + 1) % outline.length] ?? point;
    return [
      { x: point.x * 0.75 + next.x * 0.25, y: point.y * 0.75 + next.y * 0.25 },
      { x: point.x * 0.25 + next.x * 0.75, y: point.y * 0.25 + next.y * 0.75 },
    ];
  });
}

/**
 * A closed outline with its corners cut `rounds` times, which rounds a vertex
 * into a short curve and leaves smooth stretches be.
 */
export function rounded(points: readonly Point[], rounds: number): Point[] {
  let outline = [...points];
  for (let round = 0; round < rounds; round++) outline = cutCorners(outline);
  return outline;
}
