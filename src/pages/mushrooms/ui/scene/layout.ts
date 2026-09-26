/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size is proportional, so a phone held upright and a tablet
 * held sideways get the same picture composed for each.
 */

import type { Sized } from '@/shared/typings';

import { FLOWER_RANGES } from '../../model/flower-genes';
import type { Circle, Point } from '../../model/geometry';
import { CAP_KINDS } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { between, mulberry32, type Random } from '../../model/random';

/**
 * A slot's footing, the `splay` its mushroom is stood with (`splayed`), and how
 * far toward the sky's haze its colours go, the farthest the palest.
 */
export type Placement = Footing & { splay: number; haze: number };
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
    [0.36, 0.14],
    [0.66, 0.22],
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
/**
 * The forest's slots, after the clump's two, in the order they fill: across as
 * a fraction of the width, down as one of the ground's depth, and the size
 * against the clump's. A row flanking the clump, one in front of it, then a
 * back row, small and hazy.
 */
const FOREST_SLOTS = {
  landscape: [
    [0.14, 0.8, 0.6],
    [0.88, 0.62, 0.58],
    [0.22, 0.06, 0.5],
    [0.8, 0.1, 0.5],
  ],
  portrait: [
    [0.16, 0.54, 0.44],
    [0.84, 0.58, 0.44],
    [0.22, 0.04, 0.42],
    [0.78, 0.08, 0.42],
  ],
} as const;
/** How far a forest mushroom turns away from the middle of the meadow. */
const FOREST_SPLAY = 0.1;
/**
 * The haze on the farthest mushroom, and how far down the ground it thins
 * out to none.
 */
const MAX_HAZE = 0.4;
const HAZE_REACH = 0.35;
/** The mute button's radius, and how far its edge keeps from the corner. */
const BUTTON_R = 28;
const BUTTON_INSET = 18;
/** The `+` and `−` buttons' radius, and the gap between them. */
const GROW_R = 36;
const GROW_GAP = 16;
/**
 * The picker's buttons at their largest, and their spacing in radii: at the
 * least, which a narrow screen gets, and where there is room.
 */
const PICK_R = 46;
const PICK_SPACING = 2.2;
const PICK_ROOMY_SPACING = 2.7;
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
  /** One per slot, `MUSHROOM_SLOTS` of them: the clump's two, then the forest. */
  mushrooms: readonly Placement[];
  flowers: readonly Footing[];
  mute: Circle;
  plus: Circle;
  minus: Circle;
  /** One per `CAP_KINDS`, in that order. */
  picker: readonly Circle[];
};

/** A flower's head reaches this far from its centre, per unit of its size. */
const HEAD_REACH = FLOWER_RANGES.petalLength[1];

