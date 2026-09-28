import * as Phaser from 'phaser';

import { ellipse, type Point, sample } from '../../model/geometry';
import type { Light } from '../../model/light';
import {
  inkFor,
  type Lighted,
  type Lighting,
  shadowFall,
  taperedLine,
  weightedOutline,
} from './ink';
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

export function strokeShape(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  graphics.strokePoints(vectors(points), true, true);
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

/** A cast shadow's soft outer shade, its core and its contact at the foot: each one's size, as a share of the shadow's, and alpha. */
const SHADOW_LAYERS = [
  { across: 1.3, tall: 1.3, alpha: 0.12, falls: true },
  { across: 0.8, tall: 0.8, alpha: 0.2, falls: true },
  { across: 0.25, tall: 0.6, alpha: 0.3, falls: false },
] as const;

/**
 * The shadow a thing standing on the graphics' own position casts on the
 * ground, `across` by `tall`: fallen away from the sun, soft at its edge,
 * darkest at the foot.
 */
export function paintCastShadow(
  graphics: Phaser.GameObjects.Graphics,
  [across, tall]: readonly [number, number],
  { toward }: Light,
): void {
  const fall = shadowFall(toward, across);
  for (const layer of SHADOW_LAYERS) {
    graphics.fillStyle(PALETTE.shadowCool, layer.alpha);
    graphics.fillEllipse(
      layer.falls ? fall : 0,
      0,
      across * layer.across,
      tall * layer.tall,
    );
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
