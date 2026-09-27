/**
 * The outlines an insect is painted with, seen from above: in units of its
 * size, its body's middle at the origin, the head toward -y and y down, as
 * the canvas has it. The painter and the layout both read them, so the
 * wingspan the layout sizes an insect by is the one painted.
 */

import { distanceToEdge, ellipse, type Point, sample } from './geometry';
import type {
  ButterflyGenes,
  Buzzing,
  InsectBody,
  InsectGenes,
  Wing,
} from './insect-genes';

/** The wings a painter lays down together, the hind pair under the fore. */
export const WING_PAIRS = ['hind', 'fore'] as const;
export type WingPair = (typeof WING_PAIRS)[number];

/**
 * Each pair's axis off the body, in radians from +x with y down: the fore
 * wings up and out, the hind wings down and out.
 */
const WING_ANGLE = { fore: -0.5, hind: 0.9 } as const;
/** Where each pair's root sits down the body, as a share of its length from the middle. */
const WING_ROOT = { fore: -0.2, hind: -0.04 } as const;
/**
 * How far out along a wing it is broadest, the round tip's bluntness and the
 * pointed one's, and how broad its root stays on the body, as a share of its
 * breadth, so the wing grows out of the thorax rather than off a point.
 */
const WING_SWELL = 1.5;
const ROUND_TIP = 0.35;
const POINTED_TIP = 1.1;
const ROOT_BREADTH = 0.45;
/** How far a wing sweeps back off its axis at the middle, as a share of its breadth. */
const WING_SWEEP = 0.18;
const WING_STEPS = 24;
/** How much of a wing's reach and breadth its base colour takes, the rest its edge band. */
export const INNER_REACH = 0.88;
export const INNER_BREADTH = 0.8;

/** Which side of the body: -1 left, 1 right. */
export type Side = -1 | 1;

type Axis = { root: Point; along: Point; across: Point };

/** The genes the body's outlines and the wings' roots are drawn from. */
type BodyGenes = Pick<InsectBody, 'bodyLength' | 'bodyWidth'>;

/**
 * A wing's axis off `root`, the right side's root mirrored for the left, at
 * `angle` in radians from +x with y down, mirrored the same way.
 */
function axisAt(root: Point, angle: number, side: Side): Axis {
  const along = { x: side * Math.cos(angle), y: Math.sin(angle) };
  // Of the two ways across the axis, the one toward the tail: every wing sweeps back.
  const turned = { x: -along.y, y: along.x };
  const across = turned.y < 0 ? { x: -turned.x, y: -turned.y } : turned;
  return { root: { ...root, x: side * root.x }, along, across };
}

function axisOf(genes: BodyGenes, pair: WingPair, side: Side): Axis {
  const root = {
    x: genes.bodyWidth * 0.3,
    y: genes.bodyLength * WING_ROOT[pair],
  };
  return axisAt(root, WING_ANGLE[pair], side);
}

/** How far to either side of its axis a wing reaches, `u` of the way out. */
function halfWidth({ breadth, tip }: Wing, u: number): number {
  const bluntness = ROUND_TIP + (POINTED_TIP - ROUND_TIP) * tip;
  return (
    (breadth / 2) *
    (Math.sin(Math.PI * u ** WING_SWELL) ** bluntness +
      ROOT_BREADTH * (1 - u) ** 2)
  );
}

/** A point `u` of the way out along a wing and `v` of its breadth across its axis. */
function onWing(axis: Axis, wing: Wing, u: number, v: number): Point {
  const reach = u * wing.length;
  const off = v + wing.breadth * WING_SWEEP * Math.sin(Math.PI * u);
  return {
    x: axis.root.x + axis.along.x * reach + axis.across.x * off,
    y: axis.root.y + axis.along.y * reach + axis.across.y * off,
  };
}

/**
 * One wing's closed outline, `scale` of it in reach and breadth from the same
 * root: 1 for the whole wing, `INNER_*` for the base colour inside its band.
 */
export function wingOutline(
  genes: ButterflyGenes,
  pair: WingPair,
  side: Side,
  [reach, breadth]: readonly [number, number] = [1, 1],
): Point[] {
  const own = genes[pair];
  return outlineAlong(axisOf(genes, pair, side), {
    ...own,
    length: own.length * reach,
    breadth: own.breadth * breadth,
  });
}

