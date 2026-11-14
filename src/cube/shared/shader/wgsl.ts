import type { WithId } from '@/kernel/shared/typings';

import type { Rgb } from '../lib/colour';

/**
 * A piece of WGSL and the pieces it calls into. A floor's shader is assembled
 * from the pieces its theme reaches, so a floor compiles what it draws with
 * and nothing else.
 */
export type Wgsl = WithId & { listing: string; needs: readonly Wgsl[] };

export const wgsl = (id: string, listing: string, ...needs: Wgsl[]): Wgsl => ({
  id,
  listing,
  needs,
});

/** `rgb` as a WGSL `vec3f`, for a colour a piece holds as a constant. */
export const vec3f = (rgb: Rgb): string =>
  `vec3f(${rgb.map((channel) => channel.toFixed(4)).join(', ')})`;

/** `n` as a WGSL float literal. */
export const f32 = (n: number): string =>
  Number.isInteger(n) ? n.toFixed(1) : String(n);

/** `v` as a WGSL float vector of its own length, at full precision. */
export const vecf = (v: readonly number[]): string =>
  `vec${String(v.length)}f(${v.map((n) => f32(n)).join(', ')})`;

/**
 * The source of `roots` and everything they need, each piece once and after
 * what it needs. Two pieces sharing an id must be the same piece.
 */
export function assemble(roots: readonly Wgsl[]): string {
  const placed = new Map<string, Wgsl>();
  const visit = (piece: Wgsl): void => {
    const known = placed.get(piece.id);
    if (known !== undefined) {
      if (known !== piece) {
        throw new Error(`Two WGSL pieces are both named ${piece.id}`);
      }
      return;
    }
    for (const need of piece.needs) visit(need);
    placed.set(piece.id, piece);
  };
  for (const root of roots) visit(root);
  return [...placed.values()].map(({ listing }) => listing.trim()).join('\n\n');
}
