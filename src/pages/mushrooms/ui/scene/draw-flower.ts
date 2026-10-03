import type * as Phaser from 'phaser';

import { type FlowerGenes, flowerHead } from '../../model/flower-genes';
import { type Point, sample } from '../../model/geometry';
import { headedLight } from '../../model/light';
import { mix } from './colour';
import { BUD, type Folding, OPEN, petalPose } from './flower-closing';
import type { HeadReach } from './flower-seat';
import { petalColour } from './flower-tints';
import { facingArc, inkFor, type Lighting, TAPER } from './ink';
import { PALETTE } from './palette';
import type { Siding } from './repaint-queue';
import {
  crescent,
  fillShape,
  inkedDisc,
  inkedFill,
  paintCastShadow,
  petal,
  strokeLine,
  strokeTapered,
} from './shapes';

const STEM_STEPS = 16;
const PADDLE_STEPS = 18;
/** How much paler than the outer ring the inner ring is. */
const INNER_PALE = 0.45;
/** How squarely a petal's edge must face the light, or turn from it, to catch its rim light or its shade, and their alphas. */
const PETAL_FACING = 0.5;
const PETAL_RIM_ALPHA = 0.3;
const PETAL_SHADE_ALPHA = 0.2;
/** The stem's green line and the ink either side of it, in ink widths. */
const STEM_GREEN = 1.8;
const STEM_EDGE = 1.6;

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

/** A ring of petals: its reach as a share of the outer ring's, its turn from it, and its colour. */
type Ring = readonly [number, number, number];

function paintRing(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlowerGenes,
  size: number,
  [reach, turn, colour]: Ring,
  ink: number,
  lighting: Lighting,
  folded: Folding,
): void {
  const { toward } = lighting;
  const away = { x: -toward.x, y: -toward.y };
  const open = genes.petalLength * size * reach;
  const span = [genes.centre * size * 0.5, open] as const;
  const outline = genes.petal === 'pointed' ? petal : paddle;
  const width = open * genes.petalWidth * folded.width;
  const angles = Array.from(
    { length: genes.fold },
    (_, index) => genes.twist + turn + (index * Math.PI * 2) / genes.fold,
  );
  // Past halfway shut the petals overlap as a bud's do, the lower ones in front.
  const order =
    folded.closing < 0.5
      ? angles
      : angles.toSorted((one, other) => Math.sin(one) - Math.sin(other));
  for (const openAngle of order) {
    const pose = petalPose(openAngle, span, folded.closing);
    const shape = outline(...pose, width);
    inkedFill(graphics, shape, colour, ink, lighting);
    const [foot, angle, [, length]] = pose;
    const middle = {
      x: foot.x + Math.cos(angle) * length * 0.5,
      y: foot.y + Math.sin(angle) * length * 0.5,
    };
    for (const [facing, fill, alpha] of [
      [toward, PALETTE.rimLight, PETAL_RIM_ALPHA],
      [away, PALETTE.shadeCool, PETAL_SHADE_ALPHA],
    ] as const) {
      const edge = facingArc(shape, facing, PETAL_FACING);
      if (edge.length < 3) continue;
      graphics.fillStyle(fill, alpha);
      fillShape(graphics, crescent(edge, middle, width * 0.35));
    }
  }
}

/** A flower's ink width at `size`. */
const inkAt = (size: number): number => Math.max(1.5, size * 0.018);

