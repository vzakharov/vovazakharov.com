import { DEEPEST_FLOOR } from './maze';
import { type Floored, roomsAcross } from './room';

/**
 * How many portals a floor holds and where they lead. The law of a jump is
 * the one picked on the cube simulations artifact's «Прыжок через 7» tab
 * («Вовин-2»), whose `jump-model.js` this module reproduces in integers.
 */
export const PORTALS = {
  /** The first floor with portals: all of its are hubs, having nothing above. */
  first: 6,
  /** The last floor: all of its are spokes, having nothing below. */
  last: DEEPEST_FLOOR,
  /** One portal per this many rooms: ~15.5 rooms a door, one door in 60 a portal. */
  roomsPerPortal: 960n,
  /**
   * The tempo a hub's target changes on, every hub on the same ticks: `ticks`
   * of them a `cycleMs` cycle, their rate swinging along a sine by `swing`
   * about its mean, fastest at the cycle's edges and slowest mid-cycle.
   */
  tempo: { cycleMs: 5000, ticks: 11, swing: 10.5 },
  /** Jumps peak at every multiple of this many floors, up and down alike. */
  peak: 7,
  /** Each floor off the nearest multiple makes a jump `num/den` times rarer. */
  offPeak: { num: 9n, den: 4n },
  /** Each further multiple is this many times rarer than the one before. */
  perMultiple: 4n,
} as const;

export const hasPortals = (n: number): boolean =>
  Number.isInteger(n) && n >= PORTALS.first && n <= PORTALS.last;

/** How many portals floor `n` holds, numbered from 0: hubs first, then spokes. */
export function portalCount(n: number): bigint {
  if (!hasPortals(n)) return 0n;
  const per = PORTALS.roomsPerPortal;
  const rounded = (roomsAcross(n) ** 2n + per / 2n) / per;
  return rounded < 1n ? 1n : rounded;
}

/** The longest jump there is, from the first floor to the last. */
const SPAN = PORTALS.last - PORTALS.first;
/** The most multiples of the peak a jump's weight sums. */
const MULTIPLES = Math.ceil(SPAN / PORTALS.peak) + 1;

/**
 * How much a jump of `d` floors weighs, up or down: the sum over the
 * multiples `j·peak` of `(den/num)^|j·peak − d| · perMultiple^−(j − 1)`, for
 * `j` up to `⌈d / peak⌉ + 1`. Scaled into a whole number, so only ratios of
 * weights mean anything — and no float power, which engines may round
 * differently, ever enters the world.
 */
function lawOf(d: number): bigint {
  const { peak, offPeak, perMultiple } = PORTALS;
  let weight = 0n;
  for (let j = 1; j <= Math.ceil(d / peak) + 1; j += 1) {
    const off = BigInt(Math.abs(j * peak - d));
    weight +=
      offPeak.den ** off *
      offPeak.num ** (BigInt(SPAN) - off) *
      perMultiple ** BigInt(MULTIPLES - j);
  }
  return weight;
}

const WEIGHTS: readonly bigint[] = Array.from({ length: SPAN + 1 }, (_, d) =>
  d === 0 ? 0n : lawOf(d),
);

/** `lawOf(d)`, for a jump the building has room for; 0 for any other. */
export const jumpWeight = (d: number): bigint => WEIGHTS[d] ?? 0n;

/** The mean of the law over jumps `d` for which `reaches(d)`, weighted by it. */
function meanJump(longest: number, reaches: (d: number) => boolean): number {
  let [weight, sum] = [0n, 0n];
  for (let d = 1; d <= longest; d += 1) {
    if (!reaches(d)) continue;
    weight += jumpWeight(d);
    sum += BigInt(d) * jumpWeight(d);
  }
  return weight === 0n ? 0 : Number(sum) / Number(weight);
}

/**
 * A floor's spokes, split into bands by how far up they lead: band `d` holds
 * a share of them in proportion to `jumpWeight(d)`, rounded by largest
 * remainder so the bands add up to the floor's spokes exactly. Spokes are
 * numbered band by band; `start[d]` is band `d`'s first.
 */
type Bands = { size: readonly bigint[]; start: readonly bigint[] };

function bandsOf(n: number, spokes: bigint): Bands {
  const climbs = Array.from({ length: n - PORTALS.first }, (_, i) => i + 1);
  const total = climbs.reduce((sum, d) => sum + jumpWeight(d), 0n);
  const size: bigint[] = [0n];
  const remainders: Array<[bigint, number]> = [];
  let left = spokes;
  for (const d of climbs) {
    const share = spokes * jumpWeight(d);
    size[d] = share / total;
    left -= share / total;
    remainders.push([share % total, d]);
  }
  remainders.sort(([a, d], [b, e]) => (a === b ? d - e : a > b ? -1 : 1));
  for (const [, d] of remainders) {
    if (left === 0n) break;
    size[d] = (size[d] ?? 0n) + 1n;
    left -= 1n;
  }
  const start: bigint[] = [0n];
  let at = 0n;
  for (const d of climbs) {
    start[d] = at;
    at += size[d] ?? 0n;
  }
  return { size, start };
}

const bandSize = (bands: Bands | undefined, d: number): bigint =>
  bands?.size[d] ?? 0n;

function lesser(a: bigint, b: bigint): bigint {
  if (a < b) return a;
  return b;
}

/**
 * The mean floors a hub of a floor with `hubs` hubs drops, over the hubs that
 * land anywhere: hub `g` reaches the floor `d` below only where that floor's
 * band `d` holds a spoke for it, `g < band`, and rolls the law over those.
 */
