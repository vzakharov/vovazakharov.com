/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floors
 * that keep the clump a finger's target and an insect big enough to read,
 * so a phone held upright and a tablet held sideways get the same picture
 * composed for each; `sky-layout.ts` places the buttons over it, and
 * `sun-layout.ts` the sun.
 */

import { pick } from '@/kernel/shared/lib/collections';

import type { Box } from '@/mushrooms/shared/lib/geometry';
import {
  type Camera,
  type ClumpGround,
  type GroundedScreen,
  OPENING_EYE,
  openingPan,
  pinholeOf,
  screenOf,
} from '@/mushrooms/shared/world';
import {
  type Bed,
  type Bedded,
  FAR_BAND,
  flowersOn,
  NEAR_BAND,
  seededBed,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  type InsectCamera,
  insectScaled,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  type Clouded,
  type HilledHorizon,
  horizonAt,
  placeSun,
  skyClouds,
  SUN_RAY_REACH,
  type Sunned,
  type SunWashed,
  washRings,
} from '@/mushrooms/entities/landscape/index.node-safe';
import {
  clumpCrowns,
  clumpShade,
  everyPlace,
  MEADOW_FRAME,
  meadowCamera,
  type Opener,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import type { EveryButton } from '@/mushrooms/features/grow-mushroom/index.node-safe';

import { gaitSpot } from './gait-spot';
import {
  type Controls,
  type Crossed,
  flowerCross,
  placeControls,
  standingControls,
  sunControls,
} from './sky-layout';

/** The screen with its buttons, the flower picker's cross and the sun on it: what the gait button is placed among (`gaitSpot`). */
export type ControlledScreen = GroundedScreen & Controls & Crossed & Sunned;

/** Everything the meadow stands on a screen but its flowers and the sun's wash. */
type Stood = ControlledScreen &
  InsectCamera &
  HilledHorizon &
  ClumpGround &
  Clouded &
  EveryButton;

export type MeadowLayout = Stood & Bedded & SunWashed;

/**
 * `seed` is the visit's: it places what varies between visits, and a resize
 * that passes the same one keeps it where it was. The meadow is laid out
 * across the whole world for this screen's size, the screen a crop of it
 * (`pan.ts`), so a turn or a resize changes the zoom and the crop and moves
 * nothing on the ground. The seeded flowers are placed on the world once,
 * against `openers`, the mushrooms the visit opened with.
 */
export function meadowLayout(
  width: number,
  height: number,
  seed: number,
  openers: readonly Opener[] = [],
): MeadowLayout {
  const layout = stoodMeadow(width, height);
  return {
    ...layout,
    flowers: flowersOn(layout.camera, keptBed(seed, openers)),
    wash: washRings({
      ...layout,
      places: everyPlace(layout.mushrooms),
      horizonRow: pinholeOf(layout.camera).y,
    }),
  };
}

/**
 * How many screens' `Stood`, and visits' flowers, are kept: a screen and its
 * turn, and the few a resize passes through.
 */
const KEPT = 8;
const stood = new Map<string, Stood>();
const beds = new Map<string, Bed>();

/** `make()`, kept in `store` under `key` among the latest `KEPT`. */
function keptLatest<Kept>(
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
  return keptLatest(stood, `${String(width)} ${String(height)}`, () =>
    standMeadow(width, height),
  );
}

/**
 * The screen the seeded flowers are placed through: any one places them on
 * the same ground, every camera looking from one angle, so the tablet held
 * sideways, the primary layout. No control stands over the world, so none is
 * in the bed's way.
 */
const BED_SCREEN = { width: 1180, height: 820 } as const;

/** `seededBed` on the world against `openers`, kept for the visits placed last. */
function keptBed(seed: number, openers: readonly Opener[]): Bed {
  const key = [
    String(seed),
    ...openers.map(
      ({ foot, lean, species, seed: own }) =>
        `${String(foot.x)} ${String(foot.y)} ${String(lean)} ${species} ${String(own)}`,
    ),
  ].join(' ');
  return keptLatest(beds, key, () => {
    const { camera, mushrooms } = stoodMeadow(
      BED_SCREEN.width,
      BED_SCREEN.height,
    );
    const opened = {
      ...pick(
        camera,
        'width',
        'height',
        'groundTop',
        'ground',
        'world',
        'unit',
      ),
      ...pick(mushrooms, 'frame'),
      controls: [],
      clump: clumpShade(mushrooms, openers),
    };
    return seededBed(opened, seed, [NEAR_BAND, FAR_BAND]);
  });
}

/**
 * The clump's crowns (`clumpCrowns`) where the screen shows them as the visit
 * opens, for the sun, which stands on the screen, to keep its rays off.
 */
function openingCrowns(camera: Camera): Box[] {
  const opening = openingPan(camera);
  return clumpCrowns(camera).map((crown) => ({
    ...crown,
    left: screenOf(opening, 0, crown.left),
    right: screenOf(opening, 0, crown.right),
  }));
}

/** The meadow on a screen `width` by `height` (`meadowCamera`), but for its flowers (`Stood`). */
function standMeadow(width: number, height: number): Stood {
  const camera = meadowCamera(width, height);
  const { groundTop, unit } = camera;
  const horizon = horizonAt(groundTop);
  const short = Math.min(width, height);
  const mushrooms = { camera, frame: MEADOW_FRAME, anchor: OPENING_EYE };
  const placed = placeControls(width, height, groundTop);
  const crossed = { ...placed, width, groundTop };
  const sun = placeSun(
    { width, height, horizon },
    short * 0.075,
    sunControls(placed),
    openingCrowns(camera),
    [flowerCross(crossed, [])],
  );
  const cross = flowerCross(crossed, [{ ...sun, r: sun.r * SUN_RAY_REACH }]);
  const gait = gaitSpot({ ...placed, width, height, groundTop, sun, cross });
  const controls = { ...placed, ...gait };
  return {
    width,
    height,
    camera,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    sun,
    cross,
    clouds: skyClouds(camera),
    ...controls,
    everyButton: [
      ...standingControls(controls),
      ...controls.picker,
      ...controls.housePicker,
    ],
    mushrooms,
    ...insectScaled(unit),
  };
}
