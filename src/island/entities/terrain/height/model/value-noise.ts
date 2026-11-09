/**
 * Seeded value noise in `[-1, 1]` over space, with a
 * quintic fade so a sum of octaves has continuous slope. Integer arithmetic
 * only on the lattice, so the same `(seed, layer, point)` gives the same value
 * on every engine.
 */

/** A lattice corner's mixed bits, mapped onto `[-1, 1]` by their top 24. */
function scramble(mixed: number): number {
  let h = Math.imul(mixed ^ (mixed >>> 15), 0x85_eb_ca_6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2_b2_ae_35);
  h ^= h >>> 16;
  return (h >>> 8) / 0x7f_ff_ff - 1;
}

const hash3 = (ix: number, iy: number, iz: number, salt: number) =>
  scramble(
    Math.imul(ix, 0x27_d4_eb_2d) ^
      Math.imul(iy, 0x16_56_67_b1) ^
      Math.imul(iz, 0x5b_d1_e9_95) ^
      salt,
  );

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * The salt that keys one noise layer: distinct `(seed, layer)` pairs give
 * unrelated lattices. `seed` is read as a 32-bit integer.
 */
export function noiseSalt(seed: number, layer: number): number {
  return Math.imul(seed, 0x9e_37_79_b1) ^ Math.imul(layer + 1, 0x63_2b_e5_ab);
}

/**
 * Value noise at lattice coordinates `(u, v, w)`: the eight corners of the
 * cell holding the point, blended along `u`, then `v`, then `w`. Exact on
 * lattice indices within int32, so space up to ~2·10⁹ steps from the origin.
 */
export function valueNoise3(
  salt: number,
  u: number,
  v: number,
  w: number,
): number {
  const fu = Math.floor(u);
  const fv = Math.floor(v);
  const fw = Math.floor(w);
  const tu = fade(u - fu);
  const tv = fade(v - fv);
  const tw = fade(w - fw);
  const layer = (iw: number) => {
    const a = hash3(fu, fv, iw, salt);
    const b = hash3(fu + 1, fv, iw, salt);
    const c = hash3(fu, fv + 1, iw, salt);
    const d = hash3(fu + 1, fv + 1, iw, salt);
    const bottom = a + (b - a) * tu;
    const top = c + (d - c) * tu;
    return bottom + (top - bottom) * tv;
  };
  const near = layer(fw);
  const far = layer(fw + 1);
  return near + (far - near) * tw;
}
