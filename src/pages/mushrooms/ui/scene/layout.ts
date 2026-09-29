/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floor that
 * keeps a mushroom a finger's target, so a phone held upright and a tablet
 * held sideways get the same picture composed for each; `sky-layout.ts` places
 * the buttons over it, and `sun-layout.ts` the sun.
 */

import type { Sized } from '@/shared/typings';

import type { Circle, Point, Scaled } from '../../model/geometry';
import {
  type Camera,
  fitCamera,
  type Hazed,
  type Lens,
} from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { geneBounds } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import {
  clumpSlots,
  everyPlace,
  forAll,
  type SlotPlaces,
  standOn,
} from './clump-layout';
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
export type Placement = Footing & Hazed & { splay: number };
export type { Hazed } from '../../model/ground';
/**
 * Where a thing's foot stands, and its size: the unit its genes are in, a
 * flower's height to its head.
 */
export type Footing = Point & Scaled;

/**
 * The forest's feet on the ground, after the clump's two, in the order they
 * fill, each with its size against the clump's: two nearer than the clump's
 * caps, one to either side, then a back row, small and hazy, whose caps stand
 * above and beside the clump's. One table for every screen, inside the common
 * frame, so a turn or a resize moves none of them.
 */
const FOREST_FEET = [
  { x: -0.79, z: -0.8, size: 0.64 },
  { x: 0.785, z: -0.94, size: 0.63 },
  { x: -1.15, z: 2.6, size: 1 },
  { x: 0.29, z: 3, size: 1.07 },
] as const;
/** How far a forest mushroom turns away from the middle of the meadow. */
const FOREST_SPLAY = 0.1;

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
export type MeadowLayout = Sized &
  Controls & {
    /** What the meadow is shown through: a turn or a resize fits a new one. */
    camera: Camera;
    /** Where the far hills meet the sky. */
    horizon: number;
    /** The top of the near hills' band. */
    nearHills: number;
    /** Where the flat ground the mushrooms stand on begins. */
    groundTop: number;
    sun: Circle;
    clouds: readonly Circle[];
    /**
     * One per slot, `MUSHROOM_SLOTS` of them, each by the species standing
     * there (`placeIn`): the clump's two, then the forest.
     */
    mushrooms: readonly SlotPlaces[];
    flowers: readonly Footing[];
    /** The unit a butterfly's genes are painted in. */
    insectSize: number;
    /** The unit each kind's genes are painted in, the butterfly's `insectSize`. */
    insectSizes: Readonly<Record<InsectKind, number>>;
  };

/**
 * How far any cap reaches left and right of its foot, per unit of size, once
 * `splay` turns it.
 */
function sideReach(splay: number): [left: number, right: number] {
  const { toward, away } = maxReach(splay);
  return splay < 0 ? [toward, away] : [away, toward];
}

/** Every slot as `camera` shows it: the clump's two, then the forest. */
function slotsOn(camera: Camera): SlotPlaces[] {
  return [
    ...clumpSlots(camera),
    ...FOREST_FEET.map(({ size, ...foot }) =>
      forAll(standOn(camera, foot, size, (foot.x < 0 ? 1 : -1) * FOREST_SPLAY)),
    ),
  ];
}

/**
 * The slots as a camera of the clump's size 1, centred on 0, shows them: how
 * far their caps reach either side of the middle, whatever their genes, and
 * the smallest any stands.
 */
const UNIT_SLOTS = everyPlace(
  slotsOn({ width: 0, height: 0, groundTop: 0, ground: 1, centre: 0, unit: 1 }),
);

/**
 * The zoom floor: the least clump size a camera stands the meadow at, the
 * narrowest cap the genes allow on the smallest slot, in the farthest row,
 * being `2 × TAP_RADIUS` across there, a mushroom's tap area being its cap
 * as drawn.
 */
export const ZOOM_FLOOR =
  (2 * TAP_RADIUS) /
  (geneBounds('capWidth')[0] * Math.min(...UNIT_SLOTS.map(({ size }) => size)));

/** What every screen's camera shows: every slot's cap, and the zoom floor. */
const LENS: Lens = {
  reach: Math.max(
    ...UNIT_SLOTS.map(({ x, size, splay }) => {
      const [left, right] = sideReach(splay);
      return Math.max(left * size - x, x + right * size);
    }),
  ),
  margin: EDGE_MARGIN,
  floor: ZOOM_FLOOR,
};

/** The camera the meadow on a screen `width` by `height` is shown through. */
export function meadowCamera(width: number, height: number): Camera {
  return fitCamera({ width, height }, LENS);
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
 * opened with (`opening`, by default this screen with none); on this screen
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
  const camera = meadowCamera(width, height);
  const { groundTop, ground, unit } = camera;
  const horizon = horizonAt(width, height);
  const short = Math.min(width, height);
  const mushrooms = slotsOn(camera);
  const controls = placeControls(width, height, groundTop);
  const insectSize = Math.max(INSECT_LEAST, unit * INSECT_SCALE);
  const flowers = {
    width,
    height,
    groundTop,
    ground,
    unit,
    feet: everyPlace(mushrooms),
    controls: [
      ...standingControls(controls),
      ...controls.picker,
      ...controls.housePicker,
    ],
  };
  const layout = {
    width,
    height,
    camera,
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
