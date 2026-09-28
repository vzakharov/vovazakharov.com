/**
 * Where the visit's seeded flowers stand, as a pure function of the screen,
 * the visit's seed and the mushrooms it opens with: each jittered off a slot
 * by its own seeded stream, and moved again until it stands where a child
 * sees it — off every foot, its head clear of every control and no more than
 * half hidden by those mushrooms — on the screen and on the screen turned, or
 * left out when it never does on both, so a turn neither shows a flower nor
 * hides one.
 */

import { FLOWER_RANGES } from '../../model/flower-genes';
import {
  type Circle,
  distanceToSegment,
  type Point,
} from '../../model/geometry';
import { between, mulberry32, type Random } from '../../model/random';
import { type ClumpShade, mostShaded } from './clump-shade';
import type { Footing, MeadowLayout } from './layout';

/**
 * The slots the flowers grow around, as a fraction of the width across and of
 * the ground's depth down, the likeliest to show first — some behind the
 * clump's stems, some before it. Each visit jitters every flower off its slot.
 * A flower keeps its index on both, so its slot on a turned screen is the
 * one at its index there.
 */
const FLOWER_SPOTS = {
  landscape: [
    [0.12, 0.35],
    [0.37, 0.22],
    [0.26, 0.72],
    [0.67, 0.28],
    [0.78, 0.74],
    [0.9, 0.42],
    [0.56, 0.88],
  ],
  portrait: [
    [0.14, 0.4],
    [0.86, 0.36],
    [0.36, 0.26],
    [0.3, 0.62],
    [0.78, 0.6],
    [0.52, 0.44],
    [0.84, 0.16],
  ],
} as const;
/**
 * How far a flower strays from its slot, as a fraction of the width and of the
 * ground's depth.
 */
const FLOWER_JITTER = [0.07, 0.12] as const;
/**
 * How far across the width, and down the ground's depth, a flower's foot
 * may stand: on the ground, and its head clear of the screen's sides.
 */
export const FLOWER_ACROSS = [0.05, 0.95] as const;
export const FLOWER_DOWN = [0.12, 0.96] as const;
/** Tries at a spot off the slot before a flower is left out. */
const FLOWER_TRIES = 48;
/** A flower's height, as a share of the clump's size, before depth scales it. */
const FLOWER_SCALE = 0.26;
/**
 * How far round a mushroom's foot, per unit of its size, no flower stands: the
 * foot and its shadow, the one thing Syama drew being two stems standing
 * together.
 */
export const FOOT_CLEARANCE = 0.45;
/** A flower's lean at the breeze's strongest, in radians. */
export const FLOWER_SWAY = 0.09;
/** A flower's head reaches this far from its centre, per unit of its size. */
const HEAD_REACH = FLOWER_RANGES.petalLength[1];
/**
 * How near two flowers' heads may come, as a share of the two heads' reach
 * together, each taken at its widest.
 */
export const FLOWERS_APART = 0.75;
/** The most of a flower's head the mushrooms in front of it may hide. */
export const MOST_SHADED = 0.5;
/** How many points across a flower's smallest head its share hidden is read at. */
const HEAD_STEPS = 7;
/**
 * How many places across its reach a head is read at, from its stem bent
 * farthest left and leant left by the breeze to the same on the right.
 */
const LEAN_STEPS = 7;

/**
 * A screen as its flowers are placed on it: its ground; the flowers' unit,
 * which scales with the screen exactly; the feet no flower stands on; every
 * control's circle as drawn; and the mushrooms the visit opens with, as they
 * shade it.
 */
export type FlowerGround = Pick<
  MeadowLayout,
  'width' | 'height' | 'groundTop'
> & {
  ground: number;
  unit: number;
  feet: readonly Footing[];
  controls: readonly Circle[];
  clump: ClumpShade;
};

/**
 * How much bigger a flower stands `down` of the way down the ground than its
 * height alone, a share of the clump's size, would make it: nearer flowers,
 * lower on the screen, are taller.
 */
export function depthScale(down: number): number {
  return 0.7 + down * 0.5;
}

/** Whether a flower keeps its stem and head off every mushroom's foot. */
export function clearOfFeet(
  { x, y, size }: Footing,
  feet: readonly Footing[],
): boolean {
  const head = size * HEAD_REACH;
  return feet.every((mushroom) => {
    // The nearest point to the mushroom's foot on the flower's upright line.
    const nearestY = Math.min(y, Math.max(y - size, mushroom.y));
    return (
      Math.hypot(mushroom.x - x, mushroom.y - nearestY) >=
      mushroom.size * FOOT_CLEARANCE + head
    );
  });
}

/** The farthest a flower `place` stands for could reach with its head, whatever its genes: over its stem's top. */
export function widestHead({ x, y, size }: Footing): Circle {
  return { x, y: y - size, r: HEAD_REACH * size };
}

/** Whether a flower at `place` keeps its head, at its widest, apart from the head of every flower at `others`. */
export function headsApart(
  place: Footing,
  others: readonly Footing[],
): boolean {
  const head = widestHead(place);
  return others.every((other) => {
    const near = widestHead(other);
    return (
      Math.hypot(head.x - near.x, head.y - near.y) >=
      FLOWERS_APART * (head.r + near.r)
    );
  });
}

