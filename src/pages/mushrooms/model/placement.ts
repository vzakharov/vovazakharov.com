/**
 * Where a new mushroom's foot goes on the ground: Mitchell's best of a few
 * candidates, each drawn at random over the world's frame or the stretch of
 * it the screen shows, the one farthest
 * from every foot already standing — so a meadow fills evenly, never on a
 * grid, and each visit's differently. What a foot must keep to on the screen
 * is the scene's to judge (`admits`); nothing here knows how it is drawn.
 */

import type { Point } from './geometry';
import {
  type Eye,
  type Frame,
  type Framed,
  type Ground,
  planeOf,
  scaleAt,
  seen,
  unanchored,
} from './ground';
import { mulberry32, type Random } from './random';

/**
 * Where the opening clump's two fly agarics stand on the plane, back foot
 * then front: close together, the back one a step farther off, as in the
 * drawing, which lays them out at these feet on the ground.
 */
const OPENING_GROUND = [
  { x: 0, z: 0.24 },
  { x: -0.03, z: 0 },
] as const satisfies readonly [Ground, Ground];
export const OPENING_FEET: readonly [Point, Point] = [
  planeOf(OPENING_GROUND[0]),
  planeOf(OPENING_GROUND[1]),
];

/** Which way a mushroom leans for its whole life: its splay's sign. */
export type Lean = -1 | 1;

/** Where a mushroom stands for its whole life, on the plane, and which way it leans. */
export type Footed = { foot: Point; lean: Lean };

/** The opening pair as they stand, their stems crossing: the back one leaning left, the front one right. */
export const OPENING_FOOTING: readonly [Footed, Footed] = [
  { foot: OPENING_FEET[0], lean: -1 },
  { foot: OPENING_FEET[1], lean: 1 },
];

/**
 * A mushroom grown at `ground` in the layout anchored at `eye` (`anchored`):
 * its foot on the plane, and its lean by the side of that eye's line of
 * sight it grew on, fixed whichever eye later sees it.
 */
export function grownOn(eye: Eye, ground: Ground): Footed {
  return {
    foot: unanchored(eye, planeOf(ground)),
    lean: ground.x < 0 ? 1 : -1,
  };
}

/**
 * Which of `OPENING_FEET` `foot` is, or `undefined` for one the forest grew
 * on: by the stored numbers, which no conversion has rounded.
 */
export function openingIndex(foot: Point): number | undefined {
  const index = OPENING_FEET.findIndex(
    ({ x, y }) => x === foot.x && y === foot.y,
  );
  return index === -1 ? undefined : index;
}

/** How many candidates a pick weighs against each other: Mitchell's K. */
const CANDIDATES = 12;
/**
 * How many rounds of `CANDIDATES` a pick draws before it gives up, when
 * none of a round's is admitted.
 */
const ROUNDS = 32;
/**
 * How close, as a camera lays the ground out (`seen`), in the clump's size, a
 * foot comes to another mushroom's foot at the nearest.
 */
const FOOT_APART = 0.3;

/** How far apart two ground points stand as a camera lays them out. */
export function apartOnScreen(a: Ground, b: Ground): number {
  const [p, q] = [seen(a), seen(b)];
  return Math.hypot(p.x - q.x, p.y - q.y);
}

/**
 * A stretch across the ground as a camera lays it out (`seen`), in the
 * clump's size, from `left` to `right`.
 */
type Span = Record<'left' | 'right', number>;

/** How far across the frame a foot is drawn: all of it where absent. */
export type WithOptionalSpan = { within?: Span };

/** A ground point drawn evenly over `frame`, within `span`, as a camera lays it out. */
function drawnFoot(
  random: Random,
  { near, far }: Frame,
  { left, right }: Span,
): Ground {
  const z = near + random() * (far - near);
  return { x: (left + random() * (right - left)) / scaleAt(z), z };
}

export type Picking = Framed &
  WithOptionalSpan & {
    /** The feet already standing, which a new one stands clear of and as far from as it can. */
    feet: readonly Ground[];
    /**
     * Whether the scene can stand a mushroom at a foot — off every flower, and
     * whatever else the ground alone cannot tell.
     */
    admits: (foot: Ground) => boolean;
  };

/**
 * The foot the mushroom grown from `seed` takes: of each round's
 * `CANDIDATES` clear of every foot, the farthest from its nearest
 * foot that `admits` takes, or the next round's where it takes none;
 * `undefined` when no round's does. One seed and one meadow, one foot.
 */
export function pickFoot(
  seed: number,
  { frame, feet, admits, within }: Picking,
): Ground | undefined {
  const random = mulberry32(seed ^ 0x6f_07_5e);
  const span = {
    left: Math.max(-frame.across, within?.left ?? -Infinity),
    right: Math.min(frame.across, within?.right ?? Infinity),
  };
  const room = (foot: Ground) =>
    Math.min(Infinity, ...feet.map((other) => apartOnScreen(foot, other)));
  for (let round = 0; round < ROUNDS; round++) {
    const candidates = Array.from({ length: CANDIDATES }, () =>
      drawnFoot(random, frame, span),
    )
      .map((foot) => ({ foot, room: room(foot) }))
      .filter(({ room: apart }) => apart >= FOOT_APART)
      .toSorted((a, b) => b.room - a.room);
    const picked = candidates.find(({ foot }) => admits(foot));
    if (picked) return picked.foot;
  }
  return undefined;
}
