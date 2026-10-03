import type * as Phaser from 'phaser';

import { type Point, type Reach, sample } from '../../model/geometry';
import type { ButterflyGenes } from '../../model/insect-genes';
import { litCrest } from '../../model/insect-light';
import {
  ABDOMEN,
  antenna,
  bodyParts,
  eyeCentre,
  headOf,
  INNER_BREADTH,
  INNER_REACH,
  type Side,
  wingOutline,
  type WingPair,
  wingTrailingEdge,
} from '../../model/insect-outline';
import { proboscisLine } from '../../model/proboscis';
import { mix, nudgeHue } from './colour';
import { inkFor, type Lighting, lineInk, TAPER } from './ink';
import { PALETTE } from './palette';
import {
  crescent,
  fillShape,
  inkedDisc,
  inkedFill,
  strokeLine,
  strokeTapered,
} from './shapes';

const SIDES: readonly Side[] = [-1, 1];
const SHADE_ALPHA = 0.2;
const SHINE_ALPHA = 0.4;
/** How far the hind wings' base goes toward the pattern, so the two pairs read apart. */
const HIND_TOWARD_PATTERN = 0.18;
/** The pale dots along a wing's edge band, and how far out along it they start. */
const EDGE_DOTS = 4;
const EDGE_DOTS_FROM = 0.5;
/**
 * The proboscis's thickness, as a share of the ink line, so it reads as a
 * tube and never as a third antenna.
 */
const PROBOSCIS_THICKNESS = 1.8;
/** A reach under which the proboscis is tucked away out of sight. */
const PROBOSCIS_HIDDEN = 0.02;

/**
 * A butterfly's parts, each a graphics of its own so a wing beat only scales
 * it; the proboscis is repainted as it uncurls.
 */
export type InsectParts = Record<
  'hind' | 'fore' | 'body' | 'proboscis',
  Phaser.GameObjects.Graphics
>;

/** From the outlines' units to pixels, for an insect `size` to its unit. */
export function scaled(size: number): (point: Point) => Point {
  return ({ x, y }) => ({ x: x * size, y: y * size });
}

/** An ink line for an insect `size` across its unit, never under a hairline. */
export function insectInk(size: number): number {
  return Math.max(1.5, size * 0.028);
}

function hues(genes: ButterflyGenes) {
  return {
    base: nudgeHue(PALETTE.butterflies[genes.colour], genes.hueNudge),
    pattern: nudgeHue(PALETTE.butterflies[genes.pattern], genes.patternNudge),
  };
}

/** One pair of wings into `graphics`, both sides mirrored about its own position, the body's middle. */
export function paintWings(
  graphics: Phaser.GameObjects.Graphics,
  genes: ButterflyGenes,
  pair: WingPair,
  size: number,
  lighting: Lighting,
): void {
  const { toward, hairline } = lighting;
  const at = scaled(size);
  const ink = insectInk(size);
  const { base: own, pattern } = hues(genes);
  const base = pair === 'hind' ? mix(own, pattern, HIND_TOWARD_PATTERN) : own;
  const breadth = genes[pair].breadth * size;
  for (const side of SIDES) {
    const outline = wingOutline(genes, pair, side).map((point) => at(point));
    inkedFill(graphics, outline, pattern, ink, lighting);
    const inner = wingOutline(genes, pair, side, [
      INNER_REACH,
      INNER_BREADTH,
    ]).map((point) => at(point));
    graphics.fillStyle(base);
    fillShape(graphics, inner);

    // Pale dots along the band's outer half, on the leading side: the
    // outline runs out along the trailing side and back along the leading one.
    const steps = outline.length / 2;
    const band = sample(EDGE_DOTS_FROM, 0.92, EDGE_DOTS - 1, (u) => {
      const out = Math.round(u * steps);
      const index = out >= steps ? steps : 2 * steps - out;
      const edge = outline[index] ?? outline[0] ?? { x: 0, y: 0 };
      const within = inner[index] ?? edge;
      return {
        x: (edge.x * 3 + within.x * 2) / 5,
        y: (edge.y * 3 + within.y * 2) / 5,
      };
    });
    graphics.fillStyle(mix(pattern, PALETTE.highlight, 0.65));
    for (const dot of band) {
      graphics.fillCircle(dot.x, dot.y, breadth * 0.05);
    }

    const eye = at(eyeCentre(genes, pair, side));
    const rings = [
      PALETTE.wingEye,
      mix(pattern, PALETTE.highlight, 0.25),
      PALETTE.wingEye,
    ];
    for (const [index, radius] of genes.eyes.entries()) {
      graphics.fillStyle(rings[index % rings.length] ?? pattern);
      graphics.fillCircle(eye.x, eye.y, radius * breadth);
    }
    // A fine rim of light round the eye's outer ring, on the sun's side.
    const outer = (genes.eyes[0] ?? 0) * breadth - hairline;
    const sun = Math.atan2(toward.y, toward.x);
    graphics.lineStyle(hairline, PALETTE.rimLight, 0.9);
    strokeLine(
      graphics,
      sample(sun - 1, sun + 1, 8, (angle) => ({
        x: eye.x + outer * Math.cos(angle),
        y: eye.y + outer * Math.sin(angle),
      })),
    );
    const innermost = (genes.eyes.at(-1) ?? 0) * breadth;
    const glint = litCrest(toward, [innermost, innermost], 0.42);
    graphics.fillStyle(PALETTE.highlight, 0.85);
    graphics.fillCircle(
      eye.x + glint.x,
      eye.y + glint.y,
      Math.max(1, innermost * 0.35),
    );

    const trailing = wingTrailingEdge(genes, pair, side).map((point) =>
      at(point),
    );
    graphics.fillStyle(PALETTE.shadeCool, SHADE_ALPHA);
    fillShape(graphics, crescent(trailing, eye, breadth * 0.28));
    if (pair === 'fore') {
      const root = outline[0] ?? eye;
      const shine = litCrest(toward, [breadth, breadth], 0.16);
      graphics.fillStyle(PALETTE.rimLight, SHINE_ALPHA);
      graphics.fillEllipse(
        (eye.x + root.x * 2) / 3 + shine.x,
        (eye.y + root.y * 2) / 3 + shine.y,
        breadth * 0.34,
        breadth * 0.18,
      );
    }
  }
}

