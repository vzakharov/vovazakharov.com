import * as Phaser from 'phaser';

import { ellipse, type Point, sample } from '../../model/geometry';
import type { Light } from '../../model/light';
import {
  inkFor,
  type Lighted,
  type Lighting,
  taperedLine,
  weightedOutline,
} from './ink';
import { castShadow, type ShadowLayer } from './mushroom-light';
import { PALETTE } from './palette';

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

/** Whether two points of an outline stand apart, rather than being one point twice. */
function apart(a: Point, b: Point): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) > 1e-6;
}

/**
 * `points`' closed outline, stroked. Phaser joins a closed path's last
 * segment to its first only when the path closes itself, and leaves the
 * joins either side of a zero-length segment open, so a point repeating the
 * one before it (the first repeated at the end included) is dropped before
 * stroking: the first point is joined as every other is.
 */
export function strokeShape(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  const distinct = points.filter((point, index) => {
    const before = points[index - 1];
    return !before || apart(point, before);
  });
  const [first] = distinct;
  const last = distinct.at(-1);
  const closing =
    first !== undefined &&
    last !== undefined &&
    distinct.length > 1 &&
    !apart(first, last);
  graphics.strokePoints(
    vectors(closing ? distinct.slice(0, -1) : distinct),
    false,
    true,
  );
}

/**
 * `points`' ink line in `colour`, `base` wide, heavier on the side turned
 * from the light (`weightedOutline`): painted before the shape's fill, which
 * covers all of it but the edge.
 */
export function inkUnder(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
  colour: number,
  base: number,
  { toward, hairline }: Lighting,
): void {
  graphics.fillStyle(colour);
  fillShape(graphics, weightedOutline(points, base, toward, hairline));
}

/** `points` filled in `fill` through `tone`, over the ink of the fill as toned (`inkFor`). */
export function inkedFill(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
  fill: number,
  base: number,
  lighting: Lighting,
  tone: (colour: number) => number = (colour) => colour,
): void {
  inkUnder(graphics, points, inkFor(tone(fill)), base, lighting);
  graphics.fillStyle(tone(fill));
  fillShape(graphics, points);
}

/** A disc of `fill` round `centre` over its own ink (`inkFor`). */
export function inkedDisc(
  graphics: Phaser.GameObjects.Graphics,
  centre: Point,
  r: number,
  fill: number,
  base: number,
  lighting: Lighting,
): void {
  inkUnder(graphics, ellipse(centre, r), inkFor(fill), base, lighting);
  graphics.fillStyle(fill);
  graphics.fillCircle(centre.x, centre.y, r);
}

/** An ink stroke through `points`, `from` wide at the first and tapering to `to` at the last, never under a hairline. */
export function strokeTapered(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
  widths: readonly [number, number],
  { hairline }: Pick<Lighting, 'hairline'>,
): void {
  fillShape(graphics, taperedLine(points, widths, hairline));
}

/**
 * The shadow a thing standing on the graphics' own position casts on the
 * ground (`castShadow`), painted.
 */
export function paintCastShadow(
  graphics: Phaser.GameObjects.Graphics,
  size: readonly [number, number],
  light: Light,
): void {
  paintShadow(graphics, castShadow(size, light));
}

/** A cast shadow's layers, round the graphics' own position. */
export function paintShadow(
  graphics: Phaser.GameObjects.Graphics,
  layers: readonly ShadowLayer[],
): void {
  for (const { x, across, tall, alpha } of layers) {
    graphics.fillStyle(PALETTE.shadowCool, alpha);
    graphics.fillEllipse(x, 0, across, tall);
  }
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

/** An ellipse's edge round `centre` from angle `from` to `to`, y down. */
export function ovalArc(
  centre: Point,
  [rx, ry]: readonly [number, number],
  [from, to]: readonly [number, number],
): Point[] {
  return sample(from, to, 12, (angle) => ({
    x: centre.x + rx * Math.cos(angle),
    y: centre.y + ry * Math.sin(angle),
  }));
}

/**
 * From a piece's own frame to the canvas. A window's frame is the square it
 * is drawn inside, side 1 round its middle; a door's is in door widths, its
 * sill's middle at the origin; both y up.
 */
export type Place = (point: Point) => Point;
/** How a painter inks, tints and lights: the ink line in pixels, the haze a colour takes, and the light it is drawn in. */
export type Brush = Lighted & {
  ink: number;
  tone: (colour: number) => number;
};

export function box(left: number, bottom: number, right: number, top: number) {
  return [
    { x: left, y: bottom },
    { x: right, y: bottom },
    { x: right, y: top },
    { x: left, y: top },
  ];
}
