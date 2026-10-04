/**
 * A bee's body as it is painted, seen from above, in units of its size, its
 * middle at the origin and its head toward -y: the painter fills these
 * outlines, and the sight measures how much of a flower a bee sitting on it
 * covers by the same ones.
 */

import { BEE_RANGES, type BeeGenes } from './bee-genes';
import { ellipse, type Point, sample } from './geometry';

export type Oval = Point & { rx: number; ry: number };

/** How many tufts the fuzz round the thorax and the abdomen stands in. */
const FUZZ_TUFTS = { thorax: 16, abdomen: 26 } as const;
/** How much further the thorax's fuzz stands off it than the abdomen's. */
const CHEST_FUZZ = 1.6;

/** The bee's head, thorax and abdomen, as the ovals its painter fills. */
export function beeAnatomy({
  bodyLength: length,
  bodyWidth: width,
  headRadius,
}: Pick<BeeGenes, 'bodyLength' | 'bodyWidth' | 'headRadius'>) {
  const thorax = { x: 0, y: -length * 0.2, rx: width * 0.4, ry: length * 0.19 };
  return {
    head: { x: 0, y: thorax.y - thorax.ry - headRadius * 0.55, r: headRadius },
    thorax,
    abdomen: { x: 0, y: length * 0.13, rx: width / 2, ry: length * 0.33 },
  };
}

/**
 * How far ahead of its middle any bee's face reaches, in units of its size:
 * the longest body under the biggest head.
 */
export const FACE_REACH = (() => {
  const { head } = beeAnatomy({
    bodyLength: BEE_RANGES.bodyLength[1],
    bodyWidth: BEE_RANGES.bodyWidth[1],
    headRadius: BEE_RANGES.headRadius[1],
  });
  return head.r - head.y;
})();

/** An oval's outline with its fuzz standing off it in `tufts` soft bumps, `fuzz` of its width out. */
function fuzzy(oval: Oval, fuzz: number, tufts: number): Point[] {
  return sample(0, Math.PI * 2, tufts * 4, (angle) => {
    const bump = 1 + fuzz * Math.abs(Math.sin((angle * tufts) / 2));
    return {
      x: oval.x + oval.rx * bump * Math.cos(angle),
      y: oval.y + oval.ry * bump * Math.sin(angle),
    };
  }).slice(0, -1);
}

/**
 * The bee's body as painted, each part a closed outline: the stinger under
 * the abdomen's tail, the abdomen and the thorax in their fuzz, and the head.
 */
export function beeOutline(genes: BeeGenes): {
  sting: Point[];
  abdomen: Point[];
  chest: Point[];
  head: Point[];
} {
  const { head, thorax, abdomen } = beeAnatomy(genes);
  const tail = abdomen.y + abdomen.ry;
  return {
    sting: [
      { x: -abdomen.rx * 0.12, y: tail - 0.01 },
      { x: 0, y: tail + genes.bodyLength * 0.07 },
      { x: abdomen.rx * 0.12, y: tail - 0.01 },
    ],
    abdomen: fuzzy(abdomen, genes.fuzz, FUZZ_TUFTS.abdomen),
    chest: fuzzy(thorax, genes.fuzz * CHEST_FUZZ, FUZZ_TUFTS.thorax),
    head: ellipse(head, head.r),
  };
}
