/**
 * A bee, seen from above, head toward -y: a round fuzzy body in black and
 * yellow bands, a small dark head with bright eyes, and short legs, the
 * hind pair carrying pollen baskets that fill as it goes from flower to
 * flower.
 */

import type * as Phaser from 'phaser';

import type { BeeGenes } from '../../model/bee-genes';
import { type Point, sample } from '../../model/geometry';
import { POLLEN_MOST } from '../../model/pollen';
import { mix, nudgeHue } from './colour';
import { type BuzzParts, drawBuzzWings, paintLeg, SIDES } from './draw-buzz';
import { inkFor, scaled } from './draw-insect';
import { PALETTE } from './palette';
import {
  crescent,
  fillShape,
  ovalArc,
  strokeLine,
  strokeShape,
} from './shapes';

/** How many tufts the fuzz round the thorax and the abdomen stands in. */
const FUZZ_TUFTS = { thorax: 16, abdomen: 26 } as const;
const SHADE_ALPHA = 0.22;
/** How many veins a bee's small wing shows. */
export const BEE_VEINS = 2;

type Oval = Point & { rx: number; ry: number };

function anatomy({
  bodyLength: length,
  bodyWidth: width,
  headRadius,
}: BeeGenes) {
  const thorax = { x: 0, y: -length * 0.2, rx: width * 0.4, ry: length * 0.19 };
  return {
    head: { x: 0, y: thorax.y - thorax.ry - headRadius * 0.55, r: headRadius },
    thorax,
    abdomen: { x: 0, y: length * 0.13, rx: width / 2, ry: length * 0.33 },
  };
}

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
): void {
  const at = scaled(size);
  const ink = inkFor(size);
  const yellow = nudgeHue(PALETTE.beeYellows[genes.stripe], genes.hueNudge);
  const { head, thorax, abdomen } = anatomy(genes);

  // The stinger, under the abdomen's tail.
  const tail = abdomen.y + abdomen.ry;
  const sting = [
    { x: -abdomen.rx * 0.12, y: tail - 0.01 },
    { x: 0, y: tail + genes.bodyLength * 0.07 },
    { x: abdomen.rx * 0.12, y: tail - 0.01 },
  ].map((point) => at(point));
  graphics.fillStyle(PALETTE.beeBlack);
  fillShape(graphics, sting);

  // The abdomen: yellow and black bands, yellow first, the tail black.
  const outline = fuzzy(abdomen, genes.fuzz, FUZZ_TUFTS.abdomen).map((point) =>
    at(point),
  );
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
  const right = ovalArc(abdomen, [abdomen.rx, abdomen.ry], [-1.2, 1.4]).map(
    (point) => at(point),
  );
  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
  fillShape(graphics, crescent(right, at(abdomen), abdomen.rx * size * 0.5));
  graphics.fillStyle(PALETTE.highlight, 0.45);
  graphics.fillEllipse(
    (abdomen.x - abdomen.rx * 0.4) * size,
    (abdomen.y - abdomen.ry * 0.25) * size,
    abdomen.rx * size * 0.4,
    abdomen.ry * size * 0.55,
  );
  graphics.lineStyle(ink, PALETTE.ink);
  strokeShape(graphics, outline);

  // The thorax, all fuzz, a warm brown-gold.
  const chest = fuzzy(thorax, genes.fuzz * 1.6, FUZZ_TUFTS.thorax).map(
    (point) => at(point),
  );
  graphics.fillStyle(mix(yellow, PALETTE.beeBlack, 0.45));
  fillShape(graphics, chest);
  graphics.fillStyle(PALETTE.highlight, 0.3);
  graphics.fillEllipse(
    (thorax.x - thorax.rx * 0.3) * size,
    (thorax.y - thorax.ry * 0.3) * size,
    thorax.rx * size * 0.8,
    thorax.ry * size * 0.6,
  );
  graphics.lineStyle(ink, PALETTE.ink);
  strokeShape(graphics, chest);

  paintHead(graphics, size, head);
}

/** The head: small and dark, two short antennae, and two bright eyes looking up. */
function paintHead(
  graphics: Phaser.GameObjects.Graphics,
  size: number,
  head: Point & { r: number },
): void {
  const ink = inkFor(size);
  const r = head.r * size;
  const middle = { x: head.x * size, y: head.y * size };
  for (const side of SIDES) {
    const line = sample(0, 1, 6, (t) => ({
      x: middle.x + side * (r * 0.35 + r * 1.1 * t),
      y: middle.y - r * 0.6 - r * 1.5 * Math.sin((t * Math.PI) / 2.4),
    }));
    graphics.lineStyle(Math.max(1, ink * 0.8), PALETTE.ink);
    strokeLine(graphics, line);
    const club = line.at(-1);
    if (club) {
      graphics.fillStyle(PALETTE.ink);
      graphics.fillCircle(club.x, club.y, Math.max(1, r * 0.22));
    }
  }
  graphics.fillStyle(PALETTE.beeBlack);
  graphics.fillCircle(middle.x, middle.y, r);
  graphics.lineStyle(ink, PALETTE.ink);
  graphics.strokeCircle(middle.x, middle.y, r);
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
): void {
  const at = scaled(size);
  const ink = inkFor(size);
  const { thorax } = anatomy(genes);
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
      graphics.fillStyle(PALETTE.pollen);
      graphics.fillCircle(x, y, r);
      graphics.fillStyle(PALETTE.highlight, 0.6);
      graphics.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.35);
      graphics.lineStyle(Math.max(1, ink * 0.7), PALETTE.ink);
      graphics.strokeCircle(x, y, r);
    }
  }
}

/** Paints a bee `size` to its unit into its parts, its baskets as full as `specks`, its wings laid back. */
export function drawBee(
  parts: BuzzParts,
  genes: BeeGenes,
  size: number,
  specks: number,
): void {
  paintBeeLegs(parts.legs.clear(), genes, size, specks);
  paintBeeBody(parts.body.clear(), genes, size);
  drawBuzzWings(parts, genes, size, BEE_VEINS);
}
