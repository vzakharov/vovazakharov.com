/**
 * The hue, in degrees, of the gradient a tile without art is painted in: a
 * hash of the slug (FNV-1a), so a release keeps its colour on every page and
 * in either locale.
 */
export function tileHue(slug: string): number {
  let hash = 0x81_1c_9d_c5;

  for (const char of slug) {
    hash = Math.imul(hash ^ (char.codePointAt(0) ?? 0), 0x01_00_01_93) >>> 0;
  }

  return hash % 360;
}