/**
 * Where the head's centre of a flower at `place` stands with its stem bent
 * `bend` of its size and the breeze leaning it `sway` radians about its foot.
 */
function headCentre(
  { x, y, size }: Footing,
  bend: number,
  sway: number,
): Point {
  return {
    x: x + bend * size * Math.cos(sway) + size * Math.sin(sway),
    y: y + bend * size * Math.sin(sway) - size * Math.cos(sway),
  };
}

const SWAYS = [-FLOWER_SWAY, 0, FLOWER_SWAY] as const;
/**
 * Where a head's centre may stand off its foot, per unit of the flower's
 * size, from its stem bent and leant farthest left to the same on the right:
 * a bend and a lean both carry it sideways, so every head stands on or near
 * this row.
 */
const LEANS = Array.from({ length: LEAN_STEPS }, (_, step) => {
  const side = (2 * step) / (LEAN_STEPS - 1) - 1;
  const sway = side * FLOWER_SWAY;
  return headCentre(
    { x: 0, y: 0, size: 1 },
    side * FLOWER_RANGES.stemBend[1],
    sway,
  );
});

/**
 * Whether no head a flower at `place` could grow, whatever its genes, at
 * rest or leant either way by the breeze, overlaps a control's circle.
 */
function clearOfControls(place: Footing, controls: readonly Circle[]): boolean {
  const reach = HEAD_REACH * place.size;
  const [least, most] = FLOWER_RANGES.stemBend;
  return SWAYS.every((sway) => {
    // Every bend's centre lies on this segment, the bend being linear in it.
    const from = headCentre(place, least, sway);
    const to = headCentre(place, most, sway);
    return controls.every(
      (control) => distanceToSegment(from, to, control) >= control.r + reach,
    );
  });
}

/**
 * Whether every head a flower at `place` could grow, whatever its genes, at
 * rest or leant either way by the breeze, shows at least half past the
 * mushrooms of `clump` standing nearer the front (`MOST_SHADED`).
 */
function shownPastClump(place: Footing, clump: ClumpShade): boolean {
  const { x, y, size } = place;
  const heads = LEANS.flatMap((lean) =>
    FLOWER_RANGES.petalLength.map((petal) => ({
      x: x + lean.x * size,
      y: y + lean.y * size,
      r: petal * size,
    })),
  );
  const step = (2 * FLOWER_RANGES.petalLength[0] * size) / HEAD_STEPS;
  return mostShaded(heads, clump, y, step) <= MOST_SHADED;
}

function jitter(
  random: Random,
  at: number,
  reach: number,
  [min, max]: readonly [number, number],
): number {
  const moved = at + between(random, -1, 1) * reach;
  return Math.min(max, Math.max(min, moved));
}

/**
 * Where the flower in slot `index` stands on `ground`: the first try off
 * its slot, from its own seeded stream, that stands off every foot, its head
 * clear of every control and shown past the clump; `undefined` when none of
 * its tries does.
 */
function spotOn(
  ground: FlowerGround,
  index: number,
  seed: number,
  placed: readonly Footing[],
): Footing | undefined {
  const {
    width,
    height,
    groundTop,
    ground: depth,
    unit,
    feet,
    controls,
    clump,
  } = ground;
  const spot = FLOWER_SPOTS[height > width ? 'portrait' : 'landscape'][index];
  if (!spot) return undefined;
  const [across, down] = spot;
  const random = mulberry32(seed + index);
  for (let attempt = 0; attempt < FLOWER_TRIES; attempt++) {
    // Each miss strays a little farther, so a slot on the clump finds a way off it.
    const stray = 1 + attempt / 4;
    const x = jitter(random, across, FLOWER_JITTER[0] * stray, FLOWER_ACROSS);
    const y = jitter(random, down, FLOWER_JITTER[1] * stray, FLOWER_DOWN);
    const flower = {
      x: width * x,
      y: groundTop + depth * y,
      size: unit * FLOWER_SCALE * depthScale(y),
    };
    if (
      clearOfFeet(flower, feet) &&
      headsApart(flower, placed) &&
      clearOfControls(flower, controls) &&
      shownPastClump(flower, clump)
    ) {
      return flower;
    }
  }
  return undefined;
}

/**
 * The seeded flowers on `here` and on `turned`, the same screen turned: each
 * in its slot's first spot on either that stands where a child sees it
 * (`spotOn`), and on neither unless on both, so a turn neither shows a flower
 * nor hides one.
 */
export function placeFlowers(
  here: FlowerGround,
  turned: FlowerGround,
  seed: number,
): Record<'here' | 'turned', Footing[]> {
  const placed = { here: [] as Footing[], turned: [] as Footing[] };
  for (const index of FLOWER_SPOTS.landscape.keys()) {
    const place = spotOn(here, index, seed, placed.here);
    const turnedPlace = spotOn(turned, index, seed, placed.turned);
    if (place && turnedPlace) {
      placed.here.push(place);
      placed.turned.push(turnedPlace);
    }
  }
  return placed;
}
