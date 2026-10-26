import { type Point, segmentCrossing } from '../../model/geometry';

/**
 * A crescent along `arc`, its inner edge pulled toward `towards` by up to
 * `width` and tapering to nothing at both ends, so no straight edge closes it.
 * Where the arc turns sharper than the reach, the pulled edge would loop back
 * over itself; the loop is cut at its crossing (`untangled`), so the outline
 * never crosses itself — Phaser triangulates every fill afresh each frame, and
 * a crossed outline fills differently from one frame's pose to the next.
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
  return [...arc, ...untangled(inner).toReversed()];
}

/**
 * The open `line` with every loop it makes cut out: from each segment, on
 * from where it crosses the furthest later segment it crosses.
 */
function untangled(line: readonly Point[]): Point[] {
  const [first] = line;
  if (!first) return [];
  const kept = [first];
  let from = first;
  let index = 0;
  while (index < line.length - 1) {
    const to = line[index + 1] ?? from;
    const loop = furthestCrossing(line, index + 2, from, to);
    if (loop) {
      kept.push(loop.at);
      from = loop.at;
      index = loop.index;
    } else {
      kept.push(to);
      from = to;
      index += 1;
    }
  }
  return kept;
}

/** The last segment of `line` from `start` on that the segment from `from` to `to` crosses, and where. */
function furthestCrossing(
  line: readonly Point[],
  start: number,
  from: Point,
  to: Point,
): { index: number; at: Point } | undefined {
  for (let index = line.length - 2; index >= start; index--) {
    const [c, d] = [line[index], line[index + 1]];
    const at = c && d && segmentCrossing(from, to, c, d);
    if (at) return { index, at };
  }
  return undefined;
}