/** Whether a flower keeps its stem and head off every mushroom's foot. */
function clearOfFeet(
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
  slots: ReadonlyArray<readonly [number, number]>,
  {
    width,
    groundTop,
    ground,
    unit,
    seed,
  }: Record<'width' | 'groundTop' | 'ground' | 'unit' | 'seed', number>,
  feet: readonly Footing[],
): Footing[] {
  return slots.flatMap(([across, down], index) => {
    const random = mulberry32(seed + index);
    for (let attempt = 0; attempt < FLOWER_TRIES; attempt++) {
      // Each miss strays a little farther, so a slot on the clump finds a way off it.
      const stray = 1 + attempt / 4;
      const x = jitter(random, across, FLOWER_JITTER[0] * stray, [0.05, 0.95]);
      const y = jitter(random, down, FLOWER_JITTER[1] * stray, [0.12, 0.96]);
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

function jitter(
  random: Random,
  at: number,
  reach: number,
  [min, max]: readonly [number, number],
): number {
  const moved = at + between(random, -1, 1) * reach;
  return Math.min(max, Math.max(min, moved));
}

function hazeAt(down: number): number {
  return MAX_HAZE * Math.max(0, 1 - down / HAZE_REACH);
}

/**
 * The largest size a mushroom stood at `x` with `splay` can take, whatever
 * its genes, and keep its cap `margin` inside the screen.
 */
function sizeToFit(
  x: number,
  width: number,
  splay: number,
  margin: number,
): number {
  const reach = maxReach(splay);
  const [left, right] =
    splay < 0 ? [reach.toward, reach.away] : [reach.away, reach.toward];
  return Math.min((x - margin) / left, (width - margin - x) / right);
}

/**
 * The forest's slots, each facing the middle of the meadow and sized under
 * `sizeToFit`, as the clump is.
 */
function placeForest(
  slots: ReadonlyArray<readonly [number, number, number]>,
  {
    width,
    groundTop,
    ground,
    unit,
    margin,
  }: Record<'width' | 'groundTop' | 'ground' | 'unit' | 'margin', number>,
): Placement[] {
  return slots.map(([across, down, scale]) => {
    const x = width * across;
    const splay = (across < 0.5 ? 1 : -1) * FOREST_SPLAY;
    return {
      x,
      y: groundTop + ground * down,
      size: Math.min(unit * scale, sizeToFit(x, width, splay, margin)),
      splay,
      haze: hazeAt(down),
    };
  });
}

/**
 * The `+` and `−` on the right, where Syama drew them, and the picker across
 * the top — pushed below the mute button where a narrow screen would have
 * them meet.
 */
function placeControls(
  width: number,
  height: number,
  mute: Circle,
): Pick<MeadowLayout, 'plus' | 'minus' | 'picker'> {
  const x = width - BUTTON_INSET - GROW_R;
  const plusY = height * 0.36;
  const r = Math.min(
    PICK_R,
    (width - BUTTON_INSET * 2) / (PICK_SPACING * (CAP_KINDS.length - 1) + 2),
  );
  const gaps = CAP_KINDS.length - 1;
  const step = Math.min(
    r * PICK_ROOMY_SPACING,
    (width - BUTTON_INSET * 2 - r * 2) / gaps,
  );
  const first = width / 2 - (step * gaps) / 2;
  const clearOfMute = first - r >= mute.x + mute.r + BUTTON_INSET;
  const y = clearOfMute
    ? BUTTON_INSET + r
    : mute.y + mute.r + BUTTON_INSET + r;
  return {
    plus: { x, y: plusY, r: GROW_R },
    minus: { x, y: plusY + GROW_R * 2 + GROW_GAP, r: GROW_R },
    picker: CAP_KINDS.map((_, index) => ({ x: first + step * index, y, r })),
  };
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
  const clumpSize = (margin: number) =>
    Math.min(
      wanted,
      ...feet.map(
        ({ x, scale, side }) =>
          sizeToFit(x, width, side * CLUMP_SPLAY, margin) / scale,
      ),
    );
  const slots = FOREST_SLOTS[portrait ? 'portrait' : 'landscape'];
  const standing = (margin: number) => {
    const unit = clumpSize(margin);
    const opening = feet.map(({ x, y, scale, side }) => ({
      x,
      y,
      size: unit * scale,
      splay: side * CLUMP_SPLAY,
      haze: 0,
    }));
    const forest = placeForest(slots, {
      width,
      groundTop,
      ground,
      unit,
      margin,
    });
    return { unit, mushrooms: [...opening, ...forest] };
  };
  const { mushrooms } = standing(EDGE_MARGIN);
  // The flowers keep to the meadow as it would stand with no edge margin,
  // which scales with the screen exactly, so a resize keeps every flower
  // where it was.
  const { unit: flowerUnit, mushrooms: unmarginedFeet } = standing(0);
  const mute = {
    x: BUTTON_INSET + BUTTON_R,
    y: BUTTON_INSET + BUTTON_R,
    r: BUTTON_R,
  };
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
    // reads as smaller than a fly agaric on every screen; clear of every
    // slot's foot, taken or not, so a mushroom growing never moves one.
    flowers: placeFlowers(
      FLOWER_SPOTS[portrait ? 'portrait' : 'landscape'],
      { width, groundTop, ground, unit: flowerUnit, seed },
      unmarginedFeet,
    ),
    mute,
    ...placeControls(width, height, mute),
    mushrooms,
  };
}
