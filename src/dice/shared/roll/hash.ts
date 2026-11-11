// MurmurHash3 (x86, 32-bit): the world number's digits hash to a 64-bit key
// under two seeds, and a word is MurmurHash3 under seed 0 of the key followed
// by its address — a 32-bit counter `i` (little-endian) or a path's UTF-8.

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

/**
 * MurmurHash3_x86_32 resumed from the state `h` after `before` bytes (a
 * multiple of 4), over the first `length` of `bytes`, then finalized.
 */
function resume(
  h: number,
  before: number,
  bytes: Uint8Array,
  length: number,
): number {
  const byte = (n: number) => bytes[n] ?? 0;
  const whole = length & ~3;
  let state = h;
  for (let n = 0; n < whole; n += 4) {
    state = block(
      state,
      byte(n) | (byte(n + 1) << 8) | (byte(n + 2) << 16) | (byte(n + 3) << 24),
    );
  }
  let tail = 0;
  for (let n = length - 1; n >= whole; n -= 1) {
    tail = (tail << 8) | byte(n);
  }
  if (length > whole) state ^= scramble(tail);
  return finalize(state, before + length);
}

/** MurmurHash3_x86_32 of `bytes` under `seed`, as an unsigned 32-bit integer. */
export const murmur3 = (bytes: Uint8Array, seed: number): number =>
  resume(seed >>> 0, 0, bytes, bytes.length);

// A number is hashed whole as text, so no leading zero: `"07"` and `"7"`
// would otherwise be two worlds.
const WORLD_NUMBER = /^(?:0|[1-9]\d*)$/;

/**
 * Whether `world` is a world the game opens: a non-negative integer's decimal
 * string with no leading zeros, of any length, `"0"` included.
 */
export const isWorldNumber = (world: string): boolean =>
  WORLD_NUMBER.test(world);

/** Throws unless `world` passes `isWorldNumber`. */
export function assertWorldNumber(world: string): void {
  if (!isWorldNumber(world)) {
    throw new Error(`Not a world number: ${JSON.stringify(world)}`);
  }
}

/** The hash state after the world's 8-byte key, `key₀, key₁`, under seed 0. */
function keyedState(world: string): number {
  const digits = Uint8Array.from(world, (c) => c.codePointAt(0) ?? 0);
  const [k0, k1] = KEY_SEEDS.map((seed) => murmur3(digits, seed));
  return block(block(0, k0 ?? 0), k1 ?? 0);
}

const KEY_BYTES = 8;

/** `H(N, ·)`: word `i` (an integer in `[0, 2^32)`) of world `N`'s hash. */
export function worldHash(world: string): (i: number) => number {
  assertWorldNumber(world);
  const keyed = keyedState(world);
  return (i) => finalize(block(keyed, i), KEY_BYTES + 4);
}

/**
 * `H(N, path)`: MurmurHash3 under seed 0 of `key₀, key₁` (little-endian) and
 * the UTF-8 bytes of `path`, the key derived from the number's digits as
 * `worldHash`'s is. `N` is any non-negative integer's decimal string with no
 * leading zeros, `"0"` included.
 */
export function pathHash(world: string): (path: string) => number {
  assertWorldNumber(world);
  const keyed = keyedState(world);
  const encoder = new TextEncoder();
  let buffer = new Uint8Array(64);
  return (path) => {
    // UTF-8 takes at most 3 bytes per UTF-16 unit.
    if (path.length * 3 > buffer.length) {
      buffer = new Uint8Array(path.length * 3);
    }
    const { written } = encoder.encodeInto(path, buffer);
    return resume(keyed, KEY_BYTES, buffer, written);
  };
}
