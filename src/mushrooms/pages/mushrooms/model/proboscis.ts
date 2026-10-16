/**
 * The proboscis as a line, in the units and frame of `insect-outline.ts`: the
 * body's middle at the origin, the head toward -y. Drinking, it reaches from
 * the head down beside the body into the flower's centre, wherever that lies
 * in the body's frame, so the tube is seen going into the flower.
 */

import type { Point } from './geometry';
import type { InsectGenes } from './insect-genes';
import { SIP_DEPTH } from './insect-motion';
import { headOf, type Side } from './insect-outline';

/** How far round the tube coils curled up, in radians, and its length then, as a share of the body's. */
const COIL = Math.PI * 3.5;
const CURLED = 0.3;
/**
 * How far out to its side the tube bows on its way down, and how high over
 * the flower's centre it turns down into it, in units of the insect's size;
 * how much further it bows at the bottom of a sip.
 */
const BOW = 0.14;
const DROP = 0.22;
const SIP_BOW = 0.6;
/** Where round the head the tube leaves it, in radians off straight ahead toward its side. */
const MOUTH = 0.8;
/** How many segments the line is drawn with. */
export const PROBOSCIS_STEPS = 24;

/**
 * Where `nectar`, a point on screen, lies in the frame of a body whose middle
 * is drawn at `middle`, turned `turn` radians clockwise from up the screen,
 * `size` to its unit.
 */
export function inBody(
  nectar: Point,
  middle: Point,
  turn: number,
  size: number,
): Point {
  const dx = (nectar.x - middle.x) / size;
  const dy = (nectar.y - middle.y) / size;
  return {
    x: dx * Math.cos(turn) + dy * Math.sin(turn),
    y: -dx * Math.sin(turn) + dy * Math.cos(turn),
  };
}

function cubic(
  [p0, p1, p2, p3]: readonly [Point, Point, Point, Point],
  u: number,
): Point {
  const v = 1 - u;
  const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/**
 * The proboscis at `reach` (`proboscis` in `insect-motion.ts`), as a line from
 * the head, bowing out to `side`. Out to `1 - SIP_DEPTH` it unrolls from a
 * tight coil at the head, like a party blower; past that its tip rests on
 * `nectar`, where the flower's centre lies in the body's frame, and a sip
 * only flexes its bow, so the tip never leaves the flower while it drinks.
 */
export function proboscisLine(
  genes: Pick<InsectGenes, 'bodyLength' | 'bodyWidth'>,
  reach: number,
  nectar: Point,
  side: Side,
): Point[] {
  const head = headOf(genes);
  const unrolled = Math.min(1, reach / (1 - SIP_DEPTH));
  const flex = Math.min(1, Math.max(0, (1 - reach) / SIP_DEPTH));
  const bow = BOW * (1 + SIP_BOW * flex);
  const mouth = {
    x: head.x + side * head.r * Math.sin(MOUTH),
    y: head.y - head.r * Math.cos(MOUTH),
  };
  const out = [
    mouth,
    { ...mouth, x: mouth.x + side * bow },
    { x: nectar.x + side * bow, y: nectar.y - DROP },
    nectar,
  ] as const;
  const drawn = Array.from({ length: PROBOSCIS_STEPS + 1 }, (_, index) =>
    cubic(out, index / PROBOSCIS_STEPS),
  );
  if (unrolled >= 1) return drawn;
  // Each segment keeps its length and turn off the drawn one, shortened
  // toward the coil's length and curling ever tighter toward the tip.
  const length = drawn
    .slice(1)
    .reduce(
      (sum, point, index) =>
        sum +
        Math.hypot(
          point.x - (drawn[index]?.x ?? 0),
          point.y - (drawn[index]?.y ?? 0),
        ),
      0,
    );
  const curled = Math.min(1, (CURLED * genes.bodyLength) / length);
  const shrink = curled + (1 - curled) * unrolled;
  let point = mouth;
  const line = [point];
  for (const [index, next] of drawn.slice(1).entries()) {
    const last = drawn[index] ?? mouth;
    const along = (index + 1) / PROBOSCIS_STEPS;
    const angle =
      Math.atan2(next.y - last.y, next.x - last.x) +
      side * (1 - unrolled) * COIL * along ** 2;
    const step = Math.hypot(next.x - last.x, next.y - last.y) * shrink;
    point = {
      x: point.x + step * Math.cos(angle),
      y: point.y + step * Math.sin(angle),
    };
    line.push(point);
  }
  return line;
}
