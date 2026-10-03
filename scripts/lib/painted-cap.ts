/**
 * Where the painter fills a mushroom's dome on the screen, read off what the
 * page holds rather than the scene's own hit test, so a tap aimed there tests
 * the hit test against what the child sees.
 */

import { z } from 'zod';

import {
  boxAround,
  containsPoint,
  distanceToEdge,
} from '../../src/pages/mushrooms/model/geometry.ts';
import {
  MUSHROOM_SPECIES,
  mushroomGenes,
} from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import {
  headOutlines,
  toCanvas,
} from '../../src/pages/mushrooms/model/mushroom-outline.ts';
import {
  capFrame,
  splayed,
} from '../../src/pages/mushrooms/model/mushroom-pose.ts';
import { placeOf } from '../../src/pages/mushrooms/ui/scene/clump-layout.ts';
import type { Camera, Point } from './mushroom-probe.ts';

/**
 * What the painter draws `id`'s dome from, as the page holds it: the
 * mushroom's seed, species and foot, the size it is painted at, the turn the
 * bed stood it at, and its graphics' transform onto the screen.
 */
export const painting = (id: string) => `(() => {
  const id = ${JSON.stringify(id)};
  const { graphics, size, turn } = __probe.scene.bed.shown.get(id);
  const { seed, species, foot, lean } = __probe.scene.meadow.mushrooms.find(
    (mushroom) => mushroom.id === id,
  );
  const { a, b, c, d, tx, ty } = graphics.getWorldTransformMatrix();
  const { scrollX, scrollY } = __probe.scene.cameras.main;
  return {
    seed,
    species,
    foot: { x: foot.x, y: foot.y },
    lean,
    size,
    turn,
    matrix: { a, b, c, d, tx: tx - scrollX, ty: ty - scrollY },
  };
})()`;
export const Painting = z.object({
  seed: z.number(),
  species: z.enum(MUSHROOM_SPECIES),
  foot: z.object({ x: z.number(), y: z.number() }),
  lean: z.union([z.literal(-1), z.literal(1)]),
  size: z.number(),
  turn: z.number(),
  matrix: z.object({
    a: z.number(),
    b: z.number(),
    c: z.number(),
    d: z.number(),
    tx: z.number(),
    ty: z.number(),
  }),
});

/** How many steps across its box the painted dome is searched for its deepest point. */
const DOME_GRID = 16;

/**
 * Where the painter fills `painted`'s dome on the screen, from the outline it
 * fills (`headOutlines` through `capFrame` and `toCanvas`, as
 * `mushroom-paint.ts` maps it) through the graphics' drawn transform: the
 * point of it farthest in from its edge, where a finger aimed at the cap
 * lands. Also the turn its genes stand at, to check against the bed's.
 */
export function paintedCap(
  painted: z.infer<typeof Painting>,
  camera: z.infer<typeof Camera>,
): { at: z.infer<typeof Point>; turn: number } {
  const { splay } = placeOf(camera, painted);
  const { genes, turn } = splayed(mushroomGenes(painted), splay);
  const cap = capFrame(genes);
  const canvas = toCanvas(painted.size);
  const { a, b, c, d, tx, ty } = painted.matrix;
  const [dome] = headOutlines(genes);
  const outline = dome
    .map((point) => canvas(cap(point)))
    .map(({ x, y }) => ({ x: a * x + c * y + tx, y: b * x + d * y + ty }));
  const { left, right, top, bottom } = boxAround(outline);
  let at = outline[0] ?? { x: 0, y: 0 };
  let deepest = -Infinity;
  for (let i = 0; i <= DOME_GRID; i++) {
    for (let j = 0; j <= DOME_GRID; j++) {
      const point = {
        x: left + ((right - left) * i) / DOME_GRID,
        y: top + ((bottom - top) * j) / DOME_GRID,
      };
      if (!containsPoint(outline, point)) continue;
      const depth = distanceToEdge(outline, point);
      if (depth > deepest) [at, deepest] = [point, depth];
    }
  }
  return { at, turn };
}
