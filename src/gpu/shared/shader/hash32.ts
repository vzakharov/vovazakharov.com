/** The WGSL `mix32` in TypeScript: the same finalizer, word for word. */
export function mix32(x: number): number {
  let h = x >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7f_eb_35_2d) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x84_6c_a6_8b) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/** The WGSL `hashOf` in TypeScript: `a` and `b` hashed into one word. */
export const hashOf = (a: number, b: number): number =>
  mix32((a ^ mix32(b + 0x9e_37_79_b9)) >>> 0);

/** The WGSL `unitOf` in TypeScript: a word as a number in `[0, 1)`. */
export const unitOf = (word: number): number => (word >>> 8) / 2 ** 24;
