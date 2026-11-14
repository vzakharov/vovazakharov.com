import { SUN_DIR } from '@/cube/shared/cube-boundary';
import { smoothstep } from '@/cube/shared/lib/ease';

/**
 * The cumulus field, in kilometres. The sea under it is cut into square cells
 * along and across the wind, and a cell holds one cloud or none, standing
 * wholly inside it. The wind blows along the sun's bearing, and a lane either
 * side of that line through the island stays clear, so no cloud ever crosses
 * the island or the sun's beam to it: the sunlight the outside is lit by is
 * constant, and the clouds stand to either hand.
 */
export const CLOUDS = {
  /** Every cloud's flat underside, over the sea. */
  base: 1.1,
  /** No cloud's crown is higher. */
  ceiling: 5.4,
  /** A cell's side. */
  cell: 7,
  /** The field repeats over this many cells along the wind. */
  tileCells: 5,
  /** Whole tiles the field drifts down the wind in an hour. */
  tilesPerHour: 1,
  /** The share of cells that hold a cloud. */
  chance: 0.6,
  /** A cloud's footprint, from the many small to the few broad. */
  radius: { least: 0.7, most: 2 },
  /**
   * How far past its own radius a cloud's billows may reach, as a share of
   * it: the bound it is marched inside, which its cell contains.
   */
  bound: 1.7,
  /**
   * Lattice cells to a cloud's radius for the noise that billows it, the
   * broad swell and then the knobs on it, and cells to a tile for the grain
   * that frays its edge.
   */
  billow: [1.4, 4.3],
  grain: 350,
  /** How high the thin ice cloud lies, and how far off it is still drawn. */
  cirrus: 9.5,
  cirrusReach: 260,
  /** Across the wind: clear inside `clear`, the field's own cover past `full`. */
  lane: { clear: 5, full: 10 },
  /** No cloud is drawn farther off than this. */
  reach: 140,
  /** What a kilometre of the densest cloud takes out of a beam. */
  extinction: 40,
} as const;

/** The field's period along the wind. */
export const CLOUD_TILE = CLOUDS.cell * CLOUDS.tileCells;

const SECONDS_IN_HOUR = 3600;
const flat = Math.hypot(SUN_DIR[0], SUN_DIR[2]);

/** The wind's bearing on the ground: from the sun's side, away from it. */
export const WIND_AXIS = [-SUN_DIR[0] / flat, -SUN_DIR[2] / flat] as const;

/** Towards the sun, as the field's own axes hold it: along the wind, up, across. */
export const SUN_IN_FIELD = [-flat, SUN_DIR[1], 0] as const;

/** Kilometres the field drifts down the wind in a second. */
export const DRIFT_PER_SECOND =
  (CLOUD_TILE * CLOUDS.tilesPerHour) / SECONDS_IN_HOUR;

/** Kilometres the field has drifted down the wind, `seconds` into the hour. */
export const driftAt = (seconds: number): number => DRIFT_PER_SECOND * seconds;

/** The sun's beam to the island is inside the cloud slab up to this many km toward the sun. */
const BEAM_LEAVES = CLOUDS.ceiling / Math.tan(Math.asin(SUN_DIR[1]));

/**
 * Where along the sun's bearing the lane is open, in km toward the sun from
 * the island: fully between `open.behind` and `open.ahead`, which covers the
 * island and the whole of the beam's way through the slab, and shut past
 * `shut`, where a cloud bank may stand under the sun or opposite it.
 */
export const CLOUD_LANE = {
  open: { behind: -14, ahead: Math.ceil(BEAM_LEAVES) + 6 },
  shut: { behind: -45, ahead: Math.ceil(BEAM_LEAVES) + 40 },
} as const;

/**
 * The share of its size the lane leaves a cloud standing `toSun` km toward
 * the sun from the island and `across` km to the side; `ragged` in [0, 1] is
 * the cloud's own, which frays the lane's edge without ever reaching inside
 * its clear width.
 */
export const laneCover = (
  toSun: number,
  across: number,
  ragged: number,
): number => {
  const open =
    smoothstep(CLOUD_LANE.shut.behind, CLOUD_LANE.open.behind, toSun) *
    (1 - smoothstep(CLOUD_LANE.open.ahead, CLOUD_LANE.shut.ahead, toSun));
  const clear = CLOUDS.lane.clear * open;
  const edge =
    clear + (CLOUDS.lane.full - CLOUDS.lane.clear) * (0.35 + 0.65 * ragged);
  const lane = smoothstep(clear, edge, Math.abs(across));
  return 1 + (lane - 1) * smoothstep(0, 0.2, open);
};