function meanDrop(hubs: bigint, bandsBelow: readonly bigint[]): number {
  const cuts = [...new Set(bandsBelow.map((band) => lesser(band, hubs)))]
    .filter((cut) => cut > 0n)
    .toSorted((a, b) => (a < b ? -1 : 1));
  let [previous, covered, drop] = [0n, 0, 0];
  for (const cut of cuts) {
    const mean = meanJump(bandsBelow.length - 1, (d) => {
      const band = bandsBelow[d];
      return band !== undefined && band >= cut;
    });
    const span = Number(cut - previous);
    covered += span;
    drop += span * mean;
    previous = cut;
  }
  return covered === 0 ? 0 : drop / covered;
}

/** The fixed-point scale a hub share is rounded at before it meets a `bigint`. */
const SHARE_SCALE = 1e12;
/** How many passes the hub counts may take to settle before that is a bug. */
const MOST_PASSES = 32;

type Network = { hubs: readonly bigint[]; bands: readonly Bands[] };

/**
 * Floor `m`'s hubs, given the bands of every floor below it: the share at
 * which a portal picked at random moves a player down as far as up,
 * `share · drop = (1 − share) · climb`, at least one hub on a floor of two
 * portals or more, and never more hubs than the widest band below holds
 * spokes for — so every hub lands somewhere.
 */
function hubsOf(m: number, guess: bigint, bands: readonly Bands[]): bigint {
  const portals = portalCount(m);
  const below = Array.from({ length: PORTALS.last - m + 1 }, (_, d) =>
    d === 0 ? 0n : bandSize(bands[m + d], d),
  );
  const climb = meanJump(m - PORTALS.first, () => true);
  const drop = meanDrop(guess, below);
  const share = climb / (climb + drop);
  const scale = BigInt(SHARE_SCALE);
  const scaled = BigInt(Math.round(share * SHARE_SCALE));
  let hubs = (2n * portals * scaled + scale) / (2n * scale);
  if (hubs < 1n && portals > 1n) hubs = 1n;
  let widest = 0n;
  for (const band of below) if (band > widest) widest = band;
  return lesser(lesser(hubs, widest), portals);
}

/**
 * One sweep from the bottom up: each floor's hubs from the bands below it,
 * then its own bands from its spokes. A hub's mean drop counts the hubs of
 * the sweep before, so the sweeps repeat until no floor's count moves.
 */
function sweep(guess: readonly bigint[]): Network {
  const { first, last } = PORTALS;
  const hubs: bigint[] = [];
  const bands: Bands[] = [];
  for (let n = last; n >= first; n -= 1) {
    const prior = guess[n] ?? 0n;
    if (n === last) hubs[n] = 0n;
    else if (n === first) hubs[n] = portalCount(n);
    else hubs[n] = hubsOf(n, prior, bands);
    bands[n] = bandsOf(n, portalCount(n) - (hubs[n] ?? 0n));
  }
  return { hubs, bands };
}

const NETWORK: Network = (() => {
  const { first, last } = PORTALS;
  let network = sweep(
    Array.from({ length: last + 1 }, (_, n) => portalCount(n) / 2n),
  );
  for (let pass = 1; pass <= MOST_PASSES; pass += 1) {
    const prior = network.hubs;
    const next = sweep(prior);
    const settled = next.hubs.every((hubs, n) => hubs === prior[n]);
    network = next;
    if (!settled) continue;
    // A band leads to the floor `d` above, so that floor must hold a hub.
    for (let n = first; n < last; n += 1) {
      if ((network.hubs[n] ?? 0n) < 1n)
        throw new Error(`Floor ${n} has no hub`);
    }
    return network;
  }
  throw new Error(`Hub counts did not settle in ${MOST_PASSES} passes`);
})();

/** How many of floor `n`'s portals are hubs, which lead down. */
export const hubCount = (n: number): bigint => NETWORK.hubs[n] ?? 0n;

/** How many of floor `n`'s portals are spokes, which lead up. */
export const spokeCount = (n: number): bigint => portalCount(n) - hubCount(n);

/** How many of floor `n`'s spokes climb `d` floors. */
export const climbBand = (n: number, d: number): bigint =>
  bandSize(NETWORK.bands[n], d);

/** A portal's number among its floor's portals, or a hub's among its hubs. */
export type Numbered = { number: bigint };

/** A hub by its floor and its number there. */
type Hub = Floored & Numbered;

/** An arithmetic run of spoke numbers: `first`, `first + step`, …, `count` of them. */
type Run = { first: bigint; step: bigint; count: bigint };

/**
 * Floor `n`'s spokes that lead to `hub`, a hub above it, numbered among the
 * floor's spokes. Spoke `i` of band `d` leads to hub `i mod hubCount(n − d)`,
 * so a hub finds its spokes on any floor by arithmetic, listing nobody's.
 */
export function spokesOf(hub: Hub, n: number): Run {
  const d = n - hub.n;
  const step = hubCount(hub.n);
  const size = climbBand(n, d);
  const start = NETWORK.bands[n]?.start[d] ?? 0n;
  const count =
    d >= 1 && size > hub.number ? (size - hub.number + step - 1n) / step : 0n;
  return { first: start + hub.number, step, count };
}

/** The hub that spoke `spoke` of floor `n` leads to. */
export function hubOf(n: number, spoke: bigint): Hub {
  const bands = NETWORK.bands[n];
  for (let d = 1; d <= n - PORTALS.first; d += 1) {
    const start = bands?.start[d] ?? 0n;
    if (spoke >= start && spoke < start + climbBand(n, d)) {
      return { n: n - d, number: (spoke - start) % hubCount(n - d) };
    }
  }
  throw new RangeError(`Floor ${n} has no spoke ${spoke}`);
}
