import type * as Phaser from 'phaser';

import { type Point, sample } from '../../model/geometry';
import type { InsectGenes } from '../../model/insect-genes';
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
import { mix, nudgeHue } from './colour';
import { PALETTE } from './palette';
import { crescent, fillShape, strokeLine, strokeShape } from './shapes';

const SIDES: readonly Side[] = [-1, 1];
const SHADE_ALPHA = 0.2;
const SHINE_ALPHA = 0.4;
/** How far the hind wings' base goes toward the pattern, so the two pairs read apart. */
const HIND_TOWARD_PATTERN = 0.18;
/** The pale dots along a wing's edge band, and how far out along it they start. */
const EDGE_DOTS = 4;
const EDGE_DOTS_FROM = 0.5;

/** A butterfly's parts, each a graphics of its own so a wing beat only scales it. */
export type InsectParts = Record<
  'hind' | 'fore' | 'body',
  Phaser.GameObjects.Graphics
>;

/** From the outlines' units to pixels, for an insect `size` to its unit. */
function scaled(size: number): (point: Point) => Point {
  return ({ x, y }) => ({ x: x * size, y: y * size });
}

/** An ink line for an insect `size` across its unit, never under a hairline. */
function inkFor(size: number): number {
  return Math.max(1.5, size * 0.028);
}

function hues(genes: InsectGenes) {
  return {
    base: nudgeHue(PALETTE.butterflies[genes.colour], genes.hueNudge),
    pattern: nudgeHue(PALETTE.butterflies[genes.pattern], genes.patternNudge),
  };
}

/**
 * One pair of wings into `graphics`, both sides mirrored about its own
 * position, the body's middle: an edge band in the pattern's colour round
 * the base, pale dots along the band, the eye's concentric rings, a shade
 * along the trailing edge, a shine, and ink.
 */
export function paintWings(
  graphics: Phaser.GameObjects.Graphics,
  genes: InsectGenes,
  pair: WingPair,
  size: number,
): void {
  const at = scaled(size);
  const ink = inkFor(size);
  const { base: own, pattern } = hues(genes);
  const base = pair === 'hind' ? mix(own, pattern, HIND_TOWARD_PATTERN) : own;
  const breadth = genes[pair].breadth * size;
  for (const side of SIDES) {
    const outline = wingOutline(genes, pair, side).map((point) => at(point));
    graphics.fillStyle(pattern);
    fillShape(graphics, outline);
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
      const toward = inner[index] ?? edge;
      return {
        x: (edge.x * 3 + toward.x * 2) / 5,
        y: (edge.y * 3 + toward.y * 2) / 5,
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
    const innermost = (genes.eyes.at(-1) ?? 0) * breadth;
    graphics.fillStyle(PALETTE.highlight, 0.85);
    graphics.fillCircle(
      eye.x - innermost * 0.3,
      eye.y - innermost * 0.3,
      Math.max(1, innermost * 0.35),
    );

    const trailing = wingTrailingEdge(genes, pair, side).map((point) =>
      at(point),
    );
    graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
    fillShape(graphics, crescent(trailing, eye, breadth * 0.28));
    if (pair === 'fore') {
      const shine = at(eyeCentre(genes, pair, side));
      const root = outline[0] ?? shine;
      graphics.fillStyle(PALETTE.highlight, SHINE_ALPHA);
      graphics.fillEllipse(
        (shine.x + root.x * 2) / 3 - breadth * 0.08,
        (shine.y + root.y * 2) / 3 - breadth * 0.14,
        breadth * 0.34,
        breadth * 0.18,
      );
    }
    graphics.lineStyle(ink, PALETTE.ink);
    strokeShape(graphics, outline);
  }
}

/**
 * The body into `graphics`, about its own position: antennae with their
 * clubs, abdomen, thorax and head, each shaded and inked, a shine along the
 * back and two eyes looking up out of the head.
 */
export function paintBody(
  graphics: Phaser.GameObjects.Graphics,
  genes: InsectGenes,
  size: number,
): void {
  const at = scaled(size);
  const ink = inkFor(size);
  const { pattern } = hues(genes);
  for (const side of SIDES) {
    const line = antenna(genes, side).map((point) => at(point));
    graphics.lineStyle(ink, PALETTE.ink);
    strokeLine(graphics, line);
    const club = line.at(-1);
    if (club) {
      graphics.fillStyle(PALETTE.insectBody);
      graphics.fillCircle(club.x, club.y, genes.bodyWidth * size * 0.32);
      graphics.lineStyle(ink * 0.8, PALETTE.ink);
      graphics.strokeCircle(club.x, club.y, genes.bodyWidth * size * 0.32);
    }
  }
  const [head, thorax, abdomen] = bodyParts(genes).map((part) =>
    part.map((point) => at(point)),
  );
  for (const part of [abdomen, thorax, head]) {
    if (!part) continue;
    graphics.fillStyle(PALETTE.insectBody);
    fillShape(graphics, part);
    graphics.lineStyle(ink, PALETTE.ink);
    strokeShape(graphics, part);
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
  graphics.fillStyle(PALETTE.highlight, SHINE_ALPHA * 0.8);
  graphics.fillEllipse(
    -width * 0.15,
    -length * 0.22,
    width * 0.35,
    length * 0.16,
  );
  graphics.fillEllipse(
    -width * 0.12,
    length * 0.1,
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

/** Paints a butterfly `size` to its unit into its three parts, each about its own position. */
export function drawInsect(
  { hind, fore, body }: InsectParts,
  genes: InsectGenes,
  size: number,
): void {
  paintWings(hind.clear(), genes, 'hind', size);
  paintWings(fore.clear(), genes, 'fore', size);
  paintBody(body.clear(), genes, size);
}
