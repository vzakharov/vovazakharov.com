import { big, ONE, ZERO } from './big';
import { commitment } from './commitment';
import type { World } from './hole';

export type Room = { x: bigint; y: bigint };

const BYTE_BITS = 8;

/** Exactly `count` random bits as a non-negative integer. */
function bits(random: (bytes: Uint8Array) => void, count: number): bigint {
  const bytes = new Uint8Array(Math.ceil(count / BYTE_BITS));
  random(bytes);
  const all = bytes.reduce(
    (acc, byte) => (acc << big(BYTE_BITS)) | big(byte),
    ZERO,
  );
  return all & ((ONE << big(count)) - ONE);
}

const SEED_BITS = 64;

/**
 * Plants a world of `floors` floors: a random 64-bit seed, and for each floor
 * but the last a landing room, uniform on the next floor, committed to. The
 * answers are the landing rooms (`answers[n - 1]` on floor `n + 1`); the world
 * alone cannot yield them.
 */
export async function plant(
  floors: number,
  random: (bytes: Uint8Array) => void,
): Promise<{ world: World; answers: Room[] }> {
  const seed = bits(random, SEED_BITS).toString();
  const answers = Array.from({ length: floors - 1 }, (_, index) => ({
    x: bits(random, index + 1),
    y: bits(random, index + 1),
  }));
  const holes = await Promise.all(
    answers.map(async ({ x, y }, index) => commitment(seed, index + 1, x, y)),
  );
  return { world: { seed, holes }, answers };
}
