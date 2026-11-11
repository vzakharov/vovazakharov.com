import {
  LATIN,
  placedAt,
  type Point,
  type Polyline,
  type Script,
  smooth,
  strokes,
} from '@/cube/shared/lettering';

const TURN = 2 * Math.PI;

/** A straight-sided stroke through `points`. */
export const path = (...points: Point[]): Polyline => points;

/** A stroke curving past `points`, its control polygon; a loop when it closes. */
export const curve = (...points: Point[]): Polyline => smooth(points);

/** A closed curve round `points`. */
export const blob = (...points: Point[]): Polyline => {
  const [first] = points;
  return first === undefined ? [] : smooth([...points, first]);
};

/**
 * The arc of an ellipse centred `(cx, cy)` with radii `rx` and `ry`, from
 * `from` to `to` in turns anticlockwise from the east.
 */
export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
): Polyline {
  const steps = Math.max(4, Math.ceil(Math.abs(to - from) * 28));
  return Array.from({ length: steps + 1 }, (_, step): Point => {
    const angle = (from + ((to - from) * step) / steps) * TURN;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

/** A whole ellipse; a circle when `ry` is left out. */
export const oval = (cx: number, cy: number, rx: number, ry = rx): Polyline =>
  arc(cx, cy, rx, ry, 0, 1);

/** A circle of `radius` drawn as `count` dashes. */
export const dashes = (
  cx: number,
  cy: number,
  radius: number,
  count: number,
): Polyline[] =>
  Array.from({ length: count }, (_, dash) =>
    arc(cx, cy, radius, radius, dash / count, (dash + 0.5) / count),
  );

/** A point `radius` out from `(cx, cy)` at `at` turns. */
export const around = (
  cx: number,
  cy: number,
  radius: number,
  at: number,
): Point => [
  cx + radius * Math.cos(at * TURN),
  cy + radius * Math.sin(at * TURN),
];

/** `count` strokes pointing outward from `inner` to `outer` round a centre. */
export const rays = (
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  count: number,
  phase = 0,
): Polyline[] =>
  Array.from({ length: count }, (_, ray) => {
    const at = phase + ray / count;
    return [around(cx, cy, inner, at), around(cx, cy, outer, at)];
  });

/** A regular polygon of `sides` corners, the first at `phase` turns, closed. */
export const polygon = (
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  phase = 0,
): Polyline =>
  Array.from({ length: sides + 1 }, (_, corner) =>
    around(cx, cy, radius, phase + corner / sides),
  );

/** A dot the nib makes: a stroke as short as it is wide. */
export const speck = (x: number, y: number, size = 0.012): Polyline => [
  [x, y],
  [x, y + size],
];

/**
 * A wave from `from` to `to`, `cycles` whole waves long and `height` either
 * side of the straight line between them.
 */
export function wave(
  from: Point,
  to: Point,
  cycles: number,
  height: number,
): Polyline {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const long = Math.hypot(dx, dy) || 1;
  const steps = Math.ceil(cycles * 16);
  return Array.from({ length: steps + 1 }, (_, step): Point => {
    const along = step / steps;
    const off = height * Math.sin(along * cycles * TURN);
    return [
      from[0] + dx * along - (dy / long) * off,
      from[1] + dy * along + (dx / long) * off,
    ];
  });
}

/** The golden angle, in turns: `scatter` spreads its points by it. */
const GOLDEN = 0.381_966;

/**
 * `count` points spread evenly over a disc of `radius` round `(cx, cy)`, the
 * same every time; `bunch` above 1 crowds them toward the middle.
 */
export const scatter = (
  cx: number,
  cy: number,
  radius: number,
  count: number,
  bunch = 1,
): Point[] =>
  Array.from({ length: count }, (_, at) =>
    around(cx, cy, radius * ((at + 0.5) / count) ** (bunch / 2), at * GOLDEN),
  );

/**
 * `text` in capitals `size` tall, its baseline's left end at `(x, y)`: plain
 * ones unless a `script` is named.
 */
export const lettered = (
  text: string,
  x: number,
  y: number,
  size: number,
  script: Script = LATIN,
): Polyline[] => placedAt(strokes(text, script), size, x, y);
