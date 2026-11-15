import { ascending, doorwayOf, unbarred } from './doorways';
import {
  drawBelow,
  EDGES,
  halfOf,
  type Partition,
  partitionKey,
  passageOf,
  type RolledMaze,
  spotOf,
  wallOf,
  WIDE_BITS,
} from './maze';
import { type Memo, memo } from './memo';
import {
  dropWeight,
  hasPortals,
  hubCount,
  hubOf,
  type Numbered,
  portalCount,
  PORTALS,
  spokesOf,
} from './portal-counts';
import type { InRoomOf } from './room';
import { type DoorWall, isInnerWall, isSameWall } from './wall-frame';

/**
 * The shallowest block level whose partitions may hold a portal: two walls an
 * arm, so one is left once the passage or a doorway has taken the other.
 */
const SITE_LEVEL = 2;

/** How many blocks of `level` floor `n` has along each side. */
const blocksAcross = (n: number, level: number): bigint =>
  1n << BigInt(n - 1 - level);

const sitesAt = (n: number, level: number): bigint =>
  4n * blocksAcross(n, level) ** 2n;

/** How many sites — partitions a portal may stand on — floor `n` has. */
export function siteCount(n: number): bigint {
  let total = 0n;
  for (let level = n - 1; level >= SITE_LEVEL; level -= 1) {
    total += sitesAt(n, level);
  }
  return total;
}

/** Site `index` of floor `n`: the top level first, its blocks row by row. */
export function siteAt(n: number, index: bigint): Partition {
  let rest = index;
  for (let level = n - 1; level >= SITE_LEVEL; level -= 1) {
    const count = sitesAt(n, level);
    if (rest < count) {
      const across = blocksAcross(n, level);
      const block = rest / 4n;
      const arm = EDGES[Number(rest % 4n)] ?? 'north';
      return { n, level, x: block % across, y: block / across, arm };
    }
    rest -= count;
  }
  throw new RangeError(`Floor ${n} has no site ${index}`);
}

/** `siteAt`'s inverse, for a partition of `SITE_LEVEL` or above. */
export function siteIndex({ n, level, x, y, arm }: Partition): bigint {
  let before = 0n;
  for (let above = n - 1; above > level; above -= 1) {
    before += sitesAt(n, above);
  }
  const block = y * blocksAcross(n, level) + x;
  return before + block * 4n + BigInt(EDGES.indexOf(arm));
}

/** A bijection on `[0, size)` and its inverse. */
type Permutation = {
  size: bigint;
  forward: (index: bigint) => bigint;
  inverse: (index: bigint) => bigint;
};

const ROUNDS = [0, 1, 2, 3] as const;

/**
 * Floor `n`'s keyed bijection between its sites and `[0, siteCount(n))`, so a
 * site and the number it carries are each found from the other without
 * listing anyone: a four-round Feistel network over the smallest even bit
 * width that holds them, walked until it lands inside.
 */
export function sitePermutation(rolled: RolledMaze, n: number): Permutation {
  const size = siteCount(n);
  let bits = 1n;
  while (1n << (2n * bits) < size) bits += 1n;
  const mask = (1n << bits) - 1n;
  const mix = (round: number, half: bigint): bigint => {
    const { high, low } = rolled.portal.mix.at({ n, round, half });
    return ((high << WIDE_BITS) | low) & mask;
  };
  const encode = (index: bigint): bigint => {
    let [left, right] = [index >> bits, index & mask];
    for (const round of ROUNDS) {
      [left, right] = [right, left ^ mix(round, right)];
    }
    return (left << bits) | right;
  };
  const decode = (index: bigint): bigint => {
    let [left, right] = [index >> bits, index & mask];
    for (const round of ROUNDS.toReversed()) {
      [left, right] = [right ^ mix(round, left), left];
    }
    return (left << bits) | right;
  };
  const walked = (step: (index: bigint) => bigint) => (index: bigint) => {
    let landed = step(index);
    while (landed >= size) landed = step(landed);
    return landed;
  };
  return { size, forward: walked(encode), inverse: walked(decode) };
}

/**
 * A door that leads to another floor: its wall, and its number among its
 * floor's portals. A hub leads down, to a spoke of its own that changes every
 * `PORTALS.periodMs`; a spoke leads up, always to its one hub.
 */
export type Portal = Numbered & { wall: DoorWall; isHub: boolean };

/**
 * The wall `partition`'s portal takes: uniform among its walls but the native
 * passage and the doorway, so a portal never stands where either does. A
 * `SITE_LEVEL` arm with a passage is never far enough round for a doorway, so
 * a wall is always left.
 */
function portalOffset(rolled: RolledMaze, partition: Partition): bigint {
  const barred = [passageOf(rolled, partition), doorwayOf(rolled, partition)]
    .filter((offset) => offset !== null)
    .toSorted(ascending);
  const allowed = halfOf(partition.level) - BigInt(barred.length);
  if (allowed <= 0n) {
    throw new Error(`No wall left for a portal: ${partitionKey(partition)}`);
  }
  const at = rolled.portal.wall.at(partition).at(partition.arm);
  return unbarred(drawBelow(at, allowed), barred);
}

