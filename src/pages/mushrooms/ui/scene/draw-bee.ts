/**
 * A bee, seen from above, head toward -y: a round fuzzy body in black and
 * yellow bands, a small dark head with bright eyes, and short legs, the
 * hind pair carrying pollen baskets that fill as it goes from flower to
 * flower.
 */

import type * as Phaser from 'phaser';

import type { BeeGenes } from '../../model/bee-genes';
import { beeAnatomy, beeOutline, type Oval } from '../../model/bee-outline';
import { ellipse, type Point, sample } from '../../model/geometry';
import { POLLEN_MOST } from '../../model/pollen';
import { mix, nudgeHue } from './colour';
import { type BuzzParts, drawBuzzWings, paintLeg, SIDES } from './draw-buzz';
import { insectInk, scaled } from './draw-insect';
import { inkFor, type Lighting, litSide, TAPER } from './ink';
import { PALETTE } from './palette';
import {
  crescent,
  fillShape,
  inkUnder,
  ovalArc,
  strokeTapered,
} from './shapes';

const SHADE_ALPHA = 0.26;
/** A bee's ink: its black's own, near-black whatever it edges. */
const BEE_INK = inkFor(PALETTE.beeBlack);
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
  const lit = litSide(toward);
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

  // The abdomen: yellow and black bands, yellow first, the tail black.
  const outline = painted.abdomen.map((point) => at(point));
  inkUnder(graphics, outline, BEE_INK, ink, lighting);
  graphics.fillStyle(yellow);
  fillShape(graphics, outline);
  const stripes = genes.bands * 2;
  const top = abdomen.y - abdomen.ry;
  const step = (abdomen.ry * 2) / stripes;
  graphics.fillStyle(PALETTE.beeBlack);
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
    fillShape(graphics, stripe);
  }
  const away = Math.atan2(-toward.y, -toward.x);
  const shaded = ovalArc(
    abdomen,
    [abdomen.rx, abdomen.ry],
    [away - 1.3, away + 1.3],
  ).map((point) => at(point));
  graphics.fillStyle(PALETTE.shadeCool, SHADE_ALPHA);
  fillShape(graphics, crescent(shaded, at(abdomen), abdomen.rx * size * 0.5));
  graphics.fillStyle(PALETTE.highlight, 0.45);
  graphics.fillEllipse(
    (abdomen.x + lit * abdomen.rx * 0.4) * size,
    (abdomen.y - abdomen.ry * 0.25) * size,
    abdomen.rx * size * 0.4,
    abdomen.ry * size * 0.55,
  );

  // The thorax, all fuzz, a warm brown-gold.
  const chest = painted.chest.map((point) => at(point));
  inkUnder(graphics, chest, BEE_INK, ink, lighting);
  graphics.fillStyle(mix(yellow, PALETTE.beeBlack, 0.45));
  fillShape(graphics, chest);
  graphics.fillStyle(PALETTE.highlight, 0.3);
  graphics.fillEllipse(
    (thorax.x + lit * thorax.rx * 0.3) * size,
    (thorax.y - thorax.ry * 0.3) * size,
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
    graphics.fillStyle(BEE_INK);
    strokeTapered(graphics, line, [width, width * TAPER], lighting);
    const club = line.at(-1);
    if (club) {
      graphics.fillStyle(BEE_INK);
      graphics.fillCircle(club.x, club.y, Math.max(1, r * 0.22));
    }
  }
  inkUnder(graphics, ellipse(middle, r), BEE_INK, ink, lighting);
  graphics.fillStyle(PALETTE.beeBlack);
  graphics.fillCircle(middle.x, middle.y, r);
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
  const lit = litSide(lighting.toward);
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
      inkUnder(
        graphics,
        ellipse({ x, y }, r),
        inkFor(PALETTE.pollen),
        Math.max(1, ink * 0.7),
        lighting,
      );
      graphics.fillStyle(PALETTE.pollen);
      graphics.fillCircle(x, y, r);
      graphics.fillStyle(PALETTE.highlight, 0.6);
      graphics.fillCircle(x + lit * r * 0.3, y - r * 0.3, r * 0.35);
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
