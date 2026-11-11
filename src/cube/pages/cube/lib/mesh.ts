import type { Facet, Quad } from '@/cube/entities/world';

import { colourOf } from './palette';

/** Floats per vertex: position, normal, colour. */
export const VERTEX_FLOATS = 9;

/** Floats per sign vertex: position, normal, texture coordinate. */
export const SIGN_VERTEX_FLOATS = 8;

/**
 * Each sign corner's texture coordinate: `signFacet` gives the bottom left
 * first, and a texture's rows run top down.
 */
const SIGN_UV = [
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
] as const;

/** Each quad's corners in the order of its two triangles. */
const FAN = [0, 1, 2, 0, 2, 3] as const;

/**
 * The vertex buffer for `quads`: two triangles each, every vertex its
 * position, normal and its room's colour, as float32 — the one place the
 * world's doubles narrow.
 */
export function pack(quads: readonly Quad[]): Float32Array<ArrayBuffer> {
  const out = new Float32Array(quads.length * FAN.length * VERTEX_FLOATS);
  let at = 0;
  for (const { corners, normal, n, surface } of quads) {
    const colour = colourOf(n, surface);
    for (const corner of FAN) {
      out.set(corners[corner], at);
      out.set(normal, at + 3);
      out.set(colour, at + 6);
      at += VERTEX_FLOATS;
    }
  }
  return out;
}

/** The vertex buffer for sign `facets`, as `pack`'s but textured. */
export function packSigns(facets: readonly Facet[]): Float32Array<ArrayBuffer> {
  const out = new Float32Array(facets.length * FAN.length * SIGN_VERTEX_FLOATS);
  let at = 0;
  for (const { corners, normal } of facets) {
    for (const corner of FAN) {
      out.set(corners[corner], at);
      out.set(normal, at + 3);
      out.set(SIGN_UV[corner], at + 6);
      at += SIGN_VERTEX_FLOATS;
    }
  }
  return out;
}
