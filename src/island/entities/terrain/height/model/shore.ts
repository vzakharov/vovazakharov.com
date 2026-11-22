/**
 * The ground's shape where it meets the sea: the least height inland ground
 * keeps, the way ground under it comes to rest on it, and the dunes behind
 * the beach.
 */

/**
 * The least height inland ground keeps, approached with distance from the
 * coast and zero on it: where the relief's troughs would sink the land below
 * the sea, it levels out above it instead, so no sea shows inland and the
 * coastline stays the field's zero line. It stands over the shore's sand
 * (ground under 20 m) from ~260 m in, so only a beach is that low.
 */
export const LOWLAND_METRES = 65;
/** The distance inland over which the least height climbs to ~63% of it. */
export const LOWLAND_REACH_METRES = 700;
/**
 * How much wider than the lowland the band over the floor is where ground
 * under it is squeezed rather than cut: by `reach·(1 − reach)³` of it, widest
 * (a tenth) ~200 m in and gone two kilometres in. The deeper a trough, the
 * closer to the floor it lies, so a basin keeps its relief, smaller, and
 * shades.
 */
export const SQUEEZE_METRES = 200;

/** Where the dunes begin, metres inland: the beach before them is bare. */
const DUNES_FROM_METRES = 30;
/** The distance over which they rise to their full height. */
export const DUNES_RISE_METRES = 90;
/** Where they begin to die out inland, and over what distance they are gone. */
const DUNES_FADE_FROM_METRES = 500;
const DUNES_FADE_METRES = 1000;
/** The tallest dune, crest over trough. */
export const DUNE_METRES = 22;
/** The distance from one dune ridge to the next, along the way inland. */
export const DUNE_SPACING_METRES = 160;
/**
 * The share of a ridge's spacing its seaward side climbs over; the lee side
 * drops over the rest, a slip face near sand's angle of repose.
 */
const DUNE_WINDWARD = 0.7;
/** The steepest a ridge's height is, per ridge of phase. */
export const DUNE_STEEPEST = 1.5 / (1 - DUNE_WINDWARD);
/** How far, in ridges, a ridge line wanders from its distance to the shore. */
export const DUNE_SWAY = 1.3;
/** A ridge stands where `gap` is over this, at full height a span higher. */
const DUNE_GAP_FROM = -0.45;
export const DUNE_GAP_SPAN = 0.35;
/** Dunes stand on low ground: full under the first height, none a span up. */
const DUNES_UNDER_METRES = 90;
export const DUNES_UNDER_SPAN_METRES = 110;

/** The share of its full size a quantity reaches `distance` in: ~63% at `reach`. */
export const approach = (distance: number, reach: number) =>
  1 - Math.exp(-distance / reach);

/** A smooth 0→1 ramp over `[0, 1]`, flat past both ends. */
export const ramp = (t: number) =>
  t >= 1 ? 1 : t <= 0 ? 0 : t * t * (3 - 2 * t);

/**
 * The larger of `a` and `b`, rounded over a band `k` wide where they meet,
 * and exactly the larger outside it; never below either.
 */
export function smoothMax(a: number, b: number, k: number): number {
  const gap = k - Math.abs(a - b);
  return gap > 0 ? Math.max(a, b) + (gap * gap) / (4 * k) : Math.max(a, b);
}

/**
 * Ground `d` metres inland (positive) whose relief reads `height`, `broad` of
 * it from the octaves of `BROAD_METRES` and longer, with the octaves shorter
 * reaching `fineReach` together: `height` where it stands a band's width over
 * its `lowlandFloor`, and under that squeezed into the band: smooth and
 * order-preserving, never below the floor nor below `height`.
 */
export function restingGround(
  d: number,
  height: number,
  broad: number,
  fineReach: number,
) {
  const reach = approach(d, LOWLAND_REACH_METRES);
  const floor = lowlandFloor(d, broad, fineReach);
  const band =
    LOWLAND_METRES * reach + SQUEEZE_METRES * reach * (1 - reach) ** 3;
  const over = height - floor;
  return over >= band ? height : floor + band * Math.exp(over / band - 1);
}

/**
 * The least height ground `d` metres inland (positive) keeps over `broad`, its
 * height from the octaves of `BROAD_METRES` and longer: the broad relief, sunk
 * by up to `fineReach`, the shorter octaves' reach, with distance from the
 * coast and held over the lowland's least height. Near the coast it is the
 * broad relief itself, so fine troughs there bottom out on rolling ground; a
 * few kilometres in it lies below every trough.
 */
export function lowlandFloor(
  d: number,
  broad: number,
  fineReach: number,
): number {
  const reach = approach(d, LOWLAND_REACH_METRES);
  const lowland = LOWLAND_METRES * reach;
  return smoothMax(broad - fineReach * reach * reach, lowland, lowland);
}

/** The share of the dune belt left `d` metres inland: whole, then dying out. */
const beltAt = (d: number) =>
  1 - ramp((d - DUNES_FADE_FROM_METRES) / DUNES_FADE_METRES);

/** The share of its dunes ground standing `height` metres up keeps. */
export const dunesOver = (height: number) =>
  1 - ramp((height - DUNES_UNDER_METRES) / DUNES_UNDER_SPAN_METRES);

/**
 * How high the dunes behind the beach stand over the ground `d` metres inland
 * (positive), never negative: ridges along the shore, steeper inland. `swell`,
 * `sway` and `gap`, each in `[-1, 1]`, vary the ridges' height along the
 * shore, bend their lines across it and break them into runs.
 */
export function duneAt(
  d: number,
  swell: number,
  sway: number,
  gap: number,
): number {
  const along = ramp((d - DUNES_FROM_METRES) / DUNES_RISE_METRES) * beltAt(d);
  if (along === 0) return 0;
  const phase = d / DUNE_SPACING_METRES + DUNE_SWAY * sway;
  const across = phase - Math.floor(phase);
  const crest = ramp(
    across < DUNE_WINDWARD
      ? across / DUNE_WINDWARD
      : (1 - across) / (1 - DUNE_WINDWARD),
  );
  const standing = ramp((gap - DUNE_GAP_FROM) / DUNE_GAP_SPAN);
  return DUNE_METRES * along * (0.6 + 0.4 * swell) * standing * crest;
}

/** How far a rocky stretch's strip of sand reaches inland, thinning out. */
const ROCKY_SAND_METRES = 20;

/**
 * The share of sand in ground `d` metres inland (positive) standing `height`
 * metres up, from 0 to 1, on a stretch whose share of calm `calm` gives: on a
 * calm one 1 on the beach and across the dune belt, thinning with the dunes
 * inland and with height; on a rough one a strip at the water's edge; 0 past
 * them and at sea.
 */
export function sandAt(
  d: number,
  height: number,
  calm: () => number = () => 1,
): number {
  if (d <= 0) return 0;
  const belt = beltAt(d);
  if (belt === 0) return 0;
  const share = calm();
  const along = share * belt + (1 - share) * (1 - ramp(d / ROCKY_SAND_METRES));
  return along * dunesOver(height - DUNE_METRES);
}
