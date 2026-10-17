/**
 * Where a mushroom stands in the world a screen crops: a pure function of its
 * foot on the ground and the camera, so a mushroom never moves while it
 * stands, whatever grows beside it or however the screen pans. The opening's
 * two stand as one clump at the world's middle, as in the drawing; every
 * other stands as the forest does.
 */

import { sameAnchor } from '../../model/anchor';
import type { Box, Point } from '../../model/geometry';
import {
  anchored,
  type Camera,
  CLUMP_DISTANCE,
  type Eye,
  type Frame,
  gathered,
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
 * in the world's frame (`MEADOW_FRAME`), as `anchor` judges them, every foot
 * moved with it onto `OPENING_EYE` (`anchored`).
 */
export type MushroomGround = Readonly<{
  camera: Camera;
  frame: Frame;
  anchor: Eye;
}>;

/** The ground `anchoredGround` last anchored each ground at. */
const anchoredGrounds = new WeakMap<MushroomGround, MushroomGround>();

/**
 * `ground` as `anchor` judges it: `ground` itself at its own anchor, and the
 * same object for as long as the anchor stays (`sameAnchor`), so whatever a
 * rule keeps per ground holds until the anchor moves.
 */
export function anchoredGround(
  ground: MushroomGround,
  anchor: Eye,
): MushroomGround {
  if (sameAnchor(anchor, ground.anchor)) return ground;
  const kept = anchoredGrounds.get(ground);
  if (kept && sameAnchor(anchor, kept.anchor)) return kept;
  const made = { ...ground, anchor };
  anchoredGrounds.set(ground, made);
  return made;
}

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

/** How big, in the clump's size, a mushroom stands as the clump's `opening`th, or as the forest. */
const sizeAs = (opening: number | undefined): number =>
  opening === undefined ? FOREST_SIZE : (CLUMP_SIZES[opening] ?? 1);

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
  const splay = opening === undefined ? FOREST_SPLAY : CLUMP_SPLAY;
  return standOn(camera, ground, sizeAs(opening), lean * splay);
}

/** How big, in the clump's size, a mushroom on `foot` stands on the ground, before depth scales it. */
export const sizeOn = (foot: Point): number => sizeAs(openingIndex(foot));

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
 * The ground under the stored `foot` in the world `ground` lays out, as its
 * anchor sees it, or `undefined` in the sliver straight behind the anchor,
 * which the layout has no ground for.
 */
export function groundIn(
  { anchor }: MushroomGround,
  foot: Point,
): Ground | undefined {
  const seen = sameAnchor(anchor, OPENING_EYE) ? foot : anchored(anchor, foot);
  return gathered(seen).y > 0 ? groundOfPlane(seen) : undefined;
}

/**
 * Where `mushroom` stands in the world `ground` lays out, as its anchor sees
 * it, or `undefined` where its foot stands outside that world: one of the
 * opening clump at the clump's size and splay wherever it stands, the rest as
 * the forest.
 */
export function placeIn(
  ground: MushroomGround,
  footed: Footed,
): Placement | undefined {
  const at = groundIn(ground, footed.foot);
  if (!at) return undefined;
  const { camera } = ground;
  const place = placedAs(camera, at, footed.lean, openingIndex(footed.foot));
  const shown =
    place.x >= 0 &&
    place.x <= camera.world &&
    place.y >= camera.groundTop &&
    place.y <= camera.height;
  return shown ? place : undefined;
}

/**
 * Where a bed lays a mushroom out to paint it, once, and `opening`, how far
 * ahead of the eye, in the clump's size, it is laid, which the view scales
 * it from (`bedPlace`).
 */
export type Laid = Placement & { opening: number };

/**
 * The ground a mushroom grown off the opening clump is laid out on: the
 * clump's front foot's depth, straight ahead, in a frame of its own.
 */
const LAID_GROUND: Ground = { x: 0, z: 0 };

/**
 * Where a bed lays `footed` out to paint it (`Laid`): one of the opening clump
 * as the opening eye stands it; any other at the clump's distance in a frame
 * of its own, so it is painted once wherever it stands and the view scales it.
 */
export function laidOf(camera: Camera, footed: Footed): Laid {
  const opening = openingIndex(footed.foot);
  return opening === undefined
    ? {
        ...placedAs(camera, LAID_GROUND, footed.lean, undefined),
        opening: CLUMP_DISTANCE,
      }
    : {
        ...placedAs(camera, groundOfPlane(footed.foot), footed.lean, opening),
        opening: gathered(footed.foot).y,
      };
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
