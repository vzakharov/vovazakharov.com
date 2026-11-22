/**
 * The noise octaves the relief is drawn from, and what each kind of ground
 * makes of them.
 */

/** The longest noise octave; each next one halves the wavelength. */
export const LONGEST_WAVELENGTH_METRES = 400_000;
/**
 * The regional octaves' amplitudes in metres, 400 km to 50 km: the broad
 * relief every kind of ground rides on.
 */
export const REGIONAL_METRES = [600, 380, 260, 200] as const;
/** The shortest octave of the hill band; the fine band lies under it. */
const HILL_METRES = 300;

/**
 * The hill band's octaves, 25 km to 400 m, as shares of the line field every
 * kind of ground is cut from: each half the one before, summing to one.
 */
const LINE = [64, 32, 16, 8, 4, 2, 1].map((share) => share / 127);
/**
 * How much of an octave's line is drawn from its own noise; the rest is the
 * noise of the octave before, whose lattice lies another way. Value noise
 * alone crosses zero along its lattice's cells, in straight runs that meet
 * at corners; the sum of two crosses it along neither.
 */
export const LINE_OWN = 0.6;
/** How far from zero that sum stands where the line has died out. */
export const LINE_WIDTH = 0.9;
/** How much of an octave's line the next one's lines keep to. */
export const LINE_GAIN = 2;
/** The least of itself an octave keeps away from the lines before it. */
export const LINE_LEAST = 0.1;
/** About what the line field averages over land. */
export const LINE_MEAN = 0.45;

/**
 * One kind of ground. Over the hill band it stands `lift · (shelf − L)` over
 * the broad relief, `L` the line field's shape in `[0, 1]`, plus the hill
 * octaves' own bumps, `roll[o]` metres each; under it, the fine band's
 * octaves, 200 m to 6 m, `fine[o]` metres each. A negative `lift` turns the
 * lines from valleys into crests.
 */
export type Kind = {
  readonly lift: number;
  readonly shelf: number;
  /** The steepest its shape of the line field is, per unit of the field. */
  readonly steepest: number;
  readonly roll: readonly number[];
  readonly fine: readonly number[];
};

/** Rounded hills, and valleys along the lines with gullies branching in. */
export const GREEN: Kind = {
  lift: 500,
  shelf: 0.3,
  steepest: 2,
  roll: [30, 80, 80, 55, 30, 14, 8],
  fine: [8, 4.5, 2.5, 1.3, 0.7, 0.35],
};
/** Broad shoulders and benches, the valleys cut narrow into them; outcrops. */
export const BROWN: Kind = {
  lift: 800,
  shelf: 0.2,
  steepest: 3,
  roll: [40, 90, 90, 60, 35, 18, 10],
  fine: [16, 10, 6, 3.5, 1.8, 0.9],
};
/** Crests along the lines with spurs branching off, over smooth floors. */
export const ALPINE: Kind = {
  lift: -3200,
  shelf: 0.45,
  steepest: 1,
  roll: [0, 0, 60, 50, 30, 16, 8],
  fine: [30, 16, 8, 4, 2, 1],
};
export const KINDS = [GREEN, BROWN, ALPINE] as const;

/** One noise octave; `index`, its place in `OCTAVES`, keys its lattice. */
export type Octave = {
  readonly index: number;
  readonly cyclesPerMetre: number;
  readonly wavelength: number;
  /** Its amplitude if it is regional, else zero. */
  readonly amplitude: number;
  readonly regional: boolean;
  readonly hill: boolean;
  /** Its share of the line field, zero outside the hill band. */
  readonly line: number;
  /** How many hill octaves are longer than it. */
  readonly hillRank: number;
  /** Its own amplitude on each kind of ground: its roll or its fine detail. */
  readonly green: number;
  readonly brown: number;
  readonly alpine: number;
};

const OCTAVE_COUNT =
  REGIONAL_METRES.length + GREEN.roll.length + GREEN.fine.length;

export const OCTAVES: readonly Octave[] = Array.from(
  { length: OCTAVE_COUNT },
  (_, o) => {
    const wavelength = LONGEST_WAVELENGTH_METRES / 2 ** o;
    const local = o - REGIONAL_METRES.length;
    const of = ({ roll, fine }: Kind) =>
      local < 0 ? 0 : (roll[local] ?? fine[local - roll.length] ?? 0);
    return {
      index: o,
      wavelength,
      cyclesPerMetre: 1 / wavelength,
      amplitude: REGIONAL_METRES[o] ?? 0,
      regional: local < 0,
      hill: local >= 0 && wavelength >= HILL_METRES,
      line: LINE[local] ?? 0,
      hillRank: Math.max(0, local),
      green: of(GREEN),
      brown: of(BROWN),
      alpine: of(ALPINE),
    };
  },
);

/** The hill band's longest wavelength. */
export const LONGEST_HILL_METRES =
  LONGEST_WAVELENGTH_METRES / 2 ** REGIONAL_METRES.length;
