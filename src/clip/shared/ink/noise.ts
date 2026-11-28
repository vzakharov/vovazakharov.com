/** Two integers mixed into an unsigned 32-bit one, by MurmurHash3's finalizer. */
function mix(a: number, b: number): number {
  let x = Math.imul(a ^ 0x9e_37_79_b9, 0x85_eb_ca_6b) ^ b;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85_eb_ca_6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2_b2_ae_35);
  x ^= x >>> 16;
  return x >>> 0;
}

/** A fixed number in `[-1, 1)` for each `(seed, n)` pair of integers. */
export const noise = (seed: number, n: number): number =>
  mix(seed, n) / 0x80_00_00_00 - 1;

/** A fixed integer for each `(seed, n)` pair: a seed for whatever `n` names. */
export const reseed = (seed: number, n: number): number => mix(seed, n);

/** A repeatable sequence of numbers in `[0, 1)`: the same seed, the same run. */
export function rng(seed: number): () => number {
  let n = 0;
  return () => {
    n += 1;
    return mix(seed, n) / 0x1_00_00_00_00;
  };
}
