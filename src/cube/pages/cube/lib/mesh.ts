import type { Quad } from '@/cube/entities/world';

import { colourOf } from './palette';

/** Floats per vertex: position, normal, colour. */
export const VERTEX_FLOATS = 9;

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
  for (const { corners, normal, floor, surface } of quads) {
    const colour = colourOf(floor, surface);
    for (const corner of FAN) {
      out.set(corners[corner], at);
      out.set(normal, at + 3);
      out.set(colour, at + 6);
      at += VERTEX_FLOATS;
    }
  }
  return out;
}
