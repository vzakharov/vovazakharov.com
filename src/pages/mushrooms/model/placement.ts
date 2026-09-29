/**
 * Where a new mushroom's foot goes on the ground: Mitchell's best of a few
 * candidates, each drawn at random over the common frame, the one farthest
 * from every foot already standing — so a meadow fills evenly, never on a
 * grid, and each visit's differently. What a foot must keep to on the screen
 * is the scene's to judge (`admits`); nothing here knows how it is drawn.
 */

import { COMMON_FRAME, type Ground, scaleAt, seen } from './ground';
import { mulberry32, type Random } from './random';

/**
 * Where the opening clump's two fly agarics stand, back foot then front:
 * close together, the back one a step farther off, as in the drawing.
 */
export const OPENING_FEET = [
  { x: 0, z: 0.24 },
  { x: -0.03, z: 0 },
] as const satisfies readonly [Ground, Ground];

/** Where a mushroom stands for its whole life, on the ground. */
export type Footed = { foot: Ground };

/** Which of `OPENING_FEET` `foot` is, or `undefined` for one the forest grew on. */
export function openingIndex(foot: Ground): number | undefined {
  const index = OPENING_FEET.findIndex(
    ({ x, z }) => x === foot.x && z === foot.z,
  );
  return index === -1 ? undefined : index;
}

/** How many candidates a pick weighs against each other: Mitchell's K. */
const CANDIDATES = 12;
/**
 * How many rounds of `CANDIDATES` a pick draws before it gives up, when
 * none of a round's is admitted.
 */
const ROUNDS = 4;
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

/** A ground point drawn evenly over the common frame, as a camera lays it out. */
function drawnFoot(random: Random): Ground {
  const { across, near, far } = COMMON_FRAME;
  const z = near + random() * (far - near);
  return { x: ((random() * 2 - 1) * across) / scaleAt(z), z };
}

export type Picking = {
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
  { feet, admits }: Picking,
): Ground | undefined {
  const random = mulberry32(seed ^ 0x6f_07_5e);
  const room = (foot: Ground) =>
    Math.min(Infinity, ...feet.map((other) => apartOnScreen(foot, other)));
  for (let round = 0; round < ROUNDS; round++) {
    const candidates = Array.from({ length: CANDIDATES }, () =>
      drawnFoot(random),
    )
      .map((foot) => ({ foot, room: room(foot) }))
      .filter(({ room: apart }) => apart >= FOOT_APART)
      .toSorted((a, b) => b.room - a.room);
    const picked = candidates.find(({ foot }) => admits(foot));
    if (picked) return picked.foot;
  }
  return undefined;
}
