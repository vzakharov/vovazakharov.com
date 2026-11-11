import { roll } from '@/dice/shared/roll';

/** A hole's answer: the room `(x, y)` on floor `n + 1` that floor `n`'s hole drops into. */
const answer = roll.key({ n: roll.int, x: roll.big, y: roll.big });

/**
 * The hole commitment of floor `n`: lowercase hex SHA-256 of
 * `<seed>/hole/<n>/<x>/<y>`, the answer spelled by the same key schema `roll`
 * addresses its words with. SHA-256 rather than `roll`'s hash because nothing
 * may find the preimage from the digest; the planted commitments hold this
 * spelling byte for byte.
 */
export async function commitment(
  seed: string,
  n: number,
  x: bigint,
  y: bigint,
): Promise<string> {
  const preimage = new TextEncoder().encode(
    `${seed}/hole/${answer.segments({ n, x, y })}`,
  );
  const digest = await crypto.subtle.digest('SHA-256', preimage);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
