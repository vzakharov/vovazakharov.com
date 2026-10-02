/**
 * Where a mushroom stands in the world a screen crops: a pure function of its
 * foot on the ground and the camera, so a mushroom never moves while it
 * stands, whatever grows beside it or however the screen pans. The opening's
 * two stand as one clump at the world's middle, as in the drawing; every
 * other stands as the forest does.
 */

import type { Box } from '../../model/geometry';
import {
  type Camera,
  type Frame,
  type Ground,
  groundOfPlane,
  OPENING_EYE,
  project,
  scaleAt,
} from '../../model/ground';
import { OPENING_SPECIES } from '../../model/mushroom-genes';
import { speciesHeight, speciesReach } from '../../model/mushroom-pose';
import {
  type Footed,
  grownOn,
  type Lean,
  OPENING_FOOTING,
  openingIndex,
} from '../../model/placement';
import type { Placement } from './layout';

/**
 * Each opening foot's size against the clump's, back then front: the back
 * one a little smaller, a step farther off. The steps across
 * (`OPENING_FEET`) set where the two stems cross, which the back door needs
 * low, the door above it: a crossing midway hides every height the door
 * could take (`doorInSight`), and a high one stands the caps nearly one over
 * the other, the back one hidden.
 */
const CLUMP_SIZES = [0.92, 1] as const;
/** The opening pair's turn apart, like the V of Syama's two caps. */
const CLUMP_SPLAY = 0.22;
/**
 * How big a forest mushroom stands on the ground against the clump's front
 * one, before depth scales it as it scales the clump: the farther, the
 * smaller, as in Syama's drawing of one near mushroom and small ones behind.
 */
const FOREST_SIZE = 0.7;
/** How far a forest mushroom turns away from the middle of the meadow. */
export const FOREST_SPLAY = 0.1;

/**
 * How a screen stands the meadow's mushrooms: through its camera, their feet
 * in the world's frame (`MEADOW_FRAME`).
 */
export type MushroomGround = Readonly<{ camera: Camera; frame: Frame }>;

/**
 * A foot of `size`, in the clump's, stood at `foot` with `splay` as `camera`
 * shows it.
 */
function standOn(
  camera: Camera,
  foot: Ground,
  size: number,
  splay: number,
): Placement {
  const { x, y, scale, haze } = project(camera, foot);
  return { x, y, size: size * scale, splay, haze };
}

/**
 * Where `camera` stands a mushroom leaning `lean` on `ground`, the layout's
 * ground under its foot: as the clump's `opening`th, its splay the clump's;
 * else as the forest, `FOREST_SIZE` of the clump's size.
 */
function placedAs(
  camera: Camera,
  ground: Ground,
  lean: Lean,
  opening: number | undefined,
): Placement {
  return opening === undefined
    ? standOn(camera, ground, FOREST_SIZE, lean * FOREST_SPLAY)
    : standOn(camera, ground, CLUMP_SIZES[opening] ?? 1, lean * CLUMP_SPLAY);
}

/**
 * Where `camera` stands a mushroom on `foot`, leaning `lean`: on an opening
 * foot as the clump's, their stems crossing; anywhere else as the forest,
 * `FOREST_SIZE` of the clump's size.
 */
export function placeOf(camera: Camera, { foot, lean }: Footed): Placement {
  return placedAs(camera, groundOfPlane(foot), lean, openingIndex(foot));
}

/**
 * Where `camera` would stand a forest mushroom grown at `ground` in front of
 * the eye the layout is anchored at (`grownOn`).
 */
export function placeOnGround(camera: Camera, ground: Ground): Placement {
  return placedAs(camera, ground, grownOn(OPENING_EYE, ground).lean, undefined);
}

/**
 * The box each of the opening clump's two can fill on the screen `camera`
 * shows, whatever its genes: as tall as its tallest stem and cap stand, and
 * as wide as its cap reaches to either side once splayed.
 */
export function clumpCrowns(camera: Camera): Box[] {
  return OPENING_FOOTING.map((footed) => {
    const { x, y, size, splay } = placeOf(camera, footed);
    const { toward, away } = speciesReach(OPENING_SPECIES, splay);
    const [left, right] = splay < 0 ? [toward, away] : [away, toward];
    return {
      left: x - left * size,
      right: x + right * size,
      top: y - speciesHeight(OPENING_SPECIES) * size,
      bottom: y,
    };
  });
}

/**
 * Where `mushroom` stands in the world `ground` lays out, or `undefined`
 * where its foot stands outside it.
 */
export function placeIn(
  { camera }: MushroomGround,
  footed: Footed,
): Placement | undefined {
  const place = placeOf(camera, footed);
  const shown =
    place.x >= 0 &&
    place.x <= camera.world &&
    place.y >= camera.groundTop &&
    place.y <= camera.height;
  return shown ? place : undefined;
}

/**
 * Where a mushroom may stand at the extremes of `frame`: on each opening
 * foot, and at each of its corners and the middle of each of its edges, the
 * forest's farthest, nearest and widest.
 */
export function extremes({ across, near, far }: Frame): Footed[] {
  return [
    ...OPENING_FOOTING,
    ...[-1, 0, 1].flatMap((side) =>
      [near, far].map((z) =>
        grownOn(OPENING_EYE, { x: (side * across) / scaleAt(z), z }),
      ),
    ),
  ];
}

/**
 * Every place at the extremes a mushroom may stand on the screen `ground` is
 * for, the opening clump's two first: the least and the most of every
 * size, haze and reach it may stand at.
 */
export function everyPlace({ camera, frame }: MushroomGround): Placement[] {
  return extremes(frame).map((foot) => placeOf(camera, foot));
}

/** Where each of `standing` stands on the screen `ground` is for. */
export function standingPlaces(
  ground: MushroomGround,
  standing: readonly Footed[],
): Placement[] {
  return standing.flatMap((mushroom) => placeIn(ground, mushroom) ?? []);
}
