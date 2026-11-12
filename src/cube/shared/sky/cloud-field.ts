import { SUN_DIR } from '../outside/sun';

/**
 * The cumulus field, in kilometres. The wind blows along the sun's bearing,
 * and a lane either side of that line through the island stays clear, so no
 * cloud ever crosses the island or the sun's beam to it: the sunlight the
 * outside is lit by is constant, and the clouds stand to either hand.
 */
export const CLOUDS = {
  /** The slab clouds live in, over the sea. */
  base: 1.1,
  top: 5.6,
  /** The field repeats this far along the wind. */
  tile: 36,
  /** Whole tiles the field drifts down the wind in an hour. */
  tilesPerHour: 1,
  /**
   * Lattice cells to a tile for each noise, coarsest first: where clouds
   * stand, how they billow, and the grain that wears their edge. Whole
   * numbers, so each repeats with the tile.
   */
  cover: [5, 12, 30],
  billow: [20, 48],
  grain: 120,
  /**
   * The grain repeats over this many of its cells upward, and rises through
   * that many in an hour.
   */
  grainRise: 16,
  /** How high the thin ice cloud lies. */
  cirrus: 9.5,
  /** Across the wind: clear inside `clear`, the field's own cover past `full`. */
  lane: { clear: 5.5, full: 9 },
  /** No cloud is drawn farther off than this. */
  reach: 160,
  /** What a kilometre of the densest cloud takes out of a beam. */
  extinction: 40,
} as const;

const SECONDS_IN_HOUR = 3600;
const flat = Math.hypot(SUN_DIR[0], SUN_DIR[2]);

/** The wind's bearing on the ground: from the sun's side, away from it. */
export const WIND_AXIS = [-SUN_DIR[0] / flat, -SUN_DIR[2] / flat] as const;

/** Kilometres the field has drifted down the wind, `seconds` into the hour. */
export const driftAt = (seconds: number): number =>
  (CLOUDS.tile * CLOUDS.tilesPerHour * seconds) / SECONDS_IN_HOUR;

/** Cells of its own the grain has risen, `seconds` into the hour. */
export const grainRiseAt = (seconds: number): number =>
  (CLOUDS.grainRise * seconds) / SECONDS_IN_HOUR;

/** How far across the wind a point (x east, z south, km from the island) lies. */
export const acrossWind = (x: number, z: number): number =>
  x * -WIND_AXIS[1] + z * WIND_AXIS[0];

const smoothstep = (a: number, b: number, x: number): number => {
  const c = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return c * c * (3 - 2 * c);
};

/** The sun's beam to the island is inside the cloud slab between these km toward the sun. */
const BEAM = {
  enters: CLOUDS.base / Math.tan(Math.asin(SUN_DIR[1])),
  leaves: CLOUDS.top / Math.tan(Math.asin(SUN_DIR[1])),
};

/**
 * Where along the sun's bearing the lane is open, in km toward the sun from
 * the island: fully between `open.behind` and `open.ahead`, which covers the
 * island and the whole of the beam's way through the slab, and shut past
 * `shut`, where a cloud bank may stand under the sun or opposite it.
 */
export const LANE = {
  open: { behind: -14, ahead: Math.ceil(BEAM.leaves) + 6 },
  shut: { behind: -45, ahead: Math.ceil(BEAM.leaves) + 40 },
} as const;

/**
 * The share of the field's cover the lane leaves at a point `toSun` km
 * toward the sun from the island and `across` km to the side; `ragged` in
 * [0, 1] is the weather's own unevenness there, which frays the lane's edge
 * without ever reaching inside its clear width.
 */
export const laneCover = (
  toSun: number,
  across: number,
  ragged: number,
): number => {
  const open =
    smoothstep(LANE.shut.behind, LANE.open.behind, toSun) *
    (1 - smoothstep(LANE.open.ahead, LANE.shut.ahead, toSun));
  const clear = CLOUDS.lane.clear * open;
  const edge =
    clear + (CLOUDS.lane.full - CLOUDS.lane.clear) * (0.35 + 0.65 * ragged);
  const lane = smoothstep(clear, edge, Math.abs(across));
  return 1 + (lane - 1) * smoothstep(0, 0.2, open);
};