/** The body into `graphics`, antennae included, about its own position. */
export function paintBody(
  graphics: Phaser.GameObjects.Graphics,
  genes: ButterflyGenes,
  size: number,
  lighting: Lighting,
): void {
  const at = scaled(size);
  const ink = insectInk(size);
  const feelerInk = lineInk(PALETTE.insectBody);
  const { pattern } = hues(genes);
  for (const side of SIDES) {
    const line = antenna(genes, side).map((point) => at(point));
    graphics.fillStyle(feelerInk);
    strokeTapered(graphics, line, [ink, ink * TAPER], lighting);
    const club = line.at(-1);
    if (club) {
      const clubR = genes.bodyWidth * size * 0.32;
      inkedDisc(graphics, club, clubR, PALETTE.insectBody, ink * 0.8, lighting);
    }
  }
  const [head, thorax, abdomen] = bodyParts(genes).map((part) =>
    part.map((point) => at(point)),
  );
  for (const part of [abdomen, thorax, head]) {
    if (!part) continue;
    inkedFill(graphics, part, PALETTE.insectBody, ink, lighting);
  }
  // Rings round the abdomen in the pattern's colour, so the body is its wings' kin.
  const width = genes.bodyWidth * size;
  const length = genes.bodyLength * size;
  graphics.lineStyle(
    Math.max(1, ink * 0.7),
    mix(pattern, PALETTE.insectBody, 0.35),
  );
  for (const step of [-1, 0, 1]) {
    const y = length * (ABDOMEN.at + step * ABDOMEN.half * 0.33);
    const half = width * 0.4 * Math.sqrt(1 - (step * 0.33) ** 2);
    graphics.lineBetween(-half, y, half, y);
  }
  const { toward } = lighting;
  const chest = litCrest(toward, [width / 2, length * 0.1], 0.4);
  const belly = litCrest(toward, [width / 2, length * 0.2], 0.3);
  graphics.fillStyle(PALETTE.highlight, SHINE_ALPHA * 0.8);
  graphics.fillEllipse(
    chest.x,
    -length * 0.22 + chest.y,
    width * 0.35,
    length * 0.16,
  );
  graphics.fillEllipse(
    belly.x,
    length * 0.1 + belly.y,
    width * 0.28,
    length * 0.28,
  );

  const { x, y, r } = headOf(genes);
  for (const side of SIDES) {
    const eye = { x: (x + side * r * 0.45) * size, y: (y - r * 0.2) * size };
    graphics.fillStyle(PALETTE.highlight);
    graphics.fillCircle(eye.x, eye.y, r * size * 0.42);
    graphics.fillStyle(PALETTE.mouseEye);
    graphics.fillCircle(eye.x, eye.y - r * size * 0.12, r * size * 0.22);
  }
}

/** How far the proboscis is out, where it reaches in the body's frame, and which side it bows to (`proboscisLine`). */
export type Reaching = Reach & { nectar: Point; side: Side };

/** The proboscis into `graphics`, about the body's middle (`proboscisLine`). */
export function paintProboscis(
  graphics: Phaser.GameObjects.Graphics,
  genes: ButterflyGenes,
  size: number,
  { reach, nectar, side }: Reaching,
  lighting: Lighting,
): void {
  if (reach < PROBOSCIS_HIDDEN) return;
  const at = scaled(size);
  const line = proboscisLine(genes, reach, nectar, side).map((point) =>
    at(point),
  );
  const ink = insectInk(size);
  const { pattern } = hues(genes);
  const tube = ink * (PROBOSCIS_THICKNESS - 1);
  // The ink either side of the tube thins toward its tip.
  graphics.fillStyle(inkFor(pattern));
  strokeTapered(graphics, line, [tube + ink, tube + ink * TAPER], lighting);
  graphics.lineStyle(tube, pattern);
  strokeLine(graphics, line);
}

/** Paints a butterfly `size` to its unit into its parts, each about its own position. */
export function drawInsect(
  { hind, fore, body }: InsectParts,
  genes: ButterflyGenes,
  size: number,
  lighting: Lighting,
): void {
  paintWings(hind.clear(), genes, 'hind', size, lighting);
  paintWings(fore.clear(), genes, 'fore', size, lighting);
  paintBody(body.clear(), genes, size, lighting);
}
