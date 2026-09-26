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
