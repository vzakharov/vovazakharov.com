/** A point of a drawing: x rightward, y upward. */
export type Point = readonly [number, number];

/** A pen stroke: the points it passes through, in order. */
export type Polyline = readonly Point[];

const sameSpot = (a: Point, b: Point): boolean =>
  a[0] === b[0] && a[1] === b[1];

/** Whether `line` ends where it began. */
export const isLoop = (line: Polyline): boolean => {
  const first = line[0];
  const last = line.at(-1);
  return line.length > 2 && first !== undefined && last !== undefined
    ? sameSpot(first, last)
    : false;
};

const partWay = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** The two points corner cutting leaves of the side from `a` to `b`. */
const quarters = (a: Point, b: Point): Point[] => [
  partWay(a, b, 0.25),
  partWay(a, b, 0.75),
];

/** One round of corner cutting over the corners `ring` goes round. */
function cutRing(ring: Polyline): Point[] {
  return ring.flatMap((point, at) =>
    quarters(point, ring[(at + 1) % ring.length] ?? point),
  );
}

/** One round of corner cutting that keeps an open line's two ends. */
function cutOpen(line: Polyline): Point[] {
  const cut = line
    .slice(0, -1)
    .flatMap((point, at) => quarters(point, line[at + 1] ?? point));
  const first = line[0];
  const last = line.at(-1);
  if (first === undefined || last === undefined) return [];
  return [first, ...cut.slice(1, -1), last];
}

/**
 * `line` with its corners rounded off: its points are read as the control
 * polygon of a curve that touches each side's middle, cut `rounds` times. An
 * open line keeps both ends; a loop is rounded all the way round and closed.
 */
export function smooth(line: Polyline, rounds = 3): Polyline {
  if (line.length < 3) return line;
  if (isLoop(line)) {
    let ring: Polyline = line.slice(0, -1);
    for (let round = 0; round < rounds; round += 1) ring = cutRing(ring);
    const first = ring[0];
    return first === undefined ? ring : [...ring, first];
  }
  let open = line;
  for (let round = 0; round < rounds; round += 1) open = cutOpen(open);
  return open;
}

/** Every point of `lines` through `move`. */
export const mapped = (
  lines: readonly Polyline[],
  move: (point: Point) => Point,
): Polyline[] => lines.map((line) => line.map((point) => move(point)));

/** `lines` scaled by `by` about the origin, then moved by `(dx, dy)`. */
export const placedAt = (
  lines: readonly Polyline[],
  by: number,
  dx = 0,
  dy = 0,
): Polyline[] => mapped(lines, ([x, y]) => [x * by + dx, y * by + dy]);

/** The box `lines` fill, as `[left, bottom, right, top]`; all zero when empty. */
export function bounds(
  lines: readonly Polyline[],
): readonly [number, number, number, number] {
  const points = lines.flat();
  if (points.length === 0) return [0, 0, 0, 0];
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
