import type * as Phaser from 'phaser';

import type { FlowerGenes } from '../../model/flower-genes';
import type { Point } from '../../model/geometry';
import { mix } from './colour';
import { PALETTE } from './palette';
import { fillShape, petal, sample, strokeLine, strokeShape } from './shapes';

const STEM_STEPS = 16;
const PADDLE_STEPS = 18;
/** How much paler than the outer ring the inner ring is. */
const INNER_PALE = 0.45;

/** Where the head stands, relative to the foot, for a flower `size` tall. */
function headAt(genes: FlowerGenes, size: number): Point {
  return { x: genes.stemBend * size, y: -size };
}

/** A rounded petal: an oval from `from` to `to` out from `centre` along `angle`. */
function paddle(
  centre: Point,
  angle: number,
  [from, to]: readonly [number, number],
  halfWidth: number,
): Point[] {
  const mid = (from + to) / 2;
  const half = (to - from) / 2;
  const along = { x: Math.cos(angle), y: Math.sin(angle) };
  return sample(0, Math.PI * 2, PADDLE_STEPS, (t) => {
    const a = mid + half * Math.cos(t);
    // Narrower toward the centre, so the petals fan out of it.
    const b = halfWidth * Math.sin(t) * (0.75 + 0.25 * Math.cos(t));
    return {
      x: centre.x + along.x * a - along.y * b,
      y: centre.y + along.y * a + along.x * b,
    };
  }).slice(0, -1);
}

function paintRing(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlowerGenes,
  size: number,
  [reach, turn, colour]: readonly [number, number, number],
  ink: number,
): void {
  const length = genes.petalLength * size * reach;
  const span = [genes.centre * size * 0.5, length] as const;
  const outline = genes.petal === 'pointed' ? petal : paddle;
  const width = length * genes.petalWidth;
  for (let index = 0; index < genes.fold; index++) {
    const angle = genes.twist + turn + (index * Math.PI * 2) / genes.fold;
    const shape = outline({ x: 0, y: 0 }, angle, span, width);
    graphics.fillStyle(colour);
    fillShape(graphics, shape);
    graphics.lineStyle(ink, PALETTE.ink);
    strokeShape(graphics, shape);
  }
}

/**
 * Paints a flower into its two parts: `stem`, whose origin is the foot, and
 * `head`, which this moves to the stem's top so opening it scales the head
 * about its own centre. Returns the head's radius.
 */
export function drawFlower(
  { stem, head }: Record<'stem' | 'head', Phaser.GameObjects.Graphics>,
  genes: FlowerGenes,
  size: number,
): number {
  const ink = Math.max(1.5, size * 0.018);
  const top = headAt(genes, size);
  const line = sample(0, 1, STEM_STEPS, (t) => ({
    // A quadratic from the foot, rising upright before it bends.
    x: top.x * t * t,
    y: top.y * t,
  }));

  stem.clear();
  stem.fillStyle(PALETTE.groundShadow, 0.2);
  stem.fillEllipse(0, 0, size * 0.34, size * 0.06);
  const leafFoot = line[Math.round(genes.leafAt * STEM_STEPS)] ?? line[0];
  if (leafFoot) {
    const leaf = petal(
      leafFoot,
      -Math.PI / 2 + genes.leafSide * 1.05,
      [0, size * 0.3],
      size * 0.07,
    );
    stem.fillStyle(PALETTE.leaf);
    fillShape(stem, leaf);
    stem.lineStyle(ink, PALETTE.ink);
    strokeShape(stem, leaf);
  }
  stem.lineStyle(ink * 3.4, PALETTE.ink);
  strokeLine(stem, line);
  stem.lineStyle(ink * 1.8, PALETTE.flowerStem);
  strokeLine(stem, line);

  head.clear().setPosition(top.x, top.y);
  const outer = PALETTE.flowers[genes.colour];
  paintRing(head, genes, size, [1, 0, outer], ink);
  if (genes.rings === 2) {
    paintRing(
      head,
      genes,
      size,
      [0.62, Math.PI / genes.fold, mix(outer, PALETTE.highlight, INNER_PALE)],
      ink,
    );
  }
  const centre = genes.centre * size;
  head.fillStyle(PALETTE.flowerCentreDeep);
  head.fillCircle(0, 0, centre);
  head.fillStyle(PALETTE.flowerCentre);
  head.fillCircle(-centre * 0.15, -centre * 0.15, centre * 0.75);
  head.lineStyle(ink, PALETTE.ink);
  head.strokeCircle(0, 0, centre);
  return genes.petalLength * size;
}
