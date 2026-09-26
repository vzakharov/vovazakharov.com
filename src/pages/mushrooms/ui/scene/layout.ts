/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size is proportional, so a phone held upright and a tablet
 * held sideways get the same picture composed for each.
 */

import type { Sized } from '@/shared/typings';

import { FLOWER_RANGES } from '../../model/flower-genes';
import type { Circle, Point } from '../../model/geometry';
import { maxReach } from '../../model/mushroom-pose';
import { between, mulberry32 } from '../../model/random';

/** A mushroom's footing, and the `splay` it is stood with (`splayed`). */
type Placement = Footing & { splay: number };
/**
 * Where a thing's foot stands, and its size: the unit its genes are in, a
 * flower's height to its head.
 */
export type Footing = Point & { size: number };

/**
 * The slots the flowers grow around, as a fraction of the width across and of
 * the ground's depth down, the likeliest to show first — some behind the
 * clump's stems, some before it. Each visit jitters every flower off its slot.
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
    [0.16, 0.3],
    [0.84, 0.36],
    [0.24, 0.78],
    [0.8, 0.84],
    [0.52, 0.94],
  ],
} as const;
/**
 * How far a flower strays from its slot, as a fraction of the width and of the
 * ground's depth.
 */
const FLOWER_JITTER = [0.07, 0.12] as const;
/** Tries at a spot off the slot before a flower is left out. */
const FLOWER_TRIES = 24;
/** A flower's height, as a share of the clump's size, before depth scales it. */
const FLOWER_SCALE = 0.26;
/**
 * How far round a mushroom's foot, per unit of its size, no flower stands: the
 * foot and its shadow, the one thing Syama drew being two stems standing
 * together.
 */
export const FOOT_CLEARANCE = 0.45;
/** The mute button's radius, and how far its edge keeps from the corner. */
const BUTTON_R = 28;
const BUTTON_INSET = 18;
/**
 * The least radius, in CSS pixels, a tap target reaches: 64 across, which a
 * six-year-old's finger finds without aiming.
 */
export const TAP_RADIUS = 32;

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;
/** The opening pair's turn apart, like the V of Syama's two caps. */
const CLUMP_SPLAY = 0.22;
/** The sun's glow reaches this many radii out, and must stay on screen. */
export const SUN_GLOW_REACH = 2.6;

export type MeadowLayout = Sized & {
  /** Where the far hills meet the sky. */
  horizon: number;
  /** The top of the near hills' band. */
  nearHills: number;
  /** Where the flat ground the mushrooms stand on begins. */
  groundTop: number;
  sun: Circle;
  clouds: readonly Circle[];
  /** Back to front, which is the order they are painted in. */
  mushrooms: readonly Placement[];
  flowers: readonly Footing[];
  mute: Circle;
};

/** A flower's head reaches this far from its centre, per unit of its size. */
const HEAD_REACH = FLOWER_RANGES.petalLength[1];

/**
 * Whether a flower `size` tall standing at `foot` keeps its stem and head off
 * every mushroom's foot.
 */
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

/**
 * The flowers, each jittered off its slot by its own seeded stream — so a
 * resize keeps every flower where it was — and moved again until it stands
 * clear of the clump's feet, or left out when it never does.
 */
function placeFlowers(
  slots: readonly (readonly [number, number])[],
  { width, groundTop, ground, unit, seed }: Record<
    'width' | 'groundTop' | 'ground' | 'unit' | 'seed',
    number
  >,
  feet: readonly Footing[],
): Footing[] {
  return slots.flatMap(([across, down], index) => {
    const random = mulberry32(seed + index);
    for (let attempt = 0; attempt < FLOWER_TRIES; attempt++) {
      // Each miss strays a little farther, so a slot on the clump finds a way off it.
      const stray = 1 + attempt / 4;
      const x = clamp(
        across + between(random, -1, 1) * FLOWER_JITTER[0] * stray,
        0.05,
        0.95,
      );
      const y = clamp(
        down + between(random, -1, 1) * FLOWER_JITTER[1] * stray,
        0.12,
        0.96,
      );
      const flower = {
        x: width * x,
        y: groundTop + ground * y,
        // Nearer flowers, lower on the screen, are taller.
        size: unit * FLOWER_SCALE * (0.7 + y * 0.5),
      };
      if (clearOfFeet(flower, feet)) return [flower];
    }
    return [];
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * `seed` is the visit's: it places what varies between visits, and a resize
 * that passes the same one keeps it where it was.
 */
export function meadowLayout(
  width: number,
  height: number,
  seed: number,
): MeadowLayout {
  const portrait = height > width;
  const groundTop = height * (portrait ? 0.62 : 0.6);
  const horizon = height * (portrait ? 0.46 : 0.42);
  const ground = height - groundTop;
  const short = Math.min(width, height);
  // Sized by height when the screen is wide, by width when it is tall, so a
  // mushroom never outgrows the side of the screen it has less of.
  const wanted = portrait
    ? Math.min(width * 0.6, height * 0.34)
    : height * 0.44;
  // One clump, as in the drawing: two feet close together, the back one
  // leaning left and the front one right, their stems crossing.
  const clump = width * (portrait ? 0.5 : 0.49);
  const feet = [
    {
      x: clump + wanted * 0.08,
      y: groundTop + ground * 0.42,
      scale: 0.9,
      side: -1,
    },
    {
      x: clump - wanted * 0.06,
      y: groundTop + ground * 0.6,
      scale: 1,
      side: 1,
    },
  ] as const;
  // A size held under `maxReach` keeps every cap on screen, whatever its genes.
  const reach = maxReach(CLUMP_SPLAY);
  const fits = Math.min(
    ...feet.map(({ x, scale, side }) => {
      const [left, right] =
        side < 0 ? [reach.toward, reach.away] : [reach.away, reach.toward];
      return (
        Math.min((x - EDGE_MARGIN) / left, (width - EDGE_MARGIN - x) / right) /
        scale
      );
    }),
  );
  const size = Math.min(wanted, fits);
  const mushrooms = feet.map(({ x, y, scale, side }) => ({
    x,
    y,
    size: size * scale,
    splay: side * CLUMP_SPLAY,
  }));
  const sunR = short * 0.075;
  return {
    width,
    height,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    // Pulled in from the corner until its glow fits, which only a phone's
    // narrow width calls for.
    sun: {
      x: Math.min(width * 0.84, width - sunR * SUN_GLOW_REACH),
      y: Math.max(height * 0.15, sunR * SUN_GLOW_REACH),
      r: sunR,
    },
    clouds: [
      { x: width * 0.16, y: height * 0.14, r: short * 0.06 },
      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
    ],
    // Sized off the mushrooms' unit, not the ground's depth, so a flower
    // reads as smaller than a fly agaric on every screen.
    flowers: placeFlowers(
      FLOWER_SPOTS[portrait ? 'portrait' : 'landscape'],
      { width, groundTop, ground, unit: size, seed },
      mushrooms,
    ),
    mute: {
      x: BUTTON_INSET + BUTTON_R,
      y: BUTTON_INSET + BUTTON_R,
      r: BUTTON_R,
    },
    mushrooms,
  };
}
