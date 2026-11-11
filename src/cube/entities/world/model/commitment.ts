import { roll, sealHash } from '@/dice/shared/roll';

/** A hole's answer: the room `(x, y)` on floor `n + 1` that floor `n`'s hole drops into. */
const answer = roll.key({ n: roll.int, x: roll.big, y: roll.big });

/**
 * The hole commitment of floor `n`: `sealHash` at `hole/<n>/<x>/<y>`. The
 * planted commitments hold this spelling byte for byte.
 */
export const commitment = async (
  seed: string,
  n: number,
  x: bigint,
  y: bigint,
): Promise<string> =>
  sealHash(seed)(`hole/${answer.segments({ n, x, y })}`);
