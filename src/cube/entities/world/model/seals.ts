import { roll, sealWith } from '@/dice/shared/roll';

/**
 * A world's seals. `hole.at({ n, x, y })` commits floor `n`'s hole to the room
 * `(x, y)` on floor `n + 1` it drops into; the planted commitments hold its
 * spelling byte for byte.
 */
export const seals = (seed: string) =>
  sealWith(seed, { hole: roll.key({ n: roll.int, x: roll.big, y: roll.big }) });
