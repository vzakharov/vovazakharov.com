/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floor that
 * keeps a mushroom a finger's target, so a phone held upright and a tablet
 * held sideways get the same picture composed for each; `sky-layout.ts` places
 * the buttons over it, and `sun-layout.ts` the sun.
 */

import type { Sized } from '@/shared/typings';

import type { Circle, Point, Scaled } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { geneBounds } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { clumpShade, type Opener } from './clump-shade';
import { type FlowerGround, placeFlowers } from './flower-layout';
import {
  type Controls,
  placeControls,
  standingControls,
  TAP_RADIUS,
} from './sky-layout';
import { horizonAt, placeSun } from './sun-layout';

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
export type Footing = Point & Scaled;

/**
 * Where the clump stands: across as a fraction of the width, its back and
 * front feet down as fractions of the ground's depth, and each foot's step
 * off `across` in the clump's size. A tall screen's clump stands nearer the
 * front, leaving the back row room above its caps, and its feet closer in
 * depth on its deeper ground. The steps set where the two stems cross, which
 * the back door needs low, the door above it: a crossing midway hides every
 * height the door could take (`doorInSight`), and a high one stands the caps
 * nearly one over the other, the back one hidden.
 */
const CLUMP_ACROSS = { landscape: 0.47, portrait: 0.5 } as const;
const CLUMP_DOWN = { landscape: [0.42, 0.6], portrait: [0.74, 0.8] } as const;
const CLUMP_STEP = {
  landscape: [0.02, -0.04],
  portrait: [0, -0.03],
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
const FINGER_SIZE = (2 * TAP_RADIUS) / geneBounds('capWidth')[0];

/**
 * A butterfly's size, the unit its genes are in, as a share of the clump's,
 * and the least it is painted at, so it reads on a phone.
 */
const INSECT_SCALE = 0.3;
const INSECT_LEAST = 60;
/**
 * Each kind's size against the butterfly's: a fly and a bee are small beside
 * it, and still read on a phone.
 */
const KIND_SCALE = {
  butterfly: 1,
  fly: 0.55,
  bee: 0.65,
} as const satisfies Record<InsectKind, number>;

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
    /** The unit a butterfly's genes are painted in. */
    insectSize: number;
    /** The unit each kind's genes are painted in, the butterfly's `insectSize`. */
    insectSizes: Readonly<Record<InsectKind, number>>;
  };

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
 * The visit as it opened: the screen, in CSS px, and the mushrooms standing
 * then, which together place the flowers.
 */
export type Opening = { screen: Sized; openers: readonly Opener[] };

/**
 * `seed` is the visit's: it places what varies between visits, and a resize
 * that passes the same one keeps it where it was. The flowers are placed on
 * the screen the visit opened on, and on it turned, against the mushrooms it
 * opened with (`opening`; this screen and none unless said); on this screen
 * each stands where it stands on whichever of the two is held the same way,
 * at the same share of the width, of the ground's depth and of the flowers'
 * size.
 */
export function meadowLayout(
  width: number,
  height: number,
  seed: number,
  opening?: Opening,
): MeadowLayout {
  const screen = opening?.screen ?? { width, height };
  const openers = opening?.openers ?? [];
  const here = stoodMeadow(width, height);
  const groundOf = (across: number, down: number): FlowerGround => {
    const { layout, flowers } = stoodMeadow(across, down);
    return { ...flowers, clump: clumpShade(layout.mushrooms, openers) };
  };
  const first = groundOf(screen.width, screen.height);
  const turned = groundOf(screen.height, screen.width);
  const placed = placedOn(first, turned, seed, openers);
  const [from, flowers] =
    height > width === screen.height > screen.width
      ? [first, placed.here]
      : [turned, placed.turned];
  const to = here.flowers;
  return {
    ...here.layout,
    flowers: flowers.map(({ x, y, size }) => ({
      x: (x / from.width) * to.width,
      y: to.groundTop + ((y - from.groundTop) / from.ground) * to.ground,
      size: (size / from.unit) * to.unit,
    })),
  };
}

/**
 * Everything the meadow stands on a screen but the flowers, and the ground
 * they are placed on there but for the mushrooms standing (`FlowerGround`).
 */
type Stood = {
  layout: Omit<MeadowLayout, 'flowers'>;
  flowers: Omit<FlowerGround, 'clump'>;
};

/**
 * How many screens' `Stood`, and visits' flowers, are kept: a screen and its
 * turn, and the few a resize passes through.
 */
const KEPT = 8;
const stood = new Map<string, Stood>();
const placements = new Map<string, ReturnType<typeof placeFlowers>>();

/** `make()`, kept in `store` under `key` among the latest `KEPT`. */
function keptIn<Kept>(
  store: Map<string, Kept>,
  key: string,
  make: () => Kept,
): Kept {
  const known = store.get(key) ?? make();
  store.delete(key);
  store.set(key, known);
  for (const oldest of store.keys()) {
    if (store.size <= KEPT) break;
    store.delete(oldest);
  }
  return known;
}

/** `standMeadow`, kept for the screens stood last: nothing it stands varies between visits. */
function stoodMeadow(width: number, height: number): Stood {
  return keptIn(stood, `${String(width)} ${String(height)}`, () =>
    standMeadow(width, height),
  );
}

/** `placeFlowers`, kept for the visits placed last, a screen's and its turn's alike. */
function placedOn(
  here: FlowerGround,
  turned: FlowerGround,
  seed: number,
  openers: readonly Opener[],
): ReturnType<typeof placeFlowers> {
  const visit = [
    String(seed),
    ...openers.map(
      ({ slot, species, seed: own }) =>
        `${String(slot)} ${species} ${String(own)}`,
    ),
  ].join(' ');
  const key = (ground: FlowerGround) =>
    `${String(ground.width)} ${String(ground.height)} ${visit}`;
  const swapped = placements.get(key(turned));
  if (swapped) return { here: swapped.turned, turned: swapped.here };
  return keptIn(placements, key(here), () => placeFlowers(here, turned, seed));
}

/** The meadow on a screen `width` by `height` but for its flowers (`Stood`). */
function standMeadow(width: number, height: number): Stood {
  const portrait = height > width;
  const orientation = portrait ? 'portrait' : 'landscape';
  const groundTop = height * (portrait ? 0.5 : 0.6);
  const horizon = horizonAt(width, height);
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
  const { unit, mushrooms } = standing(EDGE_MARGIN, FINGER_SIZE);
  // The flowers are sized off the meadow as it would stand with no edge
  // margin and no floor, which scales with the screen exactly, so a flower
  // reads as smaller than a fly agaric on every screen. They keep off the
  // feet of that meadow and of this one, whichever reaches farther, and of
  // every slot, taken or not, so a mushroom growing never moves one.
  const { unit: flowerUnit, mushrooms: unmarginedFeet } = standing(0, 0);
  const controls = placeControls(width, height, groundTop);
  const insectSize = Math.max(INSECT_LEAST, unit * INSECT_SCALE);
  const flowers = {
    width,
    height,
    groundTop,
    ground,
    unit: flowerUnit,
    feet: [...mushrooms, ...unmarginedFeet],
    controls: [
      ...standingControls(controls),
      ...controls.picker,
      ...controls.housePicker,
    ],
  };
  const layout = {
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
    ...controls,
    mushrooms,
    insectSize,
    insectSizes: {
      butterfly: insectSize * KIND_SCALE.butterfly,
      fly: insectSize * KIND_SCALE.fly,
      bee: insectSize * KIND_SCALE.bee,
    },
  };
  return { layout, flowers };
}
