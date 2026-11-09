import { pathHash } from './hash';
import { roll, type Rolled, rollWith, type TableIndex } from './roll';

/** The series' degree `L`: `(L + 1)² = 262,144` coefficients. */
export const DEGREE = 511;

/** A harmonic's degree `l` and order `m`, `|m| ≤ l`. */
export type Harmonic = { l: number; m: number };

/**
 * `(l, m)` for `1 ≤ l ≤ degree`, `|m| ≤ l`, spelled `<l>/<m>`, at slot
 * `l² + l + m − 1`: the series' own slot for it, less the mean's.
 */
export function harmonicIndex(degree: number): TableIndex<Harmonic> {
  return {
    size: (degree + 1) ** 2 - 1,
    slotOf: ({ l, m }) =>
      l >= 1 && l <= degree && Math.abs(m) <= l ? l * l + l + m - 1 : -1,
    segmentsAt: (slot) => {
      const l = Math.floor(Math.sqrt(slot + 1));
      return `${l}/${slot + 1 - l * l - l}`;
    },
  };
}

/**
 * A world's parameters: the land's series — `sea` its mean, `harmonic` every
 * other coefficient, each a unit normal the land's envelope scales — and the
 * value noise's seed.
 */
export const worldSchema = (degree = DEGREE) =>
  roll.struct({
    land: roll.struct({
      sea: roll.normal(),
      harmonic: roll.table(harmonicIndex(degree), roll.normal()),
    }),
    noise: roll.struct({ seed: roll.word() }),
  });

export type World = Rolled<ReturnType<typeof worldSchema>>;

/** World `N` as `H(N, ·)` rolls it. */
export const rollWorld = (world: string, degree = DEGREE): World =>
  rollWith(worldSchema(degree), pathHash(world));
