// MurmurHash3 (x86, 32-bit): the world number's digits hash to a 64-bit key
// under two seeds, and word `i` is MurmurHash3 of the 12-byte message
// `key₀, key₁, i` (little-endian) under seed 0 — counter mode over the key.

const C1 = 0xcc_9e_2d_51;
const C2 = 0x1b_87_35_93;
const KEY_SEEDS = [0x97_47_b2_8c, 0x5b_d1_e9_95] as const;

const rotl = (x: number, r: number) => (x << r) | (x >>> (32 - r));

const scramble = (k: number) => Math.imul(rotl(Math.imul(k, C1), 15), C2);

/** One 4-byte block folded into the running hash. */
const block = (h: number, k: number) =>
  (Math.imul(rotl(h ^ scramble(k), 13), 5) + 0xe6_54_6b_64) >>> 0;

function finalize(h: number, length: number): number {
  let x = h ^ length;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85_eb_ca_6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2_b2_ae_35);
  x ^= x >>> 16;
  return x >>> 0;
}

/** MurmurHash3_x86_32 of `bytes` under `seed`, as an unsigned 32-bit integer. */
export function murmur3(bytes: Uint8Array, seed: number): number {
  const byte = (n: number) => bytes[n] ?? 0;
  const whole = bytes.length & ~3;
  let h = seed >>> 0;
  for (let n = 0; n < whole; n += 4) {
    h = block(
      h,
      byte(n) | (byte(n + 1) << 8) | (byte(n + 2) << 16) | (byte(n + 3) << 24),
    );
  }
  let tail = 0;
  for (let n = bytes.length - 1; n >= whole; n -= 1) {
    tail = (tail << 8) | byte(n);
  }
  if (bytes.length > whole) h ^= scramble(tail);
  return finalize(h, bytes.length);
}

const WORLD_NUMBER = /^[1-9]\d*$/;

/**
 * Throws unless `world` is a positive integer's decimal string with no
 * leading zeros, of any length: the number is hashed whole as text, so `"07"`
 * and `"7"` would otherwise be two worlds.
 */
export function assertWorldNumber(world: string): void {
  if (!WORLD_NUMBER.test(world)) {
    throw new Error(`Not a world number: ${JSON.stringify(world)}`);
  }
}

/** `H(N, ·)`: word `i` (an integer in `[0, 2^32)`) of world `N`'s hash. */
export function worldHash(world: string): (i: number) => number {
  assertWorldNumber(world);
  const digits = Uint8Array.from(world, (c) => c.codePointAt(0) ?? 0);
  const [k0, k1] = KEY_SEEDS.map((seed) => murmur3(digits, seed));
  const keyed = block(block(0, k0 ?? 0), k1 ?? 0);
  return (i) => finalize(block(keyed, i), 12);
}