function outlineAlong(axis: Axis, wing: Wing): Point[] {
  const out = sample(0, 1, WING_STEPS, (u) => u);
  return [
    ...out.map((u) => onWing(axis, wing, u, halfWidth(wing, u))),
    ...out
      .toReversed()
      .slice(1, -1)
      .map((u) => onWing(axis, wing, u, -halfWidth(wing, u))),
  ];
}

/**
 * The edge of a wing that faces the tail, root to tip: where its shade
 * falls, the light coming from above.
 */
export function wingTrailingEdge(
  genes: ButterflyGenes,
  pair: WingPair,
  side: Side,
): Point[] {
  const axis = axisOf(genes, pair, side);
  const wing = genes[pair];
  return sample(0, 1, WING_STEPS, (u) =>
    onWing(axis, wing, u, halfWidth(wing, u)),
  );
}

/** The middle of a wing's eye: `eyeAt` of the way out, on its swept axis. */
export function eyeCentre(
  genes: ButterflyGenes,
  pair: WingPair,
  side: Side,
): Point {
  return onWing(axisOf(genes, pair, side), genes[pair], genes.eyeAt, 0);
}

/**
 * How far a wing's eye could reach before it met the wing's edge, as a share
 * of that wing's breadth: the unit the eye rings are measured in.
 */
export function eyeRoom(genes: ButterflyGenes, pair: WingPair): number {
  return (
    distanceToEdge(wingOutline(genes, pair, 1), eyeCentre(genes, pair, 1)) /
    genes[pair].breadth
  );
}

/** Where the abdomen's middle sits down the body, and its half-length, as shares of the body's length. */
export const ABDOMEN = { at: 0.12, half: 0.3 } as const;

/** The body's three parts, head first: head, thorax and abdomen, as closed outlines. */
export function bodyParts(
  genes: BodyGenes,
): [head: Point[], thorax: Point[], abdomen: Point[]] {
  const { bodyLength: length, bodyWidth: width } = genes;
  const { r, ...head } = headOf(genes);
  return [
    ellipse(head, r),
    ellipse({ x: 0, y: -length * 0.2 }, width * 0.62, length * 0.16),
    ellipse({ x: 0, y: length * ABDOMEN.at }, width / 2, length * ABDOMEN.half),
  ];
}

/** The head's middle and radius, which the eyes and antennae start from. */
export function headOf(genes: BodyGenes): Point & { r: number } {
  const r = genes.bodyWidth * 0.62;
  return { x: 0, y: -genes.bodyLength / 2 + r, r };
}

/** One antenna, from the head out and forward, curling at its end where its club sits. */
export function antenna(genes: BodyGenes, side: Side): Point[] {
  const head = headOf(genes);
  const reach = genes.bodyLength * 0.42;
  return sample(0, 1, 10, (t) => ({
    x: side * (head.r * 0.4 + reach * 0.55 * t ** 1.4),
    y: head.y - head.r * 0.6 - reach * Math.sin((t * Math.PI) / 2.2),
  }));
}

/**
 * A fly's or a bee's wing's angle off the body, in radians from +x with y
 * down, laid back over the body at rest and spread up and out in flight.
 */
const BUZZ_WING_ANGLE = { rest: 1.25, open: -0.25 } as const;
/** Where a fly's or a bee's wings root on the body, as shares of its width out and its length down from the middle. */
const BUZZ_ROOT = { out: 0.3, down: -0.18 } as const;

/**
 * One of a fly's or a bee's two wings, `spread` of the way from laid back
 * over the body (0) to open (1): the angle turns, the shape is the same.
 */
export function buzzWing(genes: Buzzing, side: Side, spread: number): Point[] {
  const { rest, open } = BUZZ_WING_ANGLE;
  const root = {
    x: genes.bodyWidth * BUZZ_ROOT.out,
    y: genes.bodyLength * BUZZ_ROOT.down,
  };
  return outlineAlong(
    axisAt(root, rest + (open - rest) * spread, side),
    genes.wing,
  );
}

/**
 * How far an insect reaches from side to side, in units of its size: a
 * butterfly's open wings, or a fly's or a bee's open wings or its body,
 * whichever is wider.
 */
export function wingspan(genes: InsectGenes): number {
  if (genes.kind !== 'butterfly') {
    const xs = buzzWing(genes, 1, 1).map(({ x }) => x);
    return Math.max(genes.bodyWidth / 2, ...xs) * 2;
  }
  const xs = WING_PAIRS.flatMap((pair) =>
    wingOutline(genes, pair, 1).map(({ x }) => x),
  );
  return Math.max(...xs) * 2;
}
