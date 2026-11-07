/** A closed polyline, its last point joined back to its first, never repeated. */
export type Ring = Array<[number, number]>;

/** A Douglas–Peucker pass's tolerance, in the ring's units. */
export type Simplified = { tolerance: number };

/** The shoelace area: positive when the ring turns from +x towards +y. */
export function signedArea(ring: Ring): number {
  let twice = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i] ?? [0, 0];
    const [x1, y1] = ring[(i + 1) % ring.length] ?? [0, 0];
    twice += x0 * y1 - x1 * y0;
  }
  return twice / 2;
}

function distanceToChord(
  [px, py]: [number, number],
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
}

/** Douglas–Peucker over the open run `points[from..to]`, both ends kept. */
function keepAlong(
  points: Ring,
  from: number,
  to: number,
  tolerance: number,
  kept: boolean[],
): void {
  const a = points[from];
  const b = points[to];
  if (!a || !b || to - from < 2) return;
  let farthest = -1;
  let worst = tolerance;
  for (let i = from + 1; i < to; i++) {
    const point = points[i];
    if (!point) continue;
    const distance = distanceToChord(point, a, b);
    if (distance > worst) {
      worst = distance;
      farthest = i;
    }
  }
  if (farthest < 0) return;
  kept[farthest] = true;
  keepAlong(points, from, farthest, tolerance, kept);
  keepAlong(points, farthest, to, tolerance, kept);
}

/**
 * Douglas–Peucker on a closed ring: split at its first point and the point
 * farthest from it, each half simplified as an open run. Keeps the ring's
 * orientation, and at least a triangle.
 */
export function simplify(ring: Ring, tolerance: number): Ring {
  if (ring.length <= 3) return ring;
  const [start] = ring;
  if (!start) return ring;
  let far = 0;
  let farthest = 0;
  for (const [i, [x, y]] of ring.entries()) {
    const distance = Math.hypot(x - start[0], y - start[1]);
    if (distance > farthest) {
      farthest = distance;
      far = i;
    }
  }
  const closed: Ring = [...ring, start];
  const kept = closed.map(() => false);
  kept[0] = true;
  kept[far] = true;
  keepAlong(closed, 0, far, tolerance, kept);
  keepAlong(closed, far, closed.length - 1, tolerance, kept);
  const simplified = ring.filter((_, i) => kept[i] === true);
  if (simplified.length >= 3) return simplified;
  return simplify(ring, tolerance / 2);
}
