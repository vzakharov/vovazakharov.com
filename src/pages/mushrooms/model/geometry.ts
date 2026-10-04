/** A position, in whatever unit the module holding it works in. */
export type Point = { x: number; y: number };
export type Circle = Point & { r: number };
/** Where a thing's top edge stands, in its module's units. */
export type Topped = { top: number };
/** Where a thing's left edge stands, in its module's units. */
export type Lefted = { left: number };

export type Wide = { across: number };
/** How tall a thing stands, in its module's units. */
export type Tall = { tall: number };
/** How far a thing leans from upright, in its module's units. */
export type Leaning = { lean: number };
/** How far a thing reaches, in its module's units. */
export type Reach = { reach: number };

export type WithMiddle = { middle: Point };
/** Where a box's top-left corner stands. */
export type Cornered = Topped & Lefted;
/** How big a thing stands on screen, in its points' units: the unit its shape is drawn in. */
export type Scaled = { size: number };
/** How far a thing is turned from upright as it is drawn, in radians. */
export type Turned = { turn: number };

/**
 * A stem that rises upright and bends over: how far its top stands sideways
 * from above its foot, as a fraction of its height.
 */
export type Bent = { stemBend: number };

/** `angle` brought round into `[−π, π)`. */
export const wrap = (angle: number) =>
  angle - Math.PI * 2 * Math.round(angle / (Math.PI * 2));

/** The point `distance` from `from` at plane azimuth `azimuth`, turned from its `+y` toward its `+x`. */
export function alongAzimuth(
  from: Point,
  azimuth: number,
  distance: number,
): Point {
  return {
    x: from.x + distance * Math.sin(azimuth),
    y: from.y + distance * Math.cos(azimuth),
  };
}

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

/** How many chords a round shape's curve is drawn with. */
export const ROUND_STEPS = 28;

/** An ellipse round `(x, y)` with half-axes `rx` and `ry`, `steps` chords round: a circle when `ry` is left out. */
export function ellipse(
  { x, y }: Point,
  rx: number,
  ry: number = rx,
  steps = ROUND_STEPS,
): Point[] {
  return sample(0, Math.PI * 2, steps, (angle) => ({
    x: x + rx * Math.cos(angle),
    y: y + ry * Math.sin(angle),
  })).slice(0, -1);
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

/** An axis-aligned box round some points: `top` their least y and `bottom` their greatest, as on a canvas. */
export type Box = Record<'left' | 'right' | 'top' | 'bottom', number>;

export function boxAround(points: readonly Point[]): Box {
  const box = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
  };
  for (const { x, y } of points) {
    box.left = Math.min(box.left, x);
    box.right = Math.max(box.right, x);
    box.top = Math.min(box.top, y);
    box.bottom = Math.max(box.bottom, y);
  }
  return box;
}

/** Whether two boxes share any point. */
export const boxesMeet = (a: Box, b: Box) =>
  a.left <= b.right &&
  b.left <= a.right &&
  a.top <= b.bottom &&
  b.top <= a.bottom;

/** Whether `point` is inside the closed `polygon`, by the even-odd rule. */
export function containsPoint(
  polygon: readonly Point[],
  { x, y }: Point,
): boolean {
  let inside = false;
  // Each edge from the point before `b`, the last closing onto the first.
  let a = polygon.at(-1);
  for (const b of polygon) {
    const crosses =
      a !== undefined &&
      a.y > y !== b.y > y &&
      x < a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y);
    if (crosses) inside = !inside;
    a = b;
  }
  return inside;
}

/** How far apart `a` and `b` stand. */
export const distanceBetween = (a: Point, b: Point) =>
  Math.hypot(b.x - a.x, b.y - a.y);

/** How far `point` is from the nearest point of the segment from `a` to `b`. */
export function distanceToSegment(a: Point, b: Point, point: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const along = dx * dx + dy * dy;
  const t =
    along === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / along),
        );
  return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy);
}

/** Where the segment from `a` to `b` crosses the one from `c` to `d`; `undefined` where they only touch or miss. */
export function segmentCrossing(
  a: Point,
  b: Point,
  c: Point,
  d: Point,
): Point | undefined {
  const side = (p: Point, q: Point, r: Point) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const [onAbC, onAbD] = [side(a, b, c), side(a, b, d)];
  if (side(c, d, a) * side(c, d, b) >= 0 || onAbC * onAbD >= 0) {
    return undefined;
  }
  const t = onAbC / (onAbC - onAbD);
  return { x: c.x + (d.x - c.x) * t, y: c.y + (d.y - c.y) * t };
}

/** How far `point` is from the nearest edge of the closed `outline`. */
export function distanceToEdge(
  outline: readonly Point[],
  point: Point,
): number {
  return Math.min(
    ...outline.map((a, index) =>
      distanceToSegment(a, outline[(index + 1) % outline.length] ?? a, point),
    ),
  );
}

/**
 * Points `margin` outside the closed, anticlockwise `outline`: off each vertex
 * along the outward normal of either edge that meets there. Were they all
 * inside a smooth-edged shape, so would the outline be, `margin` in from its edge.
 */
export function outside(outline: readonly Point[], margin: number): Point[] {
  return outline.flatMap((point, index) => {
    const before = outline.at(index - 1) ?? point;
    const after = outline[(index + 1) % outline.length] ?? point;
    return [
      [before, point],
      [point, after],
    ].map(([a = point, b = point]) => {
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      return {
        x: point.x + ((b.y - a.y) / length) * margin,
        y: point.y - ((b.x - a.x) / length) * margin,
      };
    });
  });
}

/**
 * A point in a creature's own canvas frame (y down) where it stands at `foot`
 * turned by `turn` about it: the rotation Phaser gives a game object, a
 * positive `turn` going clockwise on screen.
 */
export function placedAt(foot: Point, turn: number, { x, y }: Point): Point {
  return {
    x: foot.x + x * Math.cos(turn) - y * Math.sin(turn),
    y: foot.y + x * Math.sin(turn) + y * Math.cos(turn),
  };
}

/** Twice the signed area of a closed outline: above 0 when it runs anticlockwise with y up. */
function signedArea(outline: readonly Point[]): number {
  let sum = 0;
  for (const [index, a] of outline.entries()) {
    const b = outline[(index + 1) % outline.length] ?? a;
    sum += a.x * b.y - b.x * a.y;
  }
  return sum;
}

/**
 * The part of the closed `subject` inside the convex closed `clip`, by
 * Sutherland–Hodgman: what shows of a shape through an opening. Either may
 * run either way round; empty when they do not meet.
 */
export function clipToConvex(
  subject: readonly Point[],
  clip: readonly Point[],
): Point[] {
  const turn = Math.sign(signedArea(clip));
  let kept = [...subject];
  for (const [index, a] of clip.entries()) {
    const b = clip[(index + 1) % clip.length] ?? a;
    const side = ({ x, y }: Point) =>
      turn * ((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x));
    const input = kept;
    kept = [];
    for (const [at, point] of input.entries()) {
      const next = input[(at + 1) % input.length] ?? point;
      const here = side(point);
      const there = side(next);
      if (here >= 0) kept.push(point);
      if (here >= 0 !== there >= 0) {
        const t = here / (here - there);
        kept.push({
          x: point.x + (next.x - point.x) * t,
          y: point.y + (next.y - point.y) * t,
        });
      }
    }
  }
  return kept;
}
