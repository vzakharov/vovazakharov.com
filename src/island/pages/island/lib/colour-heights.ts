import { SHORE_TOP } from './land-colour';

/**
 * The grid's border vertices, counter-clockwise from the south-west corner:
 * the order `TileMesh` hangs its skirt in, one skirt vertex under each.
 */
export function borderWalk(grid: number): number[] {
  const last = grid - 1;
  const walk: number[] = [];
  for (let i = 0; i < last; i++) walk.push(i);
  for (let j = 0; j < last; j++) walk.push(j * grid + last);
  for (let i = last; i > 0; i--) walk.push(last * grid + i);
  for (let j = last; j > 0; j--) walk.push(j * grid);
  return walk;
}

/**
 * The heights a land tile is coloured by. The grid keeps its own. A skirt
 * hanging from ground above the shore takes its border's height all the way
 * down, so where a crack shows it, it shows the ground's colour rather than
 * every band between the ground and the sea floor; one hanging from the shore
 * keeps its own depth, so a skirt that wins a depth tie against the sea draws
 * as the sea.
 */
export function colourHeights(
  heights: Float32Array,
  grid: number,
): Float32Array<ArrayBuffer> {
  const out = new Float32Array(heights);
  for (const [n, top] of borderWalk(grid).entries()) {
    const height = heights[top];
    if (height === undefined) throw new RangeError(`no vertex ${top}`);
    if (height > SHORE_TOP) out[grid * grid + n] = height;
  }
  return out;
}
