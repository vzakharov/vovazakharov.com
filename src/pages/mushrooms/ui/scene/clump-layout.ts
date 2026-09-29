/**
 * Where a mushroom stands on a screen: a pure function of its foot on the
 * ground and the camera, so a mushroom never moves while it stands, whatever
 * grows beside it. The opening's two stand as one clump, as in the drawing;
 * every other stands as the forest does.
 */

import {
  type Camera,
  COMMON_FRAME,
  type Ground,
  project,
  scaleAt,
} from '../../model/ground';
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
export const CLUMP_SPLAY = 0.22;
/**
 * How big a forest mushroom is drawn, against the clump's front one, wherever
 * it stands: the back rows as big as the front ones, so a far cap still reads
 * as a mushroom, only paler.
 */
export const FOREST_DRAWN = 0.7;
/** How far a forest mushroom turns away from the middle of the meadow. */
export const FOREST_SPLAY = 0.1;

/** How a screen stands the meadow's mushrooms: through its camera. */
export type MushroomGround = Readonly<{ camera: Camera }>;

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
 * Where `camera` stands a mushroom on `foot`: on an opening foot as the
 * clump's, the back one leaning left and the front one right, their stems
 * crossing; anywhere else as the forest, drawn `FOREST_DRAWN` of the clump's
 * size and turned away from the middle.
 */
export function placeOf(camera: Camera, foot: Ground): Placement {
  const opening = openingIndex(foot);
  if (opening !== undefined) {
    const splay = (opening === 0 ? -1 : 1) * CLUMP_SPLAY;
    return standOn(camera, foot, CLUMP_SIZES[opening] ?? 1, splay);
  }
  const splay = (foot.x < 0 ? 1 : -1) * FOREST_SPLAY;
  return standOn(camera, foot, FOREST_DRAWN / scaleAt(foot.z), splay);
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
 * Where a mushroom may stand at the extremes: on each opening foot, and at
 * each corner of the common frame and the middle of each of its edges, the
 * forest's farthest, nearest and widest.
 */
const EXTREMES: readonly Ground[] = [
  ...OPENING_FEET,
  ...[-1, 0, 1].flatMap((side) =>
    [COMMON_FRAME.near, COMMON_FRAME.far].map((z) => ({
      x: (side * COMMON_FRAME.across) / scaleAt(z),
      z,
    })),
  ),
];

/**
 * Every place at the extremes a mushroom may stand on the screen `ground` is
 * for, the opening clump's two first: the least and the most of every
 * size, haze and reach it may stand at.
 */
export function everyPlace({ camera }: MushroomGround): Placement[] {
  return EXTREMES.map((foot) => placeOf(camera, foot));
}

/** Where each of `standing` stands on the screen `ground` is for. */
export function standingPlaces(
  ground: MushroomGround,
  standing: readonly Footed[],
): Placement[] {
  return standing.flatMap((mushroom) => placeIn(ground, mushroom) ?? []);
}

/**
 * Every place on the screen `ground` is for that a mushroom stands, with
 * `standing` in them. A mushroom yet to grow keeps off every flower
 * (`pickFoot`), so a flower keeps off only these.
 */
export function claimedPlaces(
  ground: MushroomGround,
  standing: readonly Footed[],
): Placement[] {
  return standingPlaces(ground, standing);
}
