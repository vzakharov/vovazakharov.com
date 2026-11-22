/** The numbers `reliefAt` shapes the ground with, and what follows from them. */
import {
  type Kind,
  KINDS,
  LONGEST_WAVELENGTH_METRES,
  type Octave,
  REGIONAL_METRES,
} from './octaves';
import { DUNE_METRES } from './shore';

/** The interior's base height, approached with distance from the coast. */
export const PLATEAU_METRES = 250;
/** The distance inland over which the plateau climbs to ~63% of its height. */
export const PLATEAU_REACH_METRES = 180_000;

/**
 * The height an inland basin's floor is held near, approached with distance
 * from the coast: where the regional octaves would sink the land to the sea
 * or under it, the broad relief levels out here instead, high enough that
 * the hills on it clear the lowland floor and the basin is rolling ground.
 */
export const BASIN_METRES = 220;
export const BASIN_REACH_METRES = 2000;
/** The band of broad relief over which a basin's floor is rounded in. */
export const BASIN_ROUNDING_METRES = 240;

/** The ocean's depth far from the coast. */
export const ABYSS_METRES = 3500;
/** The distance offshore over which the sea floor falls to ~63% of it. */
export const SHELF_REACH_METRES = 30_000;

/** How high a mountain belt lifts the broad relief along its middle. */
export const UPLIFT_METRES = 1250;
/** The distance inland over which a belt's uplift grows to its full size. */
export const UPLIFT_REACH_METRES = 100_000;

/**
 * How much of the regional octaves survives at the coast and at sea. The
 * shorter octaves keep their full size everywhere, faded only near the
 * coastline, so every lowland has hills.
 */
export const COASTAL_ROUGHNESS = 0.25;
/** The distance inland over which the noise grows to ~63% of its full size. */
export const ROUGHNESS_REACH_METRES = 300_000;
/**
 * The distance from the shore over which the land's hill band grows to its
 * full size, whatever an octave's wavelength: hills stand a walk from the
 * beach. At sea each octave takes a wavelength of its own, so none lifts the
 * sea floor out of the water.
 */
export const HILLS_RISE_METRES = 1500;
/**
 * The distance from the shore over which a kind's lift over the broad relief
 * and its cut along the lines grow in: nearer, the ground is the hill
 * octaves' own roll, low enough to meet the beach.
 */
export const LIFT_RISE_METRES = 6000;
/** Where the broad relief turns from green to brown ground, and to alpine. */
export const BROWN_FROM_METRES = 300;
export const BROWN_BY_METRES = 550;
export const ALPINE_FROM_METRES = 600;
export const ALPINE_BY_METRES = 1100;

/**
 * The octaves whose noise varies the dunes' height, bends their lines and
 * breaks them along the shore.
 */
export const DUNE_SWELL_INDEX = 9;
export const DUNE_SWAY_INDEX = 10;
export const DUNE_GAP_INDEX = 11;

/**
 * Green ground's hills shorter than this stand at full height only where the
 * longest hill octave's noise is high, and at `PLAIN_HILLS` of it where it is
 * low: hill country beside open vales, over the same broad ridges.
 */
export const VARIED_UNDER_METRES = 4000;
export const PLAIN_HILLS = 0.3;
export const HILLY_FROM = -0.25;
export const HILLY_SPAN = 0.5;

/** A knob of rock: the top of a fine octave's noise, flat-footed between. */
export const KNOB_FROM = 0.15;
export const KNOB_SPAN = 0.45;

export const total = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0);
export const most = (of: (kind: Kind) => number) =>
  Math.max(...KINDS.map((kind) => of(kind)));

const REGIONAL_REACH_METRES = total(REGIONAL_METRES);
/**
 * How far the fine band reaches on any ground, and so how far below the
 * broad relief the lowland floor sinks with distance from the coast.
 */
export const FINE_REACH_METRES = most(({ fine }) => total(fine));
/** The most a kind's hill band lifts its ground, and sinks it. */
export const peakOf = ({ lift, shelf, roll }: Kind) =>
  Math.max(lift * shelf, lift * (shelf - 1)) + total(roll);
export const troughOf = ({ lift, shelf, roll }: Kind) =>
  Math.max(-lift * shelf, lift * (1 - shelf)) + total(roll);

/** No ground lies higher than this, metres above sea level. */
export const HIGHEST_GROUND =
  PLATEAU_METRES +
  REGIONAL_REACH_METRES +
  UPLIFT_METRES +
  BASIN_ROUNDING_METRES / 4 +
  most(peakOf) +
  FINE_REACH_METRES +
  DUNE_METRES;
/** No ground lies lower than this, metres above sea level. */
export const LOWEST_GROUND =
  -ABYSS_METRES -
  COASTAL_ROUGHNESS * REGIONAL_REACH_METRES -
  most(troughOf) -
  FINE_REACH_METRES;

/** The distance from the shore over which an octave grows in on land. */
export const riseOf = ({ hill, wavelength }: Octave) =>
  hill ? Math.min(wavelength, HILLS_RISE_METRES) : wavelength;

export const wavelengthOf = (index: number) =>
  LONGEST_WAVELENGTH_METRES / 2 ** index;

/** The steepest the weight of a kind of ground is, per metre of broad relief. */
export const KIND_STEEPEST =
  1.5 / (BROWN_BY_METRES - BROWN_FROM_METRES) +
  1.5 / (ALPINE_BY_METRES - ALPINE_FROM_METRES);
