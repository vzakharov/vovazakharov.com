/**
 * The ground a screen stands the meadow's things on, as an eye judges it:
 * every stored foot moved with that eye onto `OPENING_EYE` (`anchored`), so a
 * rule that reads the opening layout judges what the eye sees.
 */

import type { Point } from '../lib/geometry';
import { sameAnchor } from './anchor';
import {
  anchored,
  type Camera,
  type Eye,
  type Frame,
  gathered,
  type Ground,
  groundOfPlane,
  OPENING_EYE,
} from './ground';

/** How the mushrooms stand, each by its foot (`placeIn`), as the opening eye judges them (`anchoredGround`). */
export type ClumpGround = { mushrooms: MushroomGround };

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
