/**
 * A bee, seen from above, head toward -y: a round fuzzy body in black and
 * yellow bands, a small dark head with bright eyes, and short legs, the
 * hind pair carrying pollen baskets that fill as it goes from flower to
 * flower.
 */

import type * as Phaser from 'phaser';

import type { BeeGenes } from '../../model/bee-genes';
import { beeAnatomy, beeOutline, type Oval } from '../../model/bee-outline';
import { type Point, sample } from '../../model/geometry';
import { litCrest } from '../../model/insect-light';
import { POLLEN_MOST } from '../../model/pollen';
import { mix, nudgeHue } from './colour';
import { crescent } from './crescent';
import { type BuzzParts, drawBuzzWings, paintLeg, SIDES } from './draw-buzz';
import { insectInk, scaled } from './draw-insect';
import { awayAngle, inkFor, type Lighting, lineInk, TAPER } from './ink';
import { PALETTE } from './palette';
import {
  fillShape,
  inkedDisc,
  inkedFill,
  inkUnder,
  ovalArc,
  strokeTapered,
} from './shapes';

const SHADE_ALPHA = 0.26;
/** The ink round a bee's black bands, and the dark pen its feelers are drawn in. */
const BLACK_INK = inkFor(PALETTE.beeBlack);
const FEELER_INK = lineInk(PALETTE.beeBlack);
/** How many veins a bee's small wing shows. */
export const BEE_VEINS = 2;

/** The band of `oval` between `top` and `bottom`, across the whole of it. */
function band(oval: Oval, top: number, bottom: number): Point[] {
  const edge = (side: number) => (y: number) => {
    const across = 1 - ((y - oval.y) / oval.ry) ** 2;
    return { x: oval.x + side * oval.rx * Math.sqrt(Math.max(0, across)), y };
  };
  return [
    ...sample(top, bottom, 8, edge(1)),
    ...sample(bottom, top, 8, edge(-1)),
  ];
}

/** The bee's body into `graphics`, about its own position, the body's middle. */
export function paintBeeBody(
  graphics: Phaser.GameObjects.Graphics,
  genes: BeeGenes,
  size: number,
  lighting: Lighting,
): void {
  const { toward } = lighting;
  const at = scaled(size);
  const ink = insectInk(size);
  const yellow = nudgeHue(PALETTE.beeYellows[genes.stripe], genes.hueNudge);
  const { head, thorax, abdomen } = beeAnatomy(genes);
  const painted = beeOutline(genes);

  // The stinger, under the abdomen's tail.
  const tail = abdomen.y + abdomen.ry;
  graphics.fillStyle(PALETTE.beeBlack);
  fillShape(
    graphics,
    painted.sting.map((point) => at(point)),
  );

  // The abdomen: yellow and black bands, yellow first, the tail black, each
  // band edged in its own fill's ink: the black bands' ink laid over the
  // yellow's, and the yellow filled over both, so only the rim shows.
  const outline = painted.abdomen.map((point) => at(point));
  inkUnder(graphics, outline, inkFor(yellow), ink, lighting);
  const stripes = genes.bands * 2;
  const top = abdomen.y - abdomen.ry;
  const step = (abdomen.ry * 2) / stripes;
  const blacks: Point[][] = [];
  for (let index = 1; index < stripes; index += 2) {
    const from = top + step * index;
    // The last black band runs on to the tail, past the fuzz.
    const to =
      index === stripes - 1 ? tail + genes.fuzz * abdomen.ry : from + step;
    const stripe = band(
      { ...abdomen, rx: abdomen.rx * (1 + genes.fuzz * 0.5) },
      from,
      Math.min(to, tail),
    ).map((point) => at(point));
    inkUnder(graphics, stripe, BLACK_INK, ink, lighting);
    blacks.push(stripe);
  }
  graphics.fillStyle(yellow);
  fillShape(graphics, outline);
  graphics.fillStyle(PALETTE.beeBlack);
  for (const stripe of blacks) fillShape(graphics, stripe);
  const away = awayAngle(toward);
  const shaded = ovalArc(
    abdomen,
    [abdomen.rx, abdomen.ry],
    [away - 1.3, away + 1.3],
  ).map((point) => at(point));
  graphics.fillStyle(PALETTE.shadeCool, SHADE_ALPHA);
  fillShape(graphics, crescent(shaded, at(abdomen), abdomen.rx * size * 0.5));
  const shine = litCrest(toward, [abdomen.rx, abdomen.ry], 0.45);
  graphics.fillStyle(PALETTE.highlight, 0.45);
  graphics.fillEllipse(
    (abdomen.x + shine.x) * size,
    (abdomen.y + shine.y) * size,
    abdomen.rx * size * 0.4,
    abdomen.ry * size * 0.55,
  );

  // The thorax, all fuzz, a warm brown-gold.
  const chest = painted.chest.map((point) => at(point));
  inkedFill(
    graphics,
    chest,
    mix(yellow, PALETTE.beeBlack, 0.45),
    ink,
    lighting,
  );
  const fuzz = litCrest(toward, [thorax.rx, thorax.ry], 0.4);
  graphics.fillStyle(PALETTE.highlight, 0.3);
  graphics.fillEllipse(
    (thorax.x + fuzz.x) * size,
    (thorax.y + fuzz.y) * size,
    thorax.rx * size * 0.8,
    thorax.ry * size * 0.6,
  );

  paintHead(graphics, size, head, lighting);
}

