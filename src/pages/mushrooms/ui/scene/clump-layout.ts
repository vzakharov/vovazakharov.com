/**
 * Where a mushroom stands on a screen: a pure function of its foot on the
 * ground and the camera, so a mushroom never moves while it stands, whatever
 * grows beside it. The opening's two stand as one clump, as in the drawing;
 * every other stands as the forest does.
 */

import type { Box } from '../../model/geometry';
import {
  type Camera,
  type Frame,
  type Ground,
  project,
  scaleAt,
} from '../../model/ground';
import { OPENING_SPECIES } from '../../model/mushroom-genes';
import { speciesHeight, speciesReach } from '../../model/mushroom-pose';
import { type Footed, OPENING_FEET, openingIndex } from '../../model/placement';
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
 * in its frame (`frameFor`).
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
 * How big a mushroom standing on `foot` is on the ground, in the clump's
 * size before depth scales it: an opening foot's as the clump's, any other
 * `FOREST_SIZE`.
 */
function sizeOn(foot: Ground): number {
  const opening = openingIndex(foot);
  if (opening !== undefined) return CLUMP_SIZES[opening] ?? 1;
  return FOREST_SIZE;
}

/**
 * Where `camera` stands a mushroom on `foot`: on an opening foot as the
 * clump's, the back one leaning left and the front one right, their stems
 * crossing; anywhere else as the forest, `FOREST_SIZE` of the clump's size
 * and turned away from the middle.
 */
export function placeOf(camera: Camera, foot: Ground): Placement {
  const opening = openingIndex(foot);
  const splay =
    opening === undefined
      ? (foot.x < 0 ? 1 : -1) * FOREST_SPLAY
      : (opening === 0 ? -1 : 1) * CLUMP_SPLAY;
  return standOn(camera, foot, sizeOn(foot), splay);
}

/**
 * The box each of the opening clump's two can fill on the screen `camera`
 * shows, whatever its genes: as tall as its tallest stem and cap stand, and
 * as wide as its cap reaches to either side once splayed.
 */
export function clumpCrowns(camera: Camera): Box[] {
  return OPENING_FEET.map((foot) => {
    const { x, y, size, splay } = placeOf(camera, foot);
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
 * Where `mushroom` stands on the screen `ground` is for, or `undefined` where
 * that screen does not show its foot.
 */
export function placeIn(
  { camera }: MushroomGround,
  { foot }: Footed,
): Placement | undefined {
  const place = placeOf(camera, foot);
  const shown =
    place.x >= 0 &&
    place.x <= camera.width &&
    place.y >= camera.groundTop &&
    place.y <= camera.height;
  return shown ? place : undefined;
}

/**
 * Where a mushroom may stand at the extremes of `frame`: on each opening
 * foot, and at each of its corners and the middle of each of its edges, the
 * forest's farthest, nearest and widest.
 */
export function extremes({ across, near, far }: Frame): Ground[] {
  return [
    ...OPENING_FEET,
    ...[-1, 0, 1].flatMap((side) =>
      [near, far].map((z) => ({ x: (side * across) / scaleAt(z), z })),
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
