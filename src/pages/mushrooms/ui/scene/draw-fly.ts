/**
 * A fly, seen from above, head toward -y: a stout dark body catching its
 * sheen, two big red eyes that make its face, and six fine legs, the front
 * pair rubbing.
 */

import type * as Phaser from 'phaser';

import type { FlyGenes } from '../../model/fly-genes';
import { ellipse, type Point } from '../../model/geometry';
import { litCrest } from '../../model/insect-light';
import { mix, nudgeHue } from './colour';
import { crescent } from './crescent';
import { type BuzzParts, drawBuzzWings, paintLeg, SIDES } from './draw-buzz';
import { insectInk, scaled } from './draw-insect';
import { awayAngle, type Lighting } from './ink';
import { PALETTE } from './palette';
import { fillShape, inkedDisc, inkedFill, ovalArc } from './shapes';

/** How far the body takes its sheen, and its shine the same sheen paled. */
const SHEEN = 0.42;
const SHINE = 0.55;
const SHADE_ALPHA = 0.3;
/** How far either way of the point turned full from the light an eye's depth reaches round it, in radians. */
const DEEP = Math.PI / 2 - 0.2;

/** Where the head, thorax and abdomen sit and how big each is, in the body's length and width. */
function anatomy({
  bodyLength: length,
  bodyWidth: width,
  eyeRadius,
}: FlyGenes) {
  const headR = width * 0.36;
  return {
    head: { x: 0, y: -length / 2 + eyeRadius * 0.9, r: headR },
    thorax: { x: 0, y: -length * 0.14, rx: width * 0.5, ry: length * 0.2 },
    abdomen: { x: 0, y: length * 0.17, rx: width * 0.46, ry: length * 0.31 },
  };
}

/** The fly's body into `graphics`, about its own position, the body's middle. */
export function paintFlyBody(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlyGenes,
  size: number,
  lighting: Lighting,
): void {
  const sun = lighting.toward;
  const away = awayAngle(sun);
  const at = scaled(size);
  const ink = insectInk(size);
  const sheen = nudgeHue(PALETTE.flySheens[genes.sheen], genes.hueNudge);
  const base = mix(PALETTE.flyBody, sheen, SHEEN);
  const { head, thorax, abdomen } = anatomy(genes);
  for (const part of [abdomen, thorax]) {
    const outline = ellipse(part, part.rx, part.ry).map((point) => at(point));
    inkedFill(graphics, outline, base, ink, lighting);
    // The shade along the side turned from the light.
    const shaded = ovalArc(
      part,
      [part.rx, part.ry],
      [away - Math.PI / 2, away + Math.PI / 2],
    ).map((point) => at(point));
    graphics.fillStyle(PALETTE.shadeCool, SHADE_ALPHA);
    fillShape(graphics, crescent(shaded, at(part), part.rx * size * 0.45));
    const shine = litCrest(sun, [part.rx, part.ry], 0.45);
    graphics.fillStyle(mix(sheen, PALETTE.highlight, SHINE), 0.8);
    graphics.fillEllipse(
      (part.x + shine.x) * size,
      (part.y + shine.y) * size,
      part.rx * size * 0.55,
      part.ry * size * 0.7,
    );
  }
  // The abdomen's segments.
  graphics.lineStyle(Math.max(1, ink * 0.6), PALETTE.ink, 0.55);
  for (const step of [0.1, 0.45]) {
    const y = abdomen.y + abdomen.ry * step;
    const half = abdomen.rx * Math.sqrt(1 - step ** 2) * 0.8;
    graphics.lineBetween(-half * size, y * size, half * size, y * size);
  }
  inkedDisc(graphics, at(head), head.r * size, base, ink, lighting);
  paintEyes(graphics, genes, size, head, lighting);
}

/** Two big red eyes either side of the head, each with its shine, so the fly has a face. */
function paintEyes(
  graphics: Phaser.GameObjects.Graphics,
  { eyeRadius }: FlyGenes,
  size: number,
  head: Point & { r: number },
  lighting: Lighting,
): void {
  const ink = insectInk(size);
  const r = eyeRadius * size;
  const sun = lighting.toward;
  const away = awayAngle(sun);
  const glint = litCrest(sun, [r, r], 0.42);
  const catchlight = litCrest(sun, [r, r], -0.3);
  for (const side of SIDES) {
    const eye = {
      x: (head.x + side * (head.r * 0.55 + eyeRadius * 0.45)) * size,
      y: (head.y - eyeRadius * 0.15) * size,
    };
    inkedDisc(graphics, eye, r, PALETTE.flyEye, ink, lighting);
    // Its depth, on the side turned from the light.
    const back = ovalArc(eye, [r, r], [away - DEEP, away + DEEP]);
    graphics.fillStyle(PALETTE.flyEyeDeep, 0.8);
    fillShape(graphics, crescent(back, eye, r * 0.4));
    graphics.fillStyle(PALETTE.highlight, 0.95);
    graphics.fillCircle(eye.x + glint.x, eye.y + glint.y, Math.max(1, r * 0.3));
    graphics.fillCircle(
      eye.x + catchlight.x,
      eye.y + catchlight.y,
      Math.max(0.6, r * 0.12),
    );
  }
}

/** `t` of the way from `a` to `b`. */
function toward(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * The legs into `graphics`, the front pair `rub` of the way from down and
 * apart (0) to raised and crossed before the head (1).
 */
export function paintFlyLegs(
  graphics: Phaser.GameObjects.Graphics,
  genes: FlyGenes,
  size: number,
  rub: number,
  lighting: Lighting,
): void {
  const at = scaled(size);
  const { thorax, head } = anatomy(genes);
  const reach = genes.legLength;
  for (const side of SIDES) {
    // Middle and hind pairs: out, and bent back at the knee.
    for (const [down, out, back] of [
      [0.2, 0.9, 0.2],
      [0.75, 0.7, 0.75],
    ] as const) {
      const hip = { x: side * thorax.rx * 0.6, y: thorax.y + thorax.ry * down };
      const knee = {
        x: hip.x + side * reach * out,
        y: hip.y + reach * (back - 0.35),
      };
      const foot = {
        x: knee.x + side * reach * 0.25,
        y: knee.y + reach * back,
      };
      paintLeg(
        graphics,
        [hip, knee, foot].map((point) => at(point)),
        size,
        lighting,
      );
    }
    // The front pair reaches forward beside the head, or up and across it.
    const hip = { x: side * thorax.rx * 0.5, y: thorax.y - thorax.ry * 0.6 };
    const down = {
      knee: { x: hip.x + side * reach * 0.7, y: hip.y - reach * 0.35 },
      foot: { x: hip.x + side * reach * 0.8, y: hip.y - reach * 1.05 },
    };
    const up = {
      knee: { x: side * reach * 0.45, y: head.y - reach * 0.1 },
      foot: { x: -side * reach * 0.12, y: head.y - head.r - reach * 0.55 },
    };
    paintLeg(
      graphics,
      [
        hip,
        toward(down.knee, up.knee, rub),
        toward(down.foot, up.foot, rub),
      ].map((point) => at(point)),
      size,
      lighting,
    );
  }
}

/** Paints a fly `size` to its unit into its parts, its legs down, its wings laid back. */
export function drawFly(
  parts: BuzzParts,
  genes: FlyGenes,
  size: number,
  lighting: Lighting,
): void {
  paintFlyLegs(parts.legs.clear(), genes, size, 0, lighting);
  paintFlyBody(parts.body.clear(), genes, size, lighting);
  drawBuzzWings(parts, genes, size, genes.veins, lighting);
}
