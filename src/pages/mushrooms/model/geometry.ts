/** A position, in whatever unit the module holding it works in. */
export type Point = { x: number; y: number };
export type Circle = Point & { r: number };

/**
 * A stem that rises upright and bends over: how far its top stands sideways
 * from above its foot, as a fraction of its height.
 */
export type Bent = { stemBend: number };

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

/** Whether `point` is inside the closed `polygon`, by the even-odd rule. */
export function containsPoint(
  polygon: readonly Point[],
  { x, y }: Point,
): boolean {
  let inside = false;
  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length] ?? a;
    if (a.y > y === b.y > y) continue;
    if (x < a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y)) inside = !inside;
  }
  return inside;
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
