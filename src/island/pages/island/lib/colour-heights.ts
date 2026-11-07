import { borderLoop } from '@/island/entities/terrain';

/**
 * The heights a tile is coloured by, `heights` being its ground's — the
 * land's own, or for a sea tile the floor beneath it, over the same lattice.
 * The grid keeps them, and every skirt takes its border's height all the way
 * down, so where a pinhole between tiles shows a skirt, it shows the colour of
 * the edge it hangs from.
 */
export function colourHeights(
  heights: Float32Array,
  grid: number,
): Float32Array<ArrayBuffer> {
  const out = new Float32Array(heights);
  for (const [n, top] of borderLoop(grid).entries()) {
    const height = heights[top];
    if (height === undefined) throw new RangeError(`no vertex ${top}`);
    out[grid * grid + n] = height;
  }
  return out;
}
