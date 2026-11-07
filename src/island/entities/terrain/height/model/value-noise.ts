/**
 * Seeded 2D value noise over the plane, in `[-1, 1]`, with a quintic fade so
 * a sum of octaves has continuous slope. Integer arithmetic only on the
 * lattice, so the same `(seed, layer, x, y)` gives the same value on every
 * engine.
 */

function hash(ix: number, iy: number, salt: number): number {
  let h = Math.imul(ix, 0x27_d4_eb_2d) ^ Math.imul(iy, 0x16_56_67_b1) ^ salt;
  h = Math.imul(h ^ (h >>> 15), 0x85_eb_ca_6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2_b2_ae_35);
  h ^= h >>> 16;
  // The top 24 bits, mapped onto [-1, 1].
  return (h >>> 8) / 0x7f_ff_ff - 1;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * The salt that keys one noise layer: distinct `(seed, layer)` pairs give
 * unrelated lattices. `seed` is read as a 32-bit integer.
 */
export function noiseSalt(seed: number, layer: number): number {
  return Math.imul(seed, 0x9e_37_79_b1) ^ Math.imul(layer + 1, 0x63_2b_e5_ab);
}

/** Value noise at lattice coordinates `(u, v)` (one lattice step per unit). */
export function valueNoise(salt: number, u: number, v: number): number {
  const fu = Math.floor(u);
  const fv = Math.floor(v);
  const tu = fade(u - fu);
  const tv = fade(v - fv);
  const a = hash(fu, fv, salt);
  const b = hash(fu + 1, fv, salt);
  const c = hash(fu, fv + 1, salt);
  const d = hash(fu + 1, fv + 1, salt);
  const bottom = a + (b - a) * tu;
  const top = c + (d - c) * tu;
  return bottom + (top - bottom) * tv;
}
