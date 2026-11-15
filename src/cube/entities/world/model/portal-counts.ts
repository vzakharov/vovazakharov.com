import { DEEPEST_FLOOR } from './maze';
import type { Floored } from './room';

/**
 * How many portals a floor holds and where they lead. The numbers come from
 * the portal analysis on the cube board (stickies `p-go-net`, `p-go-minute`).
 */
export const PORTALS = {
  /** The first floor with portals: all of its are hubs, having nothing above. */
  first: 6,
  /** The last floor: all of its are spokes, having nothing below. */
  last: DEEPEST_FLOOR,
  /** One portal per this many rooms: ~15.5 rooms a door, one door in 60 a portal. */
  roomsPerPortal: 960n,
  /** How long a hub leads to one place, every hub turning on the same tick. */
  periodMs: 60_000,
} as const;

export const hasPortals = (n: number): boolean =>
  Number.isInteger(n) && n >= PORTALS.first && n <= PORTALS.last;

/** How many portals floor `n` holds, numbered from 0: hubs first, then spokes. */
export function portalCount(n: number): bigint {
  if (!hasPortals(n)) return 0n;
  const per = PORTALS.roomsPerPortal;
  const rounded = ((1n << BigInt(2 * (n - 1))) + per / 2n) / per;
  return rounded < 1n ? 1n : rounded;
}

/** How much a hub's roll weighs floor `n`: a quarter of the floor above it. */
export const dropWeight = (n: number): bigint =>
  1n << BigInt(2 * (PORTALS.last - n));

/**
 * The mean floors a hub of floor `n` drops: `k` floors down weighs `4^−k`, the
 * law a spoke's climb already follows, each floor holding four times the hubs
 * of the one above.
 */
function meanDrop(n: number): number {
  let weight = 0;
  let sum = 0;
  for (let k = 1; k <= PORTALS.last - n; k += 1) {
    weight += 4 ** -k;
    sum += k * 4 ** -k;
  }
  return sum / weight;
}

/** The fixed-point scale a hub share is rounded at before it meets a `bigint`. */
const SHARE_SCALE = 1e12;

type Counts = { hubs: bigint; above: bigint };

/**
 * Each floor's hubs, and the hubs on all floors above it. A floor's hub share
 * is the one at which a portal picked at random moves a player down as far as
 * up, `share · drop = (1 − share) · climb`, `climb` being how far a spoke of
 * the floor lifts on average. It is cut where the floor would otherwise keep
 * fewer spokes than there are hubs above, so every hub has a spoke on every
 * floor below it.
 */
const COUNTS: ReadonlyMap<number, Counts> = (() => {
  const counts = new Map<number, Counts>();
  let above = 0n;
  // The hubs above as a float, and the sum of their floors, for the mean climb.
  let [hubsAbove, floorsAbove] = [0, 0];
  for (let n: number = PORTALS.first; n <= PORTALS.last; n += 1) {
    const portals = portalCount(n);
    let hubs = portals;
    if (n === PORTALS.last) hubs = 0n;
    else if (n > PORTALS.first) {
      const climb = n - floorsAbove / hubsAbove;
      const share = climb / (climb + meanDrop(n));
      const scale = BigInt(SHARE_SCALE);
      const scaled = BigInt(Math.round(share * SHARE_SCALE));
      hubs = (2n * portals * scaled + scale) / (2n * scale);
      const room = portals > above ? portals - above : 0n;
      if (hubs > room) hubs = room;
    }
    counts.set(n, { hubs, above });
    above += hubs;
    hubsAbove += Number(hubs);
    floorsAbove += Number(hubs) * n;
  }
  return counts;
})();

/** How many of floor `n`'s portals are hubs, which lead down. */
export const hubCount = (n: number): bigint => COUNTS.get(n)?.hubs ?? 0n;

/** How many of floor `n`'s portals are spokes, which lead up. */
export const spokeCount = (n: number): bigint => portalCount(n) - hubCount(n);

/** How many hubs the floors above `n` hold between them. */
export const hubsAbove = (n: number): bigint => COUNTS.get(n)?.above ?? 0n;

/** A portal's number among its floor's portals, or a hub's among its hubs. */
export type Numbered = { number: bigint };

/** A hub by its floor and its number there. */
type Hub = Floored & Numbered;

/** Hub `number` of floor `n`, numbered among every hub from the first floor down. */
export const globalOf = ({ n, number }: Hub): bigint => hubsAbove(n) + number;

/** `globalOf`'s inverse. */
export function hubAt(global: bigint): Hub {
  for (let n: number = PORTALS.first; n < PORTALS.last; n += 1) {
    const number = global - hubsAbove(n);
    if (number < hubCount(n)) return { n, number };
  }
  throw new RangeError(`No hub ${global}`);
}

/** An arithmetic run of spoke numbers: `first`, `first + step`, …, `count` of them. */
type Run = { first: bigint; step: bigint; count: bigint };

/**
 * Floor `n`'s spokes that lead to `hub`, a hub above it. Spoke `j` leads to
 * the hub numbered `j mod hubsAbove(n)` globally, so a hub finds its spokes on
 * any floor by arithmetic, listing nobody's.
 */
export function spokesOf(hub: Hub, n: number): Run {
  const first = globalOf(hub);
  const step = hubsAbove(n);
  const spokes = spokeCount(n);
  const count = spokes > first ? (spokes - first + step - 1n) / step : 0n;
  return { first, step, count };
}

/** The hub that spoke `spoke` of floor `n` leads to. */
export const hubOf = (n: number, spoke: bigint): Hub =>
  hubAt(spoke % hubsAbove(n));
