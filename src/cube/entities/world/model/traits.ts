import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

const Traits = roll.struct({
  room: roll.over(
    roll.key({ n: roll.int, x: roll.big, y: roll.big }),
    roll.struct({
      /** The word a room's surfaces grow their own stains and wear from. */
      grain: roll.word(),
      /** Where the room's lamps fall among its floor's: low is the first to fail. */
      lamp: roll.uniform(0, 1),
    }),
  ),
});

export type RolledTraits = Rolled<typeof Traits>;

/**
 * What every room under `seed` is like before its floor's theme reads it: one
 * draw per trait, so two viewers of a room see the same room.
 */
export const traits = (seed: string): RolledTraits =>
  rollWith(Traits, pathHash(seed));