function sited(rolled: RolledMaze, site: Partition, number: bigint): Portal {
  const { n } = site;
  const { across, x, y } = wallOf(site, portalOffset(rolled, site));
  const wall = { n, x, y, isEast: across === 'east' };
  return { wall, number, isHub: number < hubCount(n) };
}

/** Portal `number` of floor `n`, for a number under `portalCount(n)`. */
export function portalNumbered(
  rolled: RolledMaze,
  n: number,
  number: bigint,
): Portal {
  if (number < 0n || number >= portalCount(n)) {
    throw new RangeError(`Floor ${n} has no portal ${number}`);
  }
  const site = siteAt(n, sitePermutation(rolled, n).inverse(number));
  return sited(rolled, site, number);
}

const memos = new WeakMap<RolledMaze, Memo<Portal | null>>();

/** The portal standing on `site`, if its number falls among its floor's. */
function portalOn(rolled: RolledMaze, site: Partition): Portal | null {
  const kept = memos.get(rolled) ?? memo<Portal | null>();
  memos.set(rolled, kept);
  return kept(partitionKey(site), () => {
    const number = sitePermutation(rolled, site.n).forward(siteIndex(site));
    return number < portalCount(site.n) ? sited(rolled, site, number) : null;
  });
}

/** The portal on `wall`, or null: on a floor with none, or a wall without. */
export function portalAt(rolled: RolledMaze, wall: DoorWall): Portal | null {
  const { n, x, y, isEast } = wall;
  if (!hasPortals(n) || !isInnerWall(wall)) return null;
  const across = isEast ? 'east' : 'south';
  const { partition } = spotOf(n, { across, x, y });
  if (partition.level < SITE_LEVEL) return null;
  const found = portalOn(rolled, partition);
  return found && isSameWall(found.wall, wall) ? found : null;
}

/** The most portals `portalsOf` lists, which floor 12's 4369 still fit under. */
const LISTED_MOST = 2n ** 13n;

/** Every portal of floor `n` by number, for a floor shallow enough to list. */
export function portalsOf(rolled: RolledMaze, n: number): Portal[] {
  const count = portalCount(n);
  if (count > LISTED_MOST) {
    throw new RangeError(`Floor ${n} has ${count} portals, too many to list`);
  }
  return Array.from({ length: Number(count) }, (_, number) =>
    portalNumbered(rolled, n, BigInt(number)),
  );
}

/**
 * The floor a hub of floor `n` leads to, from its `draw`: one floor further
 * down weighs a quarter as much, the last floor taking what is left.
 */
function floorBelow(n: number, draw: bigint): number {
  let total = 0n;
  for (let m = n + 1; m <= PORTALS.last; m += 1) total += dropWeight(m);
  let rest = drawBelow(draw, total);
  for (let m = n + 1; m < PORTALS.last; m += 1) {
    if (rest < dropWeight(m)) return m;
    rest -= dropWeight(m);
  }
  return PORTALS.last;
}

function hubTarget(rolled: RolledMaze, hub: Portal, epochMs: number): Portal {
  const { number, wall } = hub;
  const { n } = wall;
  const epoch = Math.floor(epochMs / PORTALS.periodMs);
  const draws = rolled.portal.hub.at({ n, hub: number, epoch });
  const floor = floorBelow(n, draws.floor);
  const { first, step, count } = spokesOf({ n, number }, floor);
  if (count === 0n) {
    throw new Error(`Floor ${floor} has no spoke of hub ${n}/${number}`);
  }
  const spoke = first + drawBelow(draws.spoke, count) * step;
  return portalNumbered(rolled, floor, hubCount(floor) + spoke);
}

function spokeTarget(rolled: RolledMaze, { wall, number }: Portal): Portal {
  const hub = hubOf(wall.n, number - hubCount(wall.n));
  return portalNumbered(rolled, hub.n, hub.number);
}

/** The far end of a crossing: the portal come out of, and the room stood in. */
export type PortalTarget = InRoomOf & { portal: Portal };

/**
 * Where `portal` leads at `epochMs`, for one crossing it `toward` its east or
 * south room (1) or its west or north one (−1): the far portal, and the room
 * beyond it on the same side, so turning round in that room and crossing back
 * comes out in the room first left — while the hub still leads here.
 */
export function portalTarget(
  rolled: RolledMaze,
  portal: Portal,
  toward: 1 | -1,
  epochMs: number,
): PortalTarget {
  const far = portal.isHub
    ? hubTarget(rolled, portal, epochMs)
    : spokeTarget(rolled, portal);
  const { n, x, y, isEast } = far.wall;
  const step = toward === 1 ? 1n : 0n;
  const room = isEast ? { n, x: x + step, y } : { n, x, y: y + step };
  return { portal: far, room };
}