/** Paints a flower's stem and leaf into `graphics`, its foot at the origin. */
export function paintFlowerStem(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlowerGenes,
  size: number,
  lighting: Lighting,
): void {
  const ink = inkAt(size);
  const top = flowerHead(genes, size);
  const line = sample(0, 1, STEM_STEPS, (t) => ({
    // A quadratic from the foot, rising upright before it bends.
    x: top.x * t * t,
    y: top.y * t,
  }));
  paintCastShadow(graphics, [size * 0.34, size * 0.06], lighting);
  const leafFoot = line[Math.round(genes.leafAt * STEM_STEPS)] ?? line[0];
  if (leafFoot) {
    const leaf = petal(
      leafFoot,
      -Math.PI / 2 + genes.leafSide * 1.05,
      [0, size * 0.3],
      size * 0.07,
    );
    inkedFill(graphics, leaf, PALETTE.leaf, ink, lighting);
  }
  // The ink either side of the green thins from the foot to the head.
  graphics.fillStyle(inkFor(PALETTE.flowerStem));
  strokeTapered(
    graphics,
    line,
    [ink * (STEM_GREEN + STEM_EDGE), ink * (STEM_GREEN + STEM_EDGE * TAPER)],
    lighting,
  );
  graphics.lineStyle(ink * STEM_GREEN, PALETTE.flowerStem);
  strokeLine(graphics, line);
}

/** Paints a flower's head into `graphics`, its middle at the origin, `folded` as far shut as that holds. */
export function paintFlowerHead(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlowerGenes,
  size: number,
  lighting: Lighting,
  folded: Folding = OPEN,
): void {
  const ink = inkAt(size);
  const outer = petalColour(genes);
  const rings: Ring[] = [[1, 0, outer]];
  if (genes.rings === 2) {
    const inner: Ring = [
      0.62,
      Math.PI / genes.fold,
      mix(outer, PALETTE.highlight, INNER_PALE),
    ] as const;
    // A bud's outer petals wrap its inner ones.
    if (folded.closing < 0.5) rings.push(inner);
    else rings.unshift(inner);
  }
  for (const ring of rings)
    paintRing(graphics, genes, size, ring, ink, lighting, folded);
  const centre = genes.centre * size * folded.disc;
  if (centre <= 0) return;
  const { toward } = lighting;
  inkedDisc(
    graphics,
    { x: 0, y: 0 },
    centre,
    PALETTE.flowerCentreDeep,
    ink,
    lighting,
  );
  graphics.fillStyle(PALETTE.flowerCentre);
  graphics.fillCircle(
    toward.x * centre * 0.2,
    toward.y * centre * 0.2,
    centre * 0.75,
  );
}

/**
 * Paints a flower into its two parts: `stem`, whose origin is the foot, and
 * `head`, which this moves to the stem's top so opening it scales the head
 * about its own centre, `folded` as far shut as that holds.
 */
export function drawFlower(
  { stem, head }: Record<'stem' | 'head', Phaser.GameObjects.Graphics>,
  genes: FlowerGenes,
  size: number,
  lighting: Lighting,
  folded: Folding,
): void {
  const top = flowerHead(genes, size);
  paintFlowerStem(stem.clear(), genes, size, lighting);
  paintFlowerHead(
    head.clear().setPosition(top.x, top.y),
    genes,
    size,
    lighting,
    folded,
  );
}

/**
 * Where insects perch on the head of a flower `folded` as far shut as that
 * holds, as `paintFlowerHead` draws it: its rim, below the middle, closing up
 * to the bud's foot, and its centre, above it, rising to the bud's tip.
 */
export function foldedHead(
  genes: FlowerGenes,
  size: number,
  { closing }: Folding,
): HeadReach {
  const { r } = flowerHead(genes, size);
  const along = (one: number, other: number) => one + (other - one) * closing;
  return {
    r: along(r, r * BUD.foot),
    disc: along(genes.centre * size, r * BUD.tip),
  };
}

/** A flower's paint: its light, how to draw it, and the sun side it was last painted at. */
export type FlowerPainting = {
  /**
   * Its light as the opening eye sees it from where it stands
   * (`flowerLight`), which `headedLight` turns by the heading into the light
   * it is painted in.
   */
  openingLight: Lighting;
  drawIn: (lighting: Lighting) => void;
} & Pick<Siding, 'paintedSunSide'>;

/**
 * Paints a flower as `painting` holds it, in its light from an eye facing
 * `heading`, and keeps the sun side it painted.
 */
export function paintFlowerLit(
  painting: FlowerPainting,
  heading: number,
): void {
  const lighting = headedLight(painting.openingLight, heading);
  painting.paintedSunSide = lighting.toward.x;
  painting.drawIn(lighting);
}
