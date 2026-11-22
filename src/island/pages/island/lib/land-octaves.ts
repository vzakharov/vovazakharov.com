import type { Vec3 } from '@/island/shared/globe';

/**
 * The scales the land's surface is drawn at: lattices of noise in space, one
 * per octave, each turned its own way so no two line up, none a multiple of
 * another so their sum never repeats.
 */

/** A lattice's cells wrap after this many, so a cell's number is exact in a float. */
export const LATTICE_WRAP = 4096;

/** One lattice: its cell's width in metres, and the rows of the turn into its axes. */
export type LandOctave = {
  readonly cell: number;
  readonly rows: readonly [Vec3, Vec3, Vec3];
};

/** The rotation by `angle` about unit `axis`, as rows. */
function turnAbout([x, y, z]: Vec3, angle: number): LandOctave['rows'] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}

/**
 * Cell widths, metres, coarsest first: four the eye reads as country from
 * above, two as fields and slopes, four as the ground underfoot.
 */
const CELLS = [
  174_800, 35_834, 7646, 1475, 291, 64.7, 13.4, 2.796, 0.54, 0.111,
] as const;

export const LAND_OCTAVES: readonly LandOctave[] = CELLS.map((cell, i) => {
  const raw: Vec3 = [
    Math.sin(i * 2.4 + 0.5),
    Math.cos(i * 1.7),
    Math.sin(i * 0.9 + 1),
  ];
  const length = Math.hypot(...raw);
  const axis: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length];
  return { cell, rows: turnAbout(axis, 0.7 + i * 1.1) };
});

/**
 * The wind's ripples on dry sand: the way the wind blows, a unit vector in the
 * planet's axes, and a ripple's length, metres.
 */
export const SAND_RIPPLE = {
  wind: [0.6, 0.1, 0.793_725] as Vec3,
  length: 0.11,
} as const;

/**
 * Where `eye` — metres from the planet's centre — lies along the sand's
 * ripples, as the share of one ripple, taken in float64 for the reason
 * `anchorOf` is.
 */
export function ripplePhaseOf(eye: Vec3): number {
  const { wind, length } = SAND_RIPPLE;
  const ripples =
    (wind[0] * eye[0] + wind[1] * eye[1] + wind[2] * eye[2]) / length;
  return ripples - Math.floor(ripples);
}

const wrapped = (cells: number) =>
  ((cells % LATTICE_WRAP) + LATTICE_WRAP) % LATTICE_WRAP;

/**
 * Where `eye` — metres from the planet's centre — lies in `octave`'s lattice,
 * in cells modulo `LATTICE_WRAP`, taken in float64: a fragment's place is this
 * plus its turned offset from the eye, so it is finest where the eye is
 * nearest, anywhere on the planet.
 */
export function anchorOf(eye: Vec3, { cell, rows }: LandOctave): Vec3 {
  const along = (row: Vec3) =>
    wrapped((row[0] * eye[0] + row[1] * eye[1] + row[2] * eye[2]) / cell);
  return [along(rows[0]), along(rows[1]), along(rows[2])];
}