/** The head: small and dark, two short antennae, and two bright eyes looking up. */
function paintHead(
  graphics: Phaser.GameObjects.Graphics,
  size: number,
  head: Point & { r: number },
  lighting: Lighting,
): void {
  const ink = insectInk(size);
  const r = head.r * size;
  const middle = { x: head.x * size, y: head.y * size };
  for (const side of SIDES) {
    const line = sample(0, 1, 6, (t) => ({
      x: middle.x + side * (r * 0.35 + r * 1.1 * t),
      y: middle.y - r * 0.6 - r * 1.5 * Math.sin((t * Math.PI) / 2.4),
    }));
    const width = Math.max(1, ink * 0.8);
    graphics.fillStyle(FEELER_INK);
    strokeTapered(graphics, line, [width, width * TAPER], lighting);
    const club = line.at(-1);
    if (club) {
      graphics.fillStyle(FEELER_INK);
      graphics.fillCircle(club.x, club.y, Math.max(1, r * 0.22));
    }
  }
  inkedDisc(graphics, middle, r, PALETTE.beeBlack, ink, lighting);
  for (const side of SIDES) {
    const eye = { x: middle.x + side * r * 0.45, y: middle.y - r * 0.15 };
    graphics.fillStyle(PALETTE.highlight);
    graphics.fillCircle(eye.x, eye.y, Math.max(1.2, r * 0.38));
    graphics.fillStyle(PALETTE.mouseEye);
    graphics.fillCircle(eye.x, eye.y - r * 0.08, Math.max(0.7, r * 0.2));
  }
  // A mouth's small smile under the eyes.
  graphics.lineStyle(Math.max(1, ink * 0.6), PALETTE.highlight, 0.8);
  graphics.beginPath();
  graphics.arc(middle.x, middle.y + r * 0.2, r * 0.3, 0.4, Math.PI - 0.4);
  graphics.strokePath();
}

/**
 * The legs into `graphics`, short and dark, and on the hind pair a pollen
 * basket each, as full as `specks` of `POLLEN_MOST`, none when empty.
 */
export function paintBeeLegs(
  graphics: Phaser.GameObjects.Graphics,
  genes: BeeGenes,
  size: number,
  specks: number,
  lighting: Lighting,
): void {
  const at = scaled(size);
  const ink = insectInk(size);
  const { thorax } = beeAnatomy(genes);
  const reach = genes.legLength;
  for (const side of SIDES) {
    for (const [down, out, back] of [
      [-0.5, 0.75, -0.5],
      [0.3, 0.95, 0.25],
      [0.95, 0.8, 0.9],
    ] as const) {
      const hip = { x: side * thorax.rx * 0.7, y: thorax.y + thorax.ry * down };
      const knee = {
        x: hip.x + side * reach * out,
        y: hip.y + reach * back * 0.6,
      };
      const foot = {
        x: knee.x + side * reach * 0.2,
        y: knee.y + reach * (0.35 + back * 0.4),
      };
      paintLeg(
        graphics,
        [hip, knee, foot].map((point) => at(point)),
        size,
        lighting,
      );
      if (down !== 0.95 || specks <= 0) continue;
      const basket = {
        x: (knee.x + foot.x) / 2,
        y: (knee.y + foot.y) / 2,
        r:
          genes.basket * Math.sqrt(Math.min(specks, POLLEN_MOST) / POLLEN_MOST),
      };
      const { x, y } = at(basket);
      const r = basket.r * size;
      inkedDisc(
        graphics,
        { x, y },
        r,
        PALETTE.pollen,
        Math.max(1, ink * 0.7),
        lighting,
      );
      const shine = litCrest(lighting.toward, [r, r], 0.42);
      graphics.fillStyle(PALETTE.highlight, 0.6);
      graphics.fillCircle(x + shine.x, y + shine.y, r * 0.35);
    }
  }
}

/** Paints a bee `size` to its unit into its parts, its baskets as full as `specks`, its wings laid back. */
export function drawBee(
  parts: BuzzParts,
  genes: BeeGenes,
  size: number,
  specks: number,
  lighting: Lighting,
): void {
  paintBeeLegs(parts.legs.clear(), genes, size, specks, lighting);
  paintBeeBody(parts.body.clear(), genes, size, lighting);
  drawBuzzWings(parts, genes, size, BEE_VEINS, lighting);
}
