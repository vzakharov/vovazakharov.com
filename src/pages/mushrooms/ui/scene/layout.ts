/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floors
 * that keep the clump a finger's target and an insect big enough to read,
 * so a phone held upright and a tablet held sideways get the same picture
 * composed for each; `sky-layout.ts` places the buttons over it, and
 * `sun-layout.ts` the sun.
 */

import type { Sized } from '@/shared/typings';

import type { Circle, Point, Scaled } from '../../model/geometry';
import type { Camera, Ground, Hazed } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { clumpCrowns, type MushroomGround } from './clump-layout';
import { clumpShade, type Opener } from './clump-shade';
import {
  type FlowerFoot,
  type FlowerGround,
  flowersOn,
  headsAcross,
  seededBed,
} from './flower-layout';
import { WIDEST_SPAN } from './flower-sight';
import {
  capsAcross,
  CLUMP_NARROWEST,
  meadowCamera,
  meadowFrame,
} from './meadow-camera';
import { type Controls, placeControls, standingControls } from './sky-layout';
import { horizonAt, placeSun, washRings } from './sun-layout';

/**
 * A mushroom's footing, the `splay` it is stood with (`splayed`), and its
 * haze, the farthest the palest.
 */
export type Placement = Footing & Hazed & { splay: number };
export type { Hazed } from '../../model/ground';
/**
 * Where a thing's foot stands, and its size: the unit its genes are in, a
 * flower's height to its head.
 */
export type Footing = Point & Scaled;

/**
 * A butterfly's size, the unit its genes are in, as a share of the clump's,
 * and the least it is painted at, so it reads on a phone. That least gives
 * way where the clump stands small (`insectSizeFor`).
 */
const INSECT_SCALE = 0.3;
const INSECT_LEAST = 60;

/**
 * The unit a butterfly's genes are painted in where the clump stands `unit`:
 * `INSECT_SCALE` of it and at least `INSECT_LEAST`, but never so big that its
 * open wings span wider than the clump's narrowest cap, which wins where the
 * clump stands small — a short screen, or a refit zoomed out to keep what the
 * meadow used in view. So a turn's refit is a scaled copy of the picture, a
 * flower's room for wings included; a tap stays a finger's (`tapReach`).
 */
function insectSizeFor(unit: number): number {
  return Math.min(
    Math.max(INSECT_LEAST, unit * INSECT_SCALE),
    (unit * CLUMP_NARROWEST) / WIDEST_SPAN,
  );
}
/**
 * Each kind's size against the butterfly's: a fly and a bee are small beside
 * it, and still read on a phone.
 */
const KIND_SCALE = {
  butterfly: 1,
  fly: 0.55,
  bee: 0.65,
} as const satisfies Record<InsectKind, number>;

export type MeadowLayout = Sized &
  Controls &
  Pick<Camera, 'groundTop'> & {
    /** What the meadow is shown through: a turn or a resize fits a new one. */
    camera: Camera;
    /** Where the far hills meet the sky. */
    horizon: number;
    /** The top of the near hills' band. */
    nearHills: number;
    sun: Circle;
    clouds: readonly Circle[];
    /** How the mushrooms stand, each by its foot (`placeIn`). */
    mushrooms: MushroomGround;
    flowers: readonly Footing[];
    /** The unit a butterfly's genes are painted in. */
    insectSize: number;
    /** The unit each kind's genes are painted in, the butterfly's `insectSize`. */
    insectSizes: Readonly<Record<InsectKind, number>>;
    /** The radii of the sun's wash over the land, innermost first (`washRings`). */
    wash: readonly number[];
  };

/**
 * The visit as it opened: the screen, in CSS px, and the mushrooms standing
 * then, which together place the flowers.
 */
export type Opening = Screened & { openers: readonly Opener[] };

/** The screen, in CSS px, something is laid out on. */
type Screened = { screen: Sized };

/** The feet the meadow has used on the ground: its mushrooms', and its flowers'. */
export type Used = Readonly<{
  mushrooms: readonly Ground[];
  flowers: readonly FlowerFoot[];
}>;

/** Nothing used yet: the visit as it opens. */
const UNUSED: Used = { mushrooms: [], flowers: [] };

/**
 * `seed` is the visit's: it places what varies between visits, and a resize
 * that passes the same one keeps it where it was. The flowers are placed on
 * the ground once, on the screen the visit opened on against the mushrooms
 * it opened with (`opening`, by default this screen with none), and this
 * screen's camera shows them where they stand. The camera keeps every seeded
 * flower and everything standing on a foot of `used` in view, the caps
 * inside the edge margin, and the sun's wash off every mushroom's foot of it.
 */
export function meadowLayout(
  width: number,
  height: number,
  seed: number,
  opening?: Opening,
  used: Used = UNUSED,
): MeadowLayout {
  const screen = opening?.screen ?? { width, height };
  const openers = opening?.openers ?? [];
  const { layout, flowers } = stoodMeadow(screen.width, screen.height);
  const opened = { ...flowers, clump: clumpShade(layout.mushrooms, openers) };
  const bed = keptBed(opened, seed, openers);
  const shown = Math.max(
    capsAcross(used.mushrooms),
    headsAcross([...used.flowers, ...bed]),
  );
  const here = stoodMeadow(width, height, shown);
  return {
    ...here.layout,
    flowers: flowersOn(here.layout.camera, bed),
    wash: washRings(here.layout, used.mushrooms),
  };
}

/**
 * Everything the meadow stands on a screen but the flowers and the sun's
 * wash, and the ground the flowers are placed on there but for the mushrooms
 * standing (`FlowerGround`).
 */
type Stood = {
  layout: Omit<MeadowLayout, 'flowers' | 'wash'>;
  flowers: Omit<FlowerGround, 'clump'>;
};

/**
 * How many screens' `Stood`, and visits' flowers, are kept: a screen and its
 * turn, and the few a resize passes through.
 */
const KEPT = 8;
const stood = new Map<string, Stood>();
const beds = new Map<string, FlowerFoot[]>();

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

/**
 * `standMeadow`, kept for the screens stood last: nothing it stands varies
 * between visits but how far across it shows (`shown`).
 */
function stoodMeadow(width: number, height: number, shown = 0): Stood {
  return keptIn(stood, [width, height, shown].map(String).join(' '), () =>
    standMeadow(width, height, shown),
  );
}

/** `seededBed`, kept for the visits placed last. */
function keptBed(
  opened: FlowerGround,
  seed: number,
  openers: readonly Opener[],
): FlowerFoot[] {
  const key = [
    String(opened.width),
    String(opened.height),
    String(seed),
    ...openers.map(
      ({ foot, species, seed: own }) =>
        `${String(foot.x)} ${String(foot.z)} ${species} ${String(own)}`,
    ),
  ].join(' ');
  return keptIn(beds, key, () => seededBed(opened, seed));
}

/**
 * The meadow on a screen `width` by `height`, showing `shown` across
 * (`meadowCamera`), but for its flowers (`Stood`).
 */
function standMeadow(width: number, height: number, shown: number): Stood {
  const camera = meadowCamera(width, height, shown);
  const { groundTop, ground, unit } = camera;
  const horizon = horizonAt(groundTop);
  const short = Math.min(width, height);
  const frame = meadowFrame({ width, height });
  const mushrooms = { camera, frame };
  const controls = placeControls(width, height, groundTop);
  const insectSize = insectSizeFor(unit);
  const flowers = {
    width,
    height,
    groundTop,
    ground,
    frame,
    unit,
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
    sun: placeSun(
      { width, height, horizon },
      short * 0.075,
      controls,
      clumpCrowns(camera),
    ),
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
