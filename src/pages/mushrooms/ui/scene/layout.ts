/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floor that
 * keeps a mushroom a finger's target, so a phone held upright and a tablet
 * held sideways get the same picture composed for each; `sky-layout.ts` places
 * the buttons over it.
 */

import type { Sized } from '@/shared/typings';

import { FLOWER_RANGES } from '../../model/flower-genes';
import type { Circle, Point } from '../../model/geometry';
import { GENE_RANGES } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { between, mulberry32, type Random } from '../../model/random';
import {
  type Controls,
  placeControls,
  placeSun,
  TAP_RADIUS,
} from './sky-layout';

/**
 * A slot's footing, the `splay` its mushroom is stood with (`splayed`), and
 * its haze, the farthest slot the palest.
 */
type Placement = Footing & Hazed & { splay: number };
/** How far toward the sky's haze a thing's colours go, from 0 to 1. */
export type Hazed = { haze: number };
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
 * Where the clump stands: across as a fraction of the width, its back and
 * front feet down as fractions of the ground's depth, and each foot's step
 * off `across` in the clump's size. A tall screen's clump stands nearer the
 * front, leaving the back row room above its caps; its ground is deeper for
 * the clump's size, so its feet stand closer in depth and farther apart
 * across, or the front mushroom would hide the whole of the back one's stem
 * and the door in it.
 */
const CLUMP_ACROSS = { landscape: 0.47, portrait: 0.5 } as const;
const CLUMP_DOWN = { landscape: [0.42, 0.6], portrait: [0.74, 0.8] } as const;
const CLUMP_STEP = {
  landscape: [0.08, -0.06],
  portrait: [0.14, -0.08],
} as const;
/**
 * The forest's slots, after the clump's two, in the order they fill: across as
 * a fraction of the width, down as one of the ground's depth, and the size
 * against the clump's. Two nearer than the clump's caps, then a back row,
 * small and hazy, standing clear of those caps: beside them on a wide screen,
 * above them on a tall one.
 */
const FOREST_SLOTS = {
  landscape: [
    [0.14, 0.8, 0.6],
    [0.88, 0.7, 0.58],
    [0.13, 0.06, 0.5],
    [0.84, 0.08, 0.5],
  ],
  portrait: [
    [0.2, 0.94, 0.62],
    [0.8, 0.97, 0.62],
    [0.2, 0.12, 0.56],
    [0.58, 0, 0.56],
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
/**
 * The least size a forest mushroom stands at, the clump standing larger: the
 * narrowest cap the genes allow is then `2 × TAP_RADIUS` across, a mushroom's
 * tap area being its cap as drawn.
 */
const FINGER_SIZE = (2 * TAP_RADIUS) / GENE_RANGES.capWidth[0];

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;
/** The opening pair's turn apart, like the V of Syama's two caps. */
const CLUMP_SPLAY = 0.22;
export type MeadowLayout = Sized &
  Controls & {
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
 * How far any cap reaches left and right of its foot, per unit of size, once
 * `splay` turns it.
 */
function sideReach(splay: number): [left: number, right: number] {
  const { toward, away } = maxReach(splay);
  return splay < 0 ? [toward, away] : [away, toward];
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
  const [left, right] = sideReach(splay);
  return Math.min((x - margin) / left, (width - margin - x) / right);
}

/**
 * The forest's slots, each facing the middle of the meadow and sized under
 * `sizeToFit`, as the clump is, but never under `floor`: a slot the floor
 * outgrows is pulled in from the edge until it fits.
 */
function placeForest(
  slots: ReadonlyArray<readonly [number, number, number]>,
  {
    width,
    groundTop,
    ground,
    unit,
    margin,
    floor,
  }: Record<
    'width' | 'groundTop' | 'ground' | 'unit' | 'margin' | 'floor',
    number
  >,
): Placement[] {
  return slots.map(([across, down, scale]) => {
    const splay = (across < 0.5 ? 1 : -1) * FOREST_SPLAY;
    const wanted = width * across;
    const size = Math.max(
      floor,
      Math.min(unit * scale, sizeToFit(wanted, width, splay, margin)),
    );
    const [left, right] = sideReach(splay);
    return {
      x: Math.min(
        width - margin - right * size,
        Math.max(margin + left * size, wanted),
      ),
      y: groundTop + ground * down,
      size,
      splay,
      haze: hazeAt(down),
    };
  });
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
  const orientation = portrait ? 'portrait' : 'landscape';
  const groundTop = height * (portrait ? 0.5 : 0.6);
  const horizon = height * (portrait ? 0.36 : 0.42);
  const ground = height - groundTop;
  const short = Math.min(width, height);
  // Sized by height when the screen is wide, by width when it is tall, so a
  // mushroom never outgrows the side of the screen it has less of.
  const wanted = portrait
    ? Math.min(width * 0.6, height * 0.34)
    : height * 0.44;
  // One clump, as in the drawing: two feet close together, the back one
  // leaning left and the front one right, their stems crossing.
  const clump = width * CLUMP_ACROSS[orientation];
  const [backDown, frontDown] = CLUMP_DOWN[orientation];
  const [backStep, frontStep] = CLUMP_STEP[orientation];
  const feet = [
    {
      x: clump + wanted * backStep,
      y: groundTop + ground * backDown,
      scale: 0.9,
      side: -1,
    },
    {
      x: clump + wanted * frontStep,
      y: groundTop + ground * frontDown,
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
  const slots = FOREST_SLOTS[orientation];
  const standing = (margin: number, floor: number) => {
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
      floor,
    });
    return { unit, mushrooms: [...opening, ...forest] };
  };
  const { mushrooms } = standing(EDGE_MARGIN, FINGER_SIZE);
  // The flowers keep to the meadow as it would stand with no edge margin and
  // no floor, which scales with the screen exactly, so a resize keeps every
  // flower where it was.
  const { unit: flowerUnit, mushrooms: unmarginedFeet } = standing(0, 0);
  const controls = placeControls(width, height, groundTop);
  return {
    width,
    height,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    sun: placeSun(width, height, short * 0.075, controls),
    clouds: [
      { x: width * 0.16, y: height * 0.14, r: short * 0.06 },
      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
    ],
    // Sized off the mushrooms' unit, not the ground's depth, so a flower
    // reads as smaller than a fly agaric on every screen; clear of every
    // slot's foot, taken or not, so a mushroom growing never moves one.
    flowers: placeFlowers(
      FLOWER_SPOTS[orientation],
      { width, groundTop, ground, unit: flowerUnit, seed },
      unmarginedFeet,
    ),
    ...controls,
    mushrooms,
  };
}
